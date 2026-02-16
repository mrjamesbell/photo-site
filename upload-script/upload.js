#!/usr/bin/env node

/**
 * Photo Upload Script
 * Uploads photos to Cloudflare R2 with automatic resizing and metadata management
 *
 * Usage: node upload.js --category theatre --source ./path/to/photos
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Configuration
const CONFIG = {
    thumbnailMaxSize: 400,
    webMaxSize: 1920,
    thumbnailQuality: 80,
    webQuality: 85,
    validExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        options[key] = value;
    }

    if (!options.category || !options.source) {
        console.error('Usage: node upload.js --category <category> --source <path>');
        console.error('Example: node upload.js --category theatre --source ./exports/theatre-2026');
        process.exit(1);
    }

    return options;
}

// Initialize S3 client for R2
function initializeR2Client() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        console.error('Missing required environment variables:');
        console.error('- CLOUDFLARE_ACCOUNT_ID');
        console.error('- R2_ACCESS_KEY_ID');
        console.error('- R2_SECRET_ACCESS_KEY');
        process.exit(1);
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

// Process a single image
async function processImage(imagePath, category) {
    const filename = path.basename(imagePath);
    const ext = path.extname(filename).toLowerCase();

    if (!CONFIG.validExtensions.includes(ext)) {
        console.log(`  ⏭️  Skipping ${filename} (unsupported format)`);
        return null;
    }

    console.log(`  📸 Processing ${filename}...`);

    try {
        // Read original image
        const imageBuffer = await fs.readFile(imagePath);
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        // Generate unique ID
        const id = uuidv4();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const baseFilename = path.parse(sanitizedFilename).name;
        const webFilename = `${baseFilename}.jpg`;
        const thumbFilename = `${baseFilename}-thumb.jpg`;

        // Generate web version (1920px max)
        const webBuffer = await image
            .resize(CONFIG.webMaxSize, CONFIG.webMaxSize, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: CONFIG.webQuality })
            .toBuffer();

        // Generate thumbnail (400px max)
        const thumbBuffer = await image
            .resize(CONFIG.thumbnailMaxSize, CONFIG.thumbnailMaxSize, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: CONFIG.thumbnailQuality })
            .toBuffer();

        // Get final dimensions
        const webImage = sharp(webBuffer);
        const webMetadata = await webImage.metadata();

        return {
            id,
            filename: webFilename,
            category,
            uploadDate: new Date().toISOString(),
            width: webMetadata.width,
            height: webMetadata.height,
            webBuffer,
            thumbBuffer,
            webPath: `photos/${category}/${webFilename}`,
            thumbPath: `photos/${category}/${thumbFilename}`,
            webSize: webBuffer.length,
            thumbSize: thumbBuffer.length,
        };
    } catch (error) {
        console.error(`  ❌ Error processing ${filename}:`, error.message);
        return null;
    }
}

// Upload to R2
async function uploadToR2(client, bucketName, path, buffer, contentType = 'image/jpeg') {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: path,
        Body: buffer,
        ContentType: contentType,
    });

    await client.send(command);
}

// Update metadata in KV (via API)
async function updateMetadata(newPhotos) {
    const kvNamespaceId = process.env.KV_NAMESPACE_ID;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!kvNamespaceId || !accountId || !apiToken) {
        console.error('Missing KV configuration. Photos uploaded but metadata not updated.');
        console.error('Required: KV_NAMESPACE_ID, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN');
        return;
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/photo-metadata`;

    // Fetch existing metadata
    let existingPhotos = [];
    try {
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
            },
        });

        if (getResponse.ok) {
            const data = await getResponse.json();
            existingPhotos = data.photos || [];
        }
    } catch (error) {
        console.log('  ℹ️  No existing metadata found, creating new');
    }

    // Merge and update
    const allPhotos = [...existingPhotos, ...newPhotos];
    const metadata = { photos: allPhotos };

    const putResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });

    if (!putResponse.ok) {
        throw new Error(`Failed to update metadata: ${putResponse.statusText}`);
    }

    // Initialize click counts to 0
    for (const photo of newPhotos) {
        const clickUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/clicks-${photo.id}`;
        await fetch(clickUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
            },
            body: '0',
        });
    }

    console.log('  ✅ Metadata updated in Workers KV');
}

// Main execution
async function main() {
    console.log('🚀 Photo Upload Script\n');

    const options = parseArgs();
    const { category, source } = options;

    console.log(`📁 Category: ${category}`);
    console.log(`📂 Source: ${source}\n`);

    // Initialize R2 client
    const r2Client = initializeR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || 'photos';
    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    // Get list of images
    const files = await fs.readdir(source);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.validExtensions.includes(ext);
    });

    console.log(`📊 Found ${imageFiles.length} images to process\n`);

    const uploadedPhotos = [];

    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`[${i + 1}/${imageFiles.length}] ${file}`);

        const imagePath = path.join(source, file);
        const processed = await processImage(imagePath, category);

        if (!processed) {
            continue;
        }

        // Upload web version
        console.log(`  ⬆️  Uploading web version (${(processed.webSize / 1024).toFixed(0)}KB)...`);
        await uploadToR2(r2Client, bucketName, processed.webPath, processed.webBuffer);

        // Upload thumbnail
        console.log(`  ⬆️  Uploading thumbnail (${(processed.thumbSize / 1024).toFixed(0)}KB)...`);
        await uploadToR2(r2Client, bucketName, processed.thumbPath, processed.thumbBuffer);

        // Prepare metadata
        const photoMetadata = {
            id: processed.id,
            filename: processed.filename,
            category: processed.category,
            uploadDate: processed.uploadDate,
            width: processed.width,
            height: processed.height,
            thumbnailUrl: `${r2PublicUrl}/${processed.thumbPath}`,
            fullUrl: `${r2PublicUrl}/${processed.webPath}`,
        };

        uploadedPhotos.push(photoMetadata);
        console.log(`  ✅ Uploaded successfully\n`);
    }

    // Update metadata
    if (uploadedPhotos.length > 0) {
        console.log('📝 Updating metadata...');
        await updateMetadata(uploadedPhotos);
        console.log(`\n✨ Successfully uploaded ${uploadedPhotos.length} photos!`);
    } else {
        console.log('⚠️  No photos were uploaded');
    }
}

// Run the script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
