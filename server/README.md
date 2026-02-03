# Gleyson Backend (Google Business Profile Integration)

Este backend implementa um fluxo OAuth2 com Google e endpoints mínimos para criar locais via Business Profile API.

Setup rápido:

1. Crie um projeto no Google Cloud e habilite a API "Business Profile API".
2. Crie credenciais OAuth 2.0 (Client ID) e configure o redirect URI: `http://localhost:3000/auth/callback`.
3. Copie `.env.example` para `.env` e preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `REDIRECT_URI`.
4. Instale dependências:
   npm install
5. Inicie o servidor:
   npm run dev

Endpoints importantes:
- GET /auth/google -> redireciona para Google OAuth
- GET /auth/callback -> troca código por tokens e os armazena localmente
- POST /auth/exchange -> aceita `{ code }` (útil para apps mobile que interceptam o redirect e POSTam o code ao backend)
- GET /api/locations/accounts -> lista contas do Business Profile (útil para obter accountId)
- POST /api/locations -> cria um novo local (envie JSON, veja `web/admin.html`)
- POST /api/locations/:locationId/photos -> upload de fotos (multipart form-data, campo `photos`)

Notas sobre mobile (Capacitor):
- Configure um redirect URI custom como `gleyson://auth/callback` no Google Cloud e no arquivo `.env` (REDIRECT_URI).
- No app Capacitor, capture a URL via `App.addListener('appUrlOpen', ...)`, extraia `code` e chame `POST /auth/exchange` para armazenar tokens no backend.
- Use a página `web/capacitord-admin.html` como referência para implementar o botão nativo que abre `/auth/google`.

Notas:
- A verificação final do local (por correio/telefone) normalmente exige ações manuais.
- Em produção, armazene tokens de forma segura (vault, secret manager, banco de dados) e implemente refresh automático.

Exemplos rápidos

1) Criar um local (curl):

curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"locationName":"Minha Loja","primaryPhone":"+5511999999999","primaryCategory":{"displayName":"Barbearia"},"address":{"regionCode":"BR","addressLines":["Av Principal, 123"],"locality":"Cidade","administrativeArea":"MG","postalCode":"38442-192"}}'

2) Fazer upload de fotos (curl - multipart):

curl -X POST http://localhost:3000/api/locations/<LOCATION_ID>/photos \
  -F "photos=@./foto1.jpg" -F "photos=@./foto2.jpg"

3) Trocar código vindo do app mobile (exemplo):

POST http://localhost:3000/auth/exchange
Content-Type: application/json
{ "code": "4/0AX4XfW..." }

Observações finais
- Em produção, remova gravação de tokens em arquivo e utilize um cofre seguro ou banco de dados com refresh automático. Ex.: Secret Manager, Vault, ou DB criptografado.
- A implementação atual usa `node-persist` para armazenamento local durante desenvolvimento. Substitua por um armazenamento seguro em produção.
- O servidor inicia um **token refresher** que tenta renovar tokens automaticamente (configurável via `REFRESH_INTERVAL_MINUTES` e `REFRESH_BEFORE_EXPIRY_MINUTES` no `.env`).
- Endpoints de desenvolvimento úteis: `GET /auth/tokens` (ver tokens salvos) e `POST /auth/refresh` (forçar tentativa de refresh imediatamente).

Nativo (Android/iOS):
- Android: adicionado exemplo de <code>&lt;intent-filter&gt;</code> em <code>android/app/src/main/AndroidManifest.xml</code> para capturar `gleyson://auth/callback`.
- iOS: adicionado esquema `gleyson` no <code>ios/App/App/Info.plist</code> em `CFBundleURLTypes`.

Lembrete de segurança: estas alterações facilitam testes; revise e personalize os esquemas e registros de URI para produção e documente os redirect URIs no Google Cloud Console.
- A verificação final do perfil no Google pode requerer método manual (cartão postal) e não é contornada pela API.
