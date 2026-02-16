# Test Photos for Local Development

Place your test photos in this directory for local testing.

## Naming Convention

Name your files like this:
- `theatre-1.jpg`
- `theatre-2.jpg`
- `theatre-3.jpg`
- `travel-1.jpg`
- `travel-2.jpg`
- etc.

The mock API expects:
- **6 theatre photos**: theatre-1.jpg through theatre-6.jpg
- **6 travel photos**: travel-1.jpg through travel-6.jpg

## How It Works

When you run the local dev server, the mock API will automatically use these images instead of placeholder images from external services.

## Quick Test

1. Add any JPG images to this directory with the naming pattern above
2. Refresh the browser at http://localhost:8080
3. Your test photos will appear in the gallery

## For Production

These test images are NOT used in production. The production site uses:
- Cloudflare R2 for image storage
- The upload script to process and upload photos
- Real metadata from Workers KV

This directory is only for local development and testing the gallery layout/functionality.
