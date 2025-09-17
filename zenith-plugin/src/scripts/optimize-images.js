#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(process.cwd(), 'public', 'images');

async function convertToWebP(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .webp({ quality: 85, effort: 6 })
            .toFile(outputPath);

        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);

        console.log(`✅ Converted ${path.basename(inputPath)} - Size reduced by ${savings}%`);
        console.log(`   Original: ${(inputStats.size / 1024).toFixed(1)}KB → WebP: ${(outputStats.size / 1024).toFixed(1)}KB`);
    } catch (error) {
        console.error(`❌ Error converting ${inputPath}:`, error.message);
    }
}

async function optimizeImages() {
    console.log('🚀 Starting image optimization...\n');

    function processDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);

        items.forEach(async (item) => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();

                // Convert PNG files larger than 100KB to WebP
                if (ext === '.png' && stat.size > 100 * 1024) {
                    const webpPath = fullPath.replace(/\.png$/i, '.webp');
                    await convertToWebP(fullPath, webpPath);
                }

                // Convert large JPEG files to WebP
                if ((ext === '.jpg' || ext === '.jpeg') && stat.size > 100 * 1024) {
                    const webpPath = fullPath.replace(/\.(jpg|jpeg)$/i, '.webp');
                    await convertToWebP(fullPath, webpPath);
                }
            }
        });
    }

    processDirectory(imagesDir);
    console.log('\n✨ Image optimization complete!');
}

optimizeImages();
