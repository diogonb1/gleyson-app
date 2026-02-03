GLEYSON RELEASE PACKAGE

Inclui:
- app-release.aab (android/app/build/outputs/bundle/release/app-release.aab)
- pasta play-store/ (ícone, feature graphic, screenshots)
- play-store-listing.txt (descrição e metadados)
- web/politica.html (Política de Privacidade)
- server/upload-play.js (script para upload automatizado ao Play Console)

Instruções básicas para publicar manualmente (Play Console):
1. Acesse https://play.google.com/console
2. Crie um novo app (ou selecione o app existente) e escolha "Produção" -> "Criar nova release".
3. Faça upload do arquivo `app-release.aab` da pasta `release`.
4. Preencha a ficha (nome, descrição curta e completa; veja play-store-listing.txt para textos sugeridos).
5. Faça upload das imagens (screenshots) e ícone conforme as dimensões do Play Console.
6. Em "Política de privacidade" cole a URL pública da política (se você aceitar que eu hospede, eu vou publicar a política e te informo a URL).
7. Revisar e lançar para a track Production.

Instruções para o script automatizado:
- Coloque o JSON da Service Account em `server/play-sa.json`.
- Instale dependências: cd server && npm install googleapis yargs fs-extra
- Rode: node server/upload-play.js --aab ../android/app/build/outputs/bundle/release/app-release.aab --package com.gleyson.cabeleireiros --track production

Notas de segurança:
- Não compartilhe o Service Account em público. Guarde-o seguro e apague do repositório após uso se preferir.
