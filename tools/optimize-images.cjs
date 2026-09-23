#!/usr/bin/env node
'use strict';

// Rebuild the committed responsive images from the retained JPG originals.
// Run `npm ci` followed by `npm run optimize:images` from the repository root.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const ownerPhotoSources = require('./owner-photo-sources.json');

const root = path.resolve(__dirname, '..');
const imageDir = path.join(root, 'src', 'images');
const outputDir = path.join(imageDir, 'responsive');
const cardWidths = [480, 800, 1200];
const maxWidth = 1600;
const webpOptions = { quality: 78, effort: 6, smartSubsample: true };
// Provenance only: regeneration uses the optimized JPGs, so a sparse checkout
// does not need to download the large original camera files.
const rawOriginals = {
  'bilik-besar': 'IMG_7968.JPG',
  'bilik-dua-katil': 'IMG_7973.JPG',
  'bilik-keluarga': 'IMG_7997.JPG',
  'bilik-kusyen-biru': 'IMG_7977.JPG',
  'bilik-tidur': 'IMG_8001.JPG',
  dapur: 'IMG_8005.JPG',
  halaman: 'IMG_8012.JPG',
  'luar-rumah': 'IMG_8008.JPG',
  parking: 'IMG_8015.JPG',
  'porch-parking': 'IMG_8021.JPG',
  'ruang-makan': 'IMG_7991.JPG',
  'ruang-tamu': 'IMG_7988.JPG',
  'tangga-ruang-makan': 'IMG_7992.JPG',
};

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function writeIfChanged(filename, buffer) {
  try {
    if ((await fs.readFile(filename)).equals(buffer)) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.writeFile(filename, buffer);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const sourceNames = (await fs.readdir(imageDir))
    .filter((name) => /\.jpe?g$/i.test(name))
    .sort();
  if (!sourceNames.length) throw new Error('No JPG originals found in src/images/.');

  const manifest = {
    version: 1,
    generatedBy: 'tools/optimize-images.cjs',
    encoder: { sharp: sharp.versions.sharp, webp: sharp.versions.webp, ...webpOptions },
    maxWidth,
    images: [],
  };

  for (const name of sourceNames) {
    const input = await fs.readFile(path.join(imageDir, name));
    const metadata = await sharp(input).metadata();
    // EXIF orientations 5–8 interchange the display width and height.
    const rotated = [5, 6, 7, 8].includes(metadata.orientation);
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    if (!width || !height) throw new Error(`Cannot read dimensions of ${name}.`);
    const basename = path.parse(name).name;
    const widths = [...new Set([...cardWidths.filter((value) => value < width), Math.min(width, maxWidth)])]
      .filter((value) => value <= maxWidth)
      .sort((a, b) => a - b);
    const item = {
      source: `images/${name}`,
      ...(rawOriginals[basename] ? { originalCameraFile: `source-images/latest-raw/${rawOriginals[basename]}` } : {}),
      ...(ownerPhotoSources[basename] ? { ownerUpload: ownerPhotoSources[basename] } : {}),
      width,
      height,
      bytes: input.length,
      sha256: sha256(input),
      variants: [],
    };

    for (const targetWidth of widths) {
      const { data, info } = await sharp(input)
        .rotate()
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp(webpOptions)
        .toBuffer({ resolveWithObject: true });
      if (info.width > width || info.height > height) {
        throw new Error(`Unexpected image enlargement for ${name}.`);
      }
      const filename = `${basename}-${info.width}.webp`;
      await writeIfChanged(path.join(outputDir, filename), data);
      item.variants.push({
        src: `images/responsive/${filename}`,
        width: info.width,
        height: info.height,
        bytes: data.length,
        sha256: sha256(data),
      });
    }
    manifest.images.push(item);
    console.log(`${name}: ${width}x${height} -> ${item.variants.map((variant) => `${variant.width}w (${variant.bytes} B)`).join(', ')}`);
  }

  await writeIfChanged(
    path.join(outputDir, 'manifest.json'),
    Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
  );
  const variantCount = manifest.images.reduce((count, item) => count + item.variants.length, 0);
  console.log(`Generated ${variantCount} WebP variants from ${manifest.images.length} originals; no upscaling.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
