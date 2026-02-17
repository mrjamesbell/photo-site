import fs from 'fs';
import path from 'path';

// Get all image files from placeholders directory
const baseDir = '/Users/jamesb/Projects/Photo Site/public/images/placeholders';
const photos = [];

function scanDirectory(dir, category) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                const imageId = `${category}-${path.parse(item).name}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
                
                photos.push({
                    id: imageId,
                    category: category,
                    thumbnailUrl: `/r2/thumbnails/${imageId}.jpg`,
                    fullUrl: `/r2/photos/${imageId}.jpg`,
                    uploadedAt: new Date().toISOString(),
                });
            }
        }
    }
}

// Scan both categories
scanDirectory(path.join(baseDir, 'theatre'), 'theatre');
scanDirectory(path.join(baseDir, 'travel'), 'travel');

const metadata = { photos };
console.log(JSON.stringify(metadata, null, 2));
