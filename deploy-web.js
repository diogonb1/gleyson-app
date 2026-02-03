/**
 * Script de Deploy Automático (Versão Simplificada)
 * 
 * Este script foi movido para a raiz do projeto para simplificar a execução.
 * Ele usa o serviço Surge.sh para hospedar o site estático da pasta /web.
 * 
 * Uso:
 * 1. Certifique-se de ter Node.js instalado.
 * 2. Rode o comando: node deploy-web.js
 * 3. Na primeira vez, digite um email e senha para criar conta no Surge (grátis).
 */

const { execSync } = require('child_process');
const path = require('path');

// Caminho da pasta web (a partir da raiz do projeto)
const webDir = path.resolve(__dirname, 'web');

// Define um domínio fixo para o site.
// Se este domínio já estiver em uso, o Surge pedirá para você escolher outro na linha de comando.
const domain = `gleyson-cabeleireiros-app.surge.sh`;

console.log('=== Iniciando Deploy Automático ===');
console.log(`Pasta do site: ${webDir}`);
console.log(`Domínio alvo: ${domain}`);
console.log('-----------------------------------');

try {
  execSync(`npx surge "${webDir}" "${domain}"`, { stdio: 'inherit' });
  
  console.log('-----------------------------------');
  console.log('✅ Site publicado com sucesso!');
  console.log(`🌍 Acesse o site em: http://${domain}`);
} catch (err) {
  console.error('❌ Erro ao publicar o site. Verifique se a pasta "web" existe e contém arquivos.');
}