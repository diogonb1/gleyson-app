const storage = require('node-persist');

async function init() {
  await storage.init({ dir: 'persist_storage', forgiveParseErrors: true });
}

async function saveTokens(key, tokens) {
  if (!key) key = 'gleyson.tokens';
  await storage.setItem(key, tokens);
}

async function getTokens(key) {
  if (!key) key = 'gleyson.tokens';
  return await storage.getItem(key);
}

async function removeTokens(key) {
  if (!key) key = 'gleyson.tokens';
  await storage.removeItem(key);
}

module.exports = { init, saveTokens, getTokens, removeTokens };