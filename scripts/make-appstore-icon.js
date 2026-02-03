const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'app-store');
fs.mkdirSync(outDir, { recursive: true });

const logo = path.join(root, 'web', 'assets', 'brand', 'galeria-1.png');

(async () => {
  const size = 1024;
  const bg = { r: 244, g: 239, b: 233, alpha: 1 };
  const logoBuf = await sharp(logo)
    .resize({ width: Math.round(size * 0.7), height: Math.round(size * 0.7), fit: 'inside' })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'icon-1024.png'));
  console.log('app store icon updated');
})();
