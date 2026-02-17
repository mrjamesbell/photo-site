#!/usr/bin/env node

/**
 * Photo Gallery Upload Script
 *
 * Uploads photos to Cloudflare R2 and updates metadata in KV
 * Automatically categorizes photos based on folder structure
 *
 * Usage:
 *   node upload-photos.js /path/to/photos
 *
 * Folder structure example:
 *   /path/to/photos/theatre/photo1.jpg
 *   /path/to/photos/travel/photo2.jpg
 *
 * Categories will be derived from folder names (theatre, travel, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const R2_BUCKET = 'photo-gallery';
const THUMBNAIL_WIDTH = 400;
const FULL_WIDTH = 2000;
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

// Get Cloudflare credentials from wrangler
function getCloudflareConfig() {
    try {
        const accountId = execSync('npx wrangler whoami 2>/dev/null | grep "Account ID" | awk \'{print $3}\'',
            { encoding: 'utf8' }).trim();

        if (!accountId) {
            throw new Error('Could not get Cloudflare account ID. Make sure you are logged in with: npx wrangler login');
        }

        return {
            accountId,
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        };
    } catch (error) {
        console.error('Error getting Cloudflare config:', error.message);
        process.exit(1);
    }
}

// Initialize S3 client for R2
function createR2Client(config) {
    // R2 credentials need to be created via Cloudflare dashboard
    // For now, we'll use wrangler r2 object put commands instead
    return null;
}

// Get all image files recursively with their categories
function getImageFiles(baseDir) {
    const images = [];

    function scanDirectory(dir, category = null) {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Use folder name as category
                const folderCategory = item.toLowerCase();
                scanDirectory(fullPath, folderCategory);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (SUPPORTED_FORMATS.includes(ext)) {
                    if (!category) {
                        console.warn(`⚠️  Skipping ${fullPath} - no category folder`);
                        continue;
                    }
                    images.push({
                        path: fullPath,
                        filename: item,
                        category: category,
                    });
                }
            }
        }
    }

    scanDirectory(baseDir);
    return images;
}

// Process and optimize image
async function processImage(imagePath, maxWidth) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Only resize if image is wider than maxWidth
    if (metadata.width > maxWidth) {
        return image
            .resize(maxWidth, null, { withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
    }

    // Just optimize without resizing
    return image.jpeg({ quality: 85 }).toBuffer();
}

// Upload file to R2 using wrangler
async function uploadToR2(buffer, key) {
    const tempFile = `/tmp/${path.basename(key)}`;
    fs.writeFileSync(tempFile, buffer);

    try {
        execSync(`npx wrangler r2 object put ${R2_BUCKET}/${key} --file="${tempFile}" --remote`, {
            stdio: 'inherit'
        });
        fs.unlinkSync(tempFile);
        return true;
    } catch (error) {
        console.error(`Failed to upload ${key}:`, error.message);
        fs.unlinkSync(tempFile);
        return false;
    }
}

// Get current metadata from KV
async function getMetadata() {
    try {
        const result = execSync(
            `npx wrangler kv key get "photo-metadata" --namespace-id=13ddd697c063474bb025876cf23cdab5 --remote`,
            { encoding: 'utf8' }
        );
        return JSON.parse(result);
    } catch (error) {
        // No metadata exists yet
        return { photos: [] };
    }
}

// Save metadata to KV
async function saveMetadata(metadata) {
    const tempFile = '/tmp/photo-metadata.json';
    fs.writeFileSync(tempFile, JSON.stringify(metadata, null, 2));

    try {
        execSync(
            `npx wrangler kv key put "photo-metadata" --path="${tempFile}" --namespace-id=13ddd697c063474bb025876cf23cdab5 --remote`,
            { stdio: 'inherit' }
        );
        fs.unlinkSync(tempFile);
        return true;
    } catch (error) {
        console.error('Failed to save metadata:', error.message);
        fs.unlinkSync(tempFile);
        return false;
    }
}

// Main upload process
async function uploadPhotos(sourceDir) {
    console.log('📸 Photo Gallery Upload Script');
    console.log('================================\n');

    // Validate source directory
    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Directory not found: ${sourceDir}`);
        process.exit(1);
    }

    // Get all images
    console.log(`📂 Scanning directory: ${sourceDir}\n`);
    const images = getImageFiles(sourceDir);

    if (images.length === 0) {
        console.log('❌ No images found in category folders');
        console.log('   Expected structure: /path/to/photos/[category]/image.jpg');
        process.exit(1);
    }

    console.log(`✅ Found ${images.length} images\n`);

    // Display summary by category
    const categoryCounts = images.reduce((acc, img) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
    }, {});

    console.log('Categories:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
        console.log(`  - ${cat}: ${count} photos`);
    });
    console.log('');

    // Get existing metadata
    console.log('📋 Loading existing metadata...');
    const metadata = await getMetadata();
    const existingIds = new Set(metadata.photos.map(p => p.id));

    // Process and upload each image
    let uploadedCount = 0;
    let skippedCount = 0;

    for (const image of images) {
        const imageId = `${image.category}-${path.parse(image.filename).name}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

        // Skip if already uploaded
        if (existingIds.has(imageId)) {
            console.log(`⏭️  Skipping ${image.filename} (already uploaded as ${imageId})`);
            skippedCount++;
            continue;
        }

        console.log(`\n📤 Processing: ${image.filename}`);
        console.log(`   Category: ${image.category}`);
        console.log(`   ID: ${imageId}`);

        try {
            // Process thumbnail
            console.log('   Creating thumbnail...');
            const thumbnailBuffer = await processImage(image.path, THUMBNAIL_WIDTH);
            const thumbnailKey = `thumbnails/${imageId}.jpg`;
            await uploadToR2(thumbnailBuffer, thumbnailKey);
            console.log('   ✅ Thumbnail uploaded');

            // Process full image
            console.log('   Creating optimized full image...');
            const fullBuffer = await processImage(image.path, FULL_WIDTH);
            const fullKey = `photos/${imageId}.jpg`;
            await uploadToR2(fullBuffer, fullKey);
            console.log('   ✅ Full image uploaded');

            // Add to metadata
            metadata.photos.push({
                id: imageId,
                category: image.category,
                thumbnailUrl: `https://photo-gallery-worker.jrbnz.workers.dev/api/image/${thumbnailKey}`,
                fullUrl: `https://photo-gallery-worker.jrbnz.workers.dev/api/image/${fullKey}`,
                uploadedAt: new Date().toISOString(),
            });

            uploadedCount++;
        } catch (error) {
            console.error(`   ❌ Error processing ${image.filename}:`, error.message);
        }
    }

    // Save updated metadata
    if (uploadedCount > 0) {
        console.log('\n💾 Saving metadata to KV...');
        await saveMetadata(metadata);
        console.log('✅ Metadata saved');
    }

    // Summary
    console.log('\n================================');
    console.log('📊 Upload Summary:');
    console.log(`   ✅ Uploaded: ${uploadedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📁 Total in gallery: ${metadata.photos.length}`);
    console.log('================================\n');
}

// Run if called directly
if (process.argv[1] === __filename) {
    const sourceDir = process.argv[2];

    if (!sourceDir) {
        console.error('Usage: node upload-photos.js /path/to/photos');
        console.error('\nExpected folder structure:');
        console.error('  /path/to/photos/');
        console.error('    ├── theatre/');
        console.error('    │   ├── photo1.jpg');
        console.error('    │   └── photo2.jpg');
        console.error('    └── travel/');
        console.error('        ├── photo1.jpg');
        console.error('        └── photo2.jpg');
        process.exit(1);
    }

    uploadPhotos(sourceDir).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { uploadPhotos };
