import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA and iOS PNG icons...');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  // 180x180 iOS apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // Maskable 512x512 (with 10% safe zone padding)
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
    }
  })
    .composite([{ input: innerIcon, top: 51, left: 51 }])
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  // Wide Screenshot (1280x720) for PWABuilder / Google Play
  await sharp('src/assets/images/hero_peaceful_sanctuary_1792226308483.jpg')
    .resize(1280, 720, { fit: 'cover' })
    .png()
    .toFile('public/screenshot-wide.png');

  // Mobile Screenshot (720x1280) for PWABuilder / Google Play
  await sharp('src/assets/images/topic_loneliness_serene_1792226326142.jpg')
    .resize(720, 1280, { fit: 'cover' })
    .png()
    .toFile('public/screenshot-mobile.png');

  console.log('Icons and screenshots generated successfully in /public!');
}

generate().catch(console.error);
