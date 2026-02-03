/**
 * Script helper para upload ao Google Play Console usando service account JSON.
 * Uso:
 *  - coloque o JSON da Service Account em `server/play-sa.json`
 *  - instale dependências: npm install googleapis form-data fs-extra
 *  - rode: node server/upload-play.js --aab ../android/app/build/outputs/bundle/release/app-release.aab --package com.gleyson.cabeleireiros --track production
 *
 * ATENÇÃO: este script é um utilitário de conveniência para automação; faça testes na track internal antes de publicar em production.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;

async function main() {
  const saPath = path.join(__dirname, 'play-sa.json');
  if (!fs.existsSync(saPath)) {
    console.error('Service Account JSON not found at server/play-sa.json. Copie o arquivo e tente novamente.');
    process.exit(1);
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: saPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });

  const aabPath = path.resolve(argv.aab || argv._[0] || '../android/app/build/outputs/bundle/release/app-release.aab');
  if (!fs.existsSync(aabPath)) {
    console.error('AAB não encontrado em', aabPath);
    process.exit(1);
  }

  const packageName = argv.package || 'com.gleyson.cabeleireiros';
  const track = argv.track || 'production';

  const authClient = await auth.getClient();
  const publisher = google.androidpublisher({ version: 'v3', auth: authClient });

  try {
    // Create edit
    const edit = await publisher.edits.insert({ packageName });
    const editId = edit.data.id;
    console.log('Edit criado:', editId);

    // Upload AAB
    const aabFile = fs.createReadStream(aabPath);
    const upload = await publisher.edits.bundles.upload({
      packageName,
      editId,
      media: { mimeType: 'application/octet-stream', body: aabFile }
    });
    console.log('AAB enviado:', upload.data.sha1);

    // Assign to track
    const versionCodes = upload.data.versionCode ? [upload.data.versionCode] : upload.data.versionCodes;
    await publisher.edits.tracks.update({
      packageName,
      editId,
      track,
      requestBody: { track, releases: [{ name: 'Release via automation', status: 'completed', versionCodes }] }
    });
    console.log('Track atualizada:', track);

    // Commit
    await publisher.edits.commit({ packageName, editId });
    console.log('Edit commitado. Publicação solicitada.');
  } catch (err) {
    console.error('Erro no upload:', err?.errors || err.message || err);
    process.exit(1);
  }
}

main();