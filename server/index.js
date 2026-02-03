const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure tmp uploads directory exists (used by multer)
const tmpUploads = path.join(__dirname, 'tmp_uploads');
if (!fs.existsSync(tmpUploads)) fs.mkdirSync(tmpUploads, { recursive: true });

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static web files (frontend)
app.use(express.static(path.join(__dirname, '..', 'web')));

// Routes
const authRoutes = require('./routes/auth');
const locationsRoutes = require('./routes/locations');

app.use('/auth', authRoutes);
app.use('/api/locations', locationsRoutes);

// Dev endpoint: view stored tokens (for debugging only)
app.get('/auth/tokens', async (req, res) => {
  try {
    const tokenStore = require('./token-store');
    await tokenStore.init();
    const t = await tokenStore.getTokens('gleyson.tokens');
    res.json({ ok: true, tokens: t || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Dev endpoint: force refresh tokens now (debug only)
app.post('/auth/refresh', async (req, res) => {
  try {
    const refresher = require('./token-refresher');
    await refresher.refreshNow();
    res.json({ ok: true, msg: 'Refresh attempted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Simple root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
});

// Start token refresher (optional, configurable via env)
const tokenRefresher = require('./token-refresher');
try { tokenRefresher.start(); } catch (e) { console.warn('Token refresher failed to start', e); }

app.listen(PORT, () => {
  console.log(`Gleyson backend listening on http://localhost:${PORT}`);
  console.log('Available routes: /auth/google  /auth/callback  /api/locations  /api/locations (POST)');
});
