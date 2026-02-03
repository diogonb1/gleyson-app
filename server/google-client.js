const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or REDIRECT_URI in .env');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

module.exports = { getOAuth2Client };
