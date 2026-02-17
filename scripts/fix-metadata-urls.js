import { execSync } from 'child_process';
import fs from 'fs';

// Get metadata from KV
const result = execSync(
    'npx wrangler kv key get "photo-metadata" --namespace-id=13ddd697c063474bb025876cf23cdab5 --remote',
    { encoding: 'utf8' }
);

const metadata = JSON.parse(result);

// Update URLs
metadata.photos = metadata.photos.map(photo => ({
    ...photo,
    thumbnailUrl: `https://photo-gallery-worker.jrbnz.workers.dev/api/image/thumbnails/${photo.id}.jpg`,
    fullUrl: `https://photo-gallery-worker.jrbnz.workers.dev/api/image/photos/${photo.id}.jpg`,
}));

// Save updated metadata
const tempFile = '/tmp/photo-metadata-fixed.json';
fs.writeFileSync(tempFile, JSON.stringify(metadata, null, 2));

execSync(
    `npx wrangler kv key put "photo-metadata" --path="${tempFile}" --namespace-id=13ddd697c063474bb025876cf23cdab5 --remote`,
    { stdio: 'inherit' }
);

console.log(`✅ Updated URLs for ${metadata.photos.length} photos`);
fs.unlinkSync(tempFile);
