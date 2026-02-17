import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const R2_BUCKET = 'photo-gallery';
const baseDir = '/Users/jamesb/Projects/Photo Site/public/images/placeholders';
const THUMBNAIL_WIDTH = 400;
const FULL_WIDTH = 2000;

async function processImage(imagePath, maxWidth) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (metadata.width > maxWidth) {
        return image
            .resize(maxWidth, null, { withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
    }

    return image.jpeg({ quality: 85 }).toBuffer();
}

async function uploadToR2(buffer, key) {
    const tempFile = `/tmp/${path.basename(key)}`;
    fs.writeFileSync(tempFile, buffer);

    try {
        execSync(`npx wrangler r2 object put ${R2_BUCKET}/${key} --file="${tempFile}" --remote 2>&1 | grep -v "wrangler"`, {
            stdio: 'pipe'
        });
        fs.unlinkSync(tempFile);
        return true;
    } catch (error) {
        fs.unlinkSync(tempFile);
        return false;
    }
}

async function syncPhotos() {
    const categories = ['theatre', 'travel'];
    let count = 0;

    for (const category of categories) {
        const categoryDir = path.join(baseDir, category);
        const files = fs.readdirSync(categoryDir);

        console.log(`\n📤 Syncing ${category} (${files.length} files)...`);

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

            const fullPath = path.join(categoryDir, file);
            const imageId = `${category}-${path.parse(file).name}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

            process.stdout.write(`\r   [${count + 1}] ${file}...`);

            // Upload thumbnail
            const thumbnailBuffer = await processImage(fullPath, THUMBNAIL_WIDTH);
            await uploadToR2(thumbnailBuffer, `thumbnails/${imageId}.jpg`);

            // Upload full image
            const fullBuffer = await processImage(fullPath, FULL_WIDTH);
            await uploadToR2(fullBuffer, `photos/${imageId}.jpg`);

            count++;
        }
        console.log(` ✅`);
    }

    console.log(`\n✅ Synced ${count} photos to remote R2\n`);
}

syncPhotos().catch(console.error);
