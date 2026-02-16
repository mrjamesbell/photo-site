# Test Photos for Local Development

Drop your test photos in the category subdirectories for local testing.

## Directory Structure

```
public/images/placeholders/
├── theatre/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   ├── 4.jpg
│   ├── 5.jpg
│   └── 6.jpg
└── travel/
    ├── 1.jpg
    ├── 2.jpg
    ├── 3.jpg
    ├── 4.jpg
    ├── 5.jpg
    └── 6.jpg
```

## How to Use

1. Copy your photos into `theatre/` or `travel/` folders
2. Rename them to: `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg`, `6.jpg`
3. Refresh the browser at http://localhost:8080
4. Your test photos will appear in the gallery

Simple! Just rename your files to match the numbers.

## For Production

These test images are NOT used in production. The production site uses:
- Cloudflare R2 for image storage
- The upload script to process and upload photos
- Real metadata from Workers KV

This directory is only for local development and testing.
