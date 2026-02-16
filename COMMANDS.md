# Quick Command Reference

## Local Development

```bash
# Preview with Python
python3 -m http.server 8000 -d public

# Preview with Node.js
npx http-server public -p 8000

# Preview with Wrangler (requires setup)
npm run dev
```

## Cloudflare Setup

```bash
# Login to Cloudflare
npx wrangler login

# Create R2 bucket
npx wrangler r2 bucket create photos

# Create KV namespace
npx wrangler kv:namespace create PHOTO_METADATA

# Check account info
npx wrangler whoami
```

## Deployment

```bash
# Deploy Worker (API)
npm run deploy:worker

# Deploy Pages (Frontend)
npm run deploy:pages

# First-time Pages deploy
npx wrangler pages deploy public --project-name=photos
```

## Photo Management

```bash
# Upload photos
node upload-script/upload.js --category theatre --source /path/to/photos

# Example
node upload-script/upload.js --category travel --source ~/Photos/Europe-2026
```

## Git Operations

```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git push origin main

# Create GitHub repo (first time)
git remote add origin https://github.com/yourusername/photo-gallery.git
git push -u origin main
```

## Troubleshooting

```bash
# List KV namespaces
npx wrangler kv:namespace list

# Get metadata from KV
npx wrangler kv:key get photo-metadata --namespace-id=YOUR_ID

# List R2 buckets
npx wrangler r2 bucket list

# View deployment history
npx wrangler deployments list

# View Worker logs (tail)
npx wrangler tail
```

## Configuration

```bash
# Copy environment template
cp .env.example .env

# Copy wrangler template
cp wrangler.toml.example wrangler.toml

# Install dependencies
npm install

# Install upload script dependencies
cd upload-script && npm install
```

## Development Dependencies

```bash
# Install Wrangler globally (optional)
npm install -g wrangler

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Testing

```bash
# Test Worker locally
npx wrangler dev worker/index.js

# Test with curl
curl http://localhost:8787/api/photos
curl -X POST http://localhost:8787/api/click -d '{"photoId":"123"}'
```

## Cloudflare Dashboard URLs

- **Account Overview:** https://dash.cloudflare.com
- **R2 Storage:** https://dash.cloudflare.com/?to=/:account/r2
- **Workers & Pages:** https://dash.cloudflare.com/?to=/:account/workers-and-pages
- **API Tokens:** https://dash.cloudflare.com/profile/api-tokens

## Environment Variables Quick Reference

```bash
CLOUDFLARE_ACCOUNT_ID=       # From dashboard
CLOUDFLARE_API_TOKEN=        # Create in My Profile > API Tokens
R2_BUCKET_NAME=photos
R2_PUBLIC_URL=               # From R2 bucket settings
R2_ACCESS_KEY_ID=            # From R2 API Tokens
R2_SECRET_ACCESS_KEY=        # From R2 API Tokens
KV_NAMESPACE_ID=             # From wrangler kv:namespace create
API_ENDPOINT=                # https://photos.jrbnz.com/api (production)
```

## File Locations

- **Frontend:** `public/`
- **API:** `worker/index.js`
- **Upload Script:** `upload-script/upload.js`
- **Styles:** `public/styles/main.css`, `public/styles/gallery.css`
- **Config:** `config.js`, `.env`, `wrangler.toml`

## Common Tasks

### Change Number of Photos Per Page
Edit `config.js` → `photosPerPage: 30`

### Add New Category
1. Edit `config.js` → add to `categories` array
2. Edit `public/index.html` → add navigation link

### Change Image Sizes
Edit `config.js`:
- `thumbnailMaxSize: 400` (grid display)
- `webMaxSize: 1920` (lightbox)

### Update Colors
Edit `public/styles/main.css` → CSS variables at top

### Enable GitHub Auto-Deploy
1. Rename `.github/workflows/deploy.yml.example` to `deploy.yml`
2. Add secrets to GitHub repo settings:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
