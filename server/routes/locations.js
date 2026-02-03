const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const { getOAuth2Client } = require('../google-client');
const router = express.Router();

const TOKENS_FILE = process.env.TOKENS_FILE || './tokens.json';
const upload = multer({ dest: path.join(__dirname, '..', '..', 'tmp_uploads') });

const tokenStore = require('../token-store');

async function readTokens() {
  await tokenStore.init();
  const tokens = await tokenStore.getTokens('gleyson.tokens');
  return tokens || null;
}

async function getAccessToken() {
  const tokens = await readTokens();
  if (!tokens) throw new Error('Tokens not found. Please authorize via /auth/google first.');
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Ensure tokens get refreshed when needed and persist new credentials
  // getAccessToken() will refresh if refresh_token available
  const at = await oauth2Client.getAccessToken();

  // Persist updated credentials if changed (e.g., new access_token/expiry)
  const current = oauth2Client.credentials || {};
  // Merge refresh_token from saved tokens if missing in current
  if (tokens.refresh_token && !current.refresh_token) current.refresh_token = tokens.refresh_token;
  await tokenStore.saveTokens('gleyson.tokens', current);

  return at.token;
}

router.get('/accounts', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const resp = await axios.get('https://businessprofile.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao listar contas', details: err?.response?.data || err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const preferredAccountId = process.env.BUSINESS_ACCOUNT_ID; // optional override

    // Get accountId if not provided
    let accountId = preferredAccountId;
    if (!accountId) {
      const accResp = await axios.get('https://businessprofile.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const accounts = accResp.data.accounts || [];
      if (accounts.length === 0) return res.status(400).json({ error: 'Nenhuma conta encontrada para o usuário.' });
      accountId = accounts[0].name.split('/').pop();
    }

    const url = `https://businessprofile.googleapis.com/v1/accounts/${accountId}/locations`;
    const body = req.body;

    const createResp = await axios.post(url, body, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(createResp.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao criar local', details: err?.response?.data || err.message });
  }
});

// Upload photos to a location
router.post('/:locationId/photos', upload.array('photos', 10), async (req, res) => {
  try {
    const { locationId } = req.params;
    if (!locationId) return res.status(400).json({ error: 'locationId é obrigatório na rota' });

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ error: 'Nenhuma foto enviada (campo `photos`)'});

    const accessToken = await getAccessToken();
    const preferredAccountId = process.env.BUSINESS_ACCOUNT_ID;

    // Determine accountId
    let accountId = preferredAccountId;
    if (!accountId) {
      const accResp = await axios.get('https://businessprofile.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const accounts = accResp.data.accounts || [];
      if (accounts.length === 0) return res.status(400).json({ error: 'Nenhuma conta encontrada para o usuário.' });
      accountId = accounts[0].name.split('/').pop();
    }

    const results = [];

    for (const file of files) {
      const uploadUrl = `https://businessprofile.googleapis.com/upload/v1/accounts/${accountId}/locations/${locationId}/media?uploadType=media`;
      const stream = fs.createReadStream(file.path);
      try {
        const r = await axios.post(uploadUrl, stream, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': file.mimetype
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        results.push(r.data);
      } catch (err) {
        console.error('Erro upload foto', err?.response?.data || err.message);
        results.push({ error: err?.response?.data || err.message });
      } finally {
        // remove temp file
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      }
    }

    res.json({ results });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao fazer upload de fotos', details: err?.response?.data || err.message });
  }
});

module.exports = router;
