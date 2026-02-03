const express = require('express');
const fs = require('fs');
const path = require('path');
const { getOAuth2Client } = require('../google-client');
const tokenStore = require('../token-store');
const router = express.Router();

(async () => { try { await tokenStore.init(); } catch (e) { console.warn('tokenStore init failed', e); } })();

router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');
    const { tokens } = await oauth2Client.getToken(code);
    // Save tokens using tokenStore (init earlier)
    await tokenStore.saveTokens('gleyson.tokens', tokens);
    res.send(`<h2>Autorização concluída com sucesso</h2><p>Tokens salvos em storage local (dev).</p><p>Agora você pode fechar esta janela e voltar ao app. <a href="/">Voltar</a></p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro trocando código por tokens. Veja logs no servidor.');
  }
});

// Exchange code endpoint (useful for mobile apps that intercept the redirect and POST the code here)
router.post('/exchange', async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code in body' });
    const { tokens } = await oauth2Client.getToken(code);
    await tokenStore.saveTokens('gleyson.tokens', tokens);
    res.json({ ok: true });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'Erro trocando código por tokens', details: err?.response?.data || err.message });
  }
});

module.exports = router;
