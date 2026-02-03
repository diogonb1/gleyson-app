// Minimal Capacitor-oriented OAuth helper. When running inside Capacitor native app
// the app should be configured to handle the custom redirect URI (e.g. gleyson://auth/callback)
// and will receive the final redirect with ?code=...; the code is then POSTed to /auth/exchange.

import { App } from 'https://cdn.jsdelivr.net/npm/@capacitor/app/dist/esm/index.mjs';
import { Browser } from 'https://cdn.jsdelivr.net/npm/@capacitor/browser/dist/esm/index.mjs';

const log = (txt) => document.getElementById('log').textContent += txt + '\n';

document.getElementById('authorize').addEventListener('click', async () => {
  try {
    // Open the server's /auth/google route; server will redirect to the redirect URI configured in Google Cloud
    await Browser.open({ url: 'http://localhost:3000/auth/google' });
    log('Navegador aberto para autenticação. Aguarde o retorno.');
  } catch (err) {
    log('Erro abrindo navegador: ' + err.message);
  }
});

// Listen for the app URL open event (works in Capacitor native). When the app is opened via the redirect URI
// the event includes the URL where we can parse the `code` param.
App.addListener('appUrlOpen', async (data) => {
  try {
    const url = new URL(data.url);
    const code = url.searchParams.get('code');
    if (!code) {
      log('Nenhum code encontrado na URL');
      return;
    }
    log('Code recebido. Enviando para /auth/exchange');
    const resp = await fetch('http://localhost:3000/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const j = await resp.json();
    if (j.ok) log('Autorização concluída no backend. Tokens salvos.');
    else log('Resposta: ' + JSON.stringify(j));
  } catch (err) {
    log('Erro no appUrlOpen handler: ' + err.message);
  }
});

// Fallback for web (not Capacitor) to show how to exchange code: if a redirect lands on the web page
// (e.g., REDIRECT_URI configured as http://localhost:3000/auth/callback) then the server handles storing tokens.
