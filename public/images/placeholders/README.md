# Test Photos for Local Development

Place your test photos in category subdirectories for local testing.

## Directory Structure

```
public/images/placeholders/
├── theatre/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── ...
└── travel/
    ├── photo1.jpg
    ├── photo2.jpg
    └── ...
```

## How to Use

1. Drop any JPG images into the `theatre/` or `travel/` subdirectories
2. The mock API will automatically detect and use all images in each folder
3. No specific naming required - any `.jpg` files will work
4. Refresh the browser to see your photos

## How It Works

When you run the local dev server, the mock API will:
- Scan the theatre and travel directories
- Use all JPG files found in each category
- Display them in the gallery sorted by popularity (with randomization)

## For Production

These test images are NOT used in production. The production site uses:
- Cloudflare R2 for image storage
- The upload script to process and upload photos
- Real metadata from Workers KV

This directory is only for local development and testing the gallery layout/functionality.
