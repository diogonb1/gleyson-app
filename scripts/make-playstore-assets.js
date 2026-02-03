const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'play-store');
fs.mkdirSync(outDir, { recursive: true });

const logo = path.join(root, 'web', 'assets', 'brand', 'galeria-1.png');
const hero = path.join(root, 'web', 'assets', 'brand', 'salao-interno.jpg');

async function makeIcon() {
  const size = 512;
  const bg = { r: 244, g: 239, b: 233, alpha: 1 };
  const logoBuf = await sharp(logo)
    .resize({ width: Math.round(size * 0.7), height: Math.round(size * 0.7), fit: 'inside' })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));
}

async function makeBanner() {
  const width = 1024;
  const height = 500;
  const bg = await sharp(hero)
    .resize({ width, height, fit: 'cover' })
    .modulate({ brightness: 0.85, saturation: 1.05 })
    .toBuffer();

  const overlay = Buffer.from(
    `<svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="rgba(91,46,46,0.85)"/>
          <stop offset="1" stop-color="rgba(91,46,46,0.05)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <text x="72" y="210" font-family="Playfair Display, serif" font-size="48" fill="#ffffff" font-weight="700">Gleyson Cabeleireiros</text>
      <text x="72" y="270" font-family="Source Sans 3, sans-serif" font-size="22" fill="#f4efe9" letter-spacing="1.5">Rafaela Bruna Concept</text>
      <text x="72" y="320" font-family="Source Sans 3, sans-serif" font-size="18" fill="#f4efe9">Beleza premium em Araguari-MG</text>
    </svg>`
  );

  await sharp(bg)
    .composite([{ input: overlay, gravity: 'west' }])
    .png()
    .toFile(path.join(outDir, 'feature-graphic-1024x500.png'));
}

(async () => {
  await makeIcon();
  await makeBanner();
  console.log('play store assets updated');
})();
