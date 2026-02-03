const { getOAuth2Client } = require('./google-client');
const tokenStore = require('./token-store');

const REFRESH_INTERVAL_MINUTES = parseInt(process.env.REFRESH_INTERVAL_MINUTES || '60', 10);
const REFRESH_BEFORE_EXPIRY_MINUTES = parseInt(process.env.REFRESH_BEFORE_EXPIRY_MINUTES || '5', 10);

let interval = null;

async function checkAndRefresh() {
  try {
    await tokenStore.init();
    const tokens = await tokenStore.getTokens('gleyson.tokens');
    if (!tokens) {
      // nothing to do
      return;
    }
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const expiry = oauth2Client.credentials.expiry_date || tokens.expiry_date || 0;
    const now = Date.now();
    const threshold = now + REFRESH_BEFORE_EXPIRY_MINUTES * 60 * 1000;

    if (expiry && expiry > now && expiry > threshold) {
      // not close to expiry
      return;
    }

    // Attempt to refresh/get a fresh access token
    const at = await oauth2Client.getAccessToken();

    // Persist updated credentials (include refresh_token if present)
    const current = oauth2Client.credentials || {};
    if (tokens.refresh_token && !current.refresh_token) current.refresh_token = tokens.refresh_token;
    await tokenStore.saveTokens('gleyson.tokens', current);
    console.log('[token-refresher] Tokens refreshed and saved.');
  } catch (err) {
    console.error('[token-refresher] error refreshing tokens:', err?.message || err);
  }
}

async function refreshNow() {
  await checkAndRefresh();
}

function start() {
  if (interval) return;
  // Run once immediately
  checkAndRefresh();
  interval = setInterval(checkAndRefresh, REFRESH_INTERVAL_MINUTES * 60 * 1000);
  console.log(`[token-refresher] started: interval ${REFRESH_INTERVAL_MINUTES} minutes, refresh before expiry ${REFRESH_BEFORE_EXPIRY_MINUTES} minutes`);
}

function stop() {
  if (!interval) return;
  clearInterval(interval);
  interval = null;
}

module.exports = { start, stop, refreshNow };
