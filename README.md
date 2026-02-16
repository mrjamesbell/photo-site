# Photo Gallery

A portfolio photo gallery for [photos.jrbnz.com](https://photos.jrbnz.com) built with Cloudflare infrastructure.

## Features

- 🖼️ Masonry grid layout for varied image dimensions
- 🔍 Lightbox modal for full-size viewing
- 📊 Click tracking with popularity-based sorting
- 🏷️ Category filtering (Theatre, Travel)
- 📱 Mobile-responsive design
- ⚡ Fast global CDN delivery via Cloudflare

## Architecture

- **Cloudflare Pages**: Static site hosting
- **Cloudflare Workers**: API endpoints for photos and click tracking
- **Cloudflare R2**: Object storage for images
- **Cloudflare Workers KV**: Metadata and click count storage

## Project Structure

```
.
├── public/              # Frontend static files
│   ├── index.html
│   ├── styles/
│   │   ├── main.css     # Main styles matching jrbnz.com
│   │   └── gallery.css  # Gallery-specific styles
│   └── scripts/
│       └── gallery.js   # Gallery functionality
├── worker/              # Cloudflare Worker
│   └── index.js         # API endpoints
├── upload-script/       # Photo upload tool
│   ├── package.json
│   └── upload.js        # Upload and optimize photos
├── config.js            # Shared configuration
├── wrangler.toml        # Cloudflare Worker config (create from .example)
└── .env                 # Environment variables (create from .example)
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Git installed

### 1. Install Dependencies

```bash
# Install root dependencies (Wrangler CLI)
npm install

# Install upload script dependencies
cd upload-script
npm install
cd ..
```

### 2. Cloudflare Setup

#### A. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2** in the sidebar
3. Click **Create bucket**
4. Name it `photos`
5. Click **Create bucket**

#### B. Generate R2 Access Keys

1. In R2, go to **Manage R2 API Tokens**
2. Click **Create API token**
3. Give it a name (e.g., "Photo Gallery Upload")
4. Permissions: **Object Read & Write**
5. Select the `photos` bucket
6. Click **Create API Token**
7. **Save the Access Key ID and Secret Access Key** (you won't see them again)

#### C. Create Workers KV Namespace

```bash
# Login to Cloudflare
npx wrangler login

# Create KV namespace for production
npx wrangler kv:namespace create PHOTO_METADATA

# Note the ID that's returned (e.g., "abc123...")
```

#### D. Configure Custom Domain

1. In Cloudflare Dashboard, go to **Pages**
2. We'll create the Pages project in step 4 below
3. For the Worker route, we'll configure it in `wrangler.toml`

### 3. Configure Environment Variables

Copy the example files and fill in your values:

```bash
# Copy environment variables template
cp .env.example .env

# Copy wrangler config template
cp wrangler.toml.example wrangler.toml
```

Edit `.env` with your values:

```bash
# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your-account-id  # Found in dashboard overview
CLOUDFLARE_API_TOKEN=your-api-token    # Create in "My Profile" > "API Tokens"

# R2 Storage
R2_BUCKET_NAME=photos
R2_PUBLIC_URL=https://your-r2-public-url  # From R2 bucket settings
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-key

# Workers KV
KV_NAMESPACE_ID=your-kv-namespace-id  # From step 2C above

# API Endpoint
API_ENDPOINT=https://photos.jrbnz.com/api
```

Edit `wrangler.toml` with your values:

```toml
# Update the KV namespace ID
[[kv_namespaces]]
binding = "PHOTO_METADATA"
id = "YOUR_KV_NAMESPACE_ID"  # From step 2C

# Update the route with your domain
routes = [
    { pattern = "photos.jrbnz.com/api/*", zone_name = "jrbnz.com" }
]
```

### 4. Deploy to Cloudflare

#### Deploy Worker (API)

```bash
npm run deploy:worker
```

#### Deploy Pages (Frontend)

First time setup:

```bash
npx wrangler pages deploy public --project-name=photos
```

This will:
1. Create a new Pages project
2. Deploy your static files
3. Give you a URL like `photos-xxx.pages.dev`

For subsequent deploys:

```bash
npm run deploy:pages
```

#### Configure Custom Domain for Pages

1. Go to **Pages** in Cloudflare Dashboard
2. Select your `photos` project
3. Go to **Custom domains**
4. Click **Set up a custom domain**
5. Enter `photos.jrbnz.com`
6. Cloudflare will automatically configure DNS

### 5. Configure R2 Public Access

1. Go to your R2 bucket settings
2. Enable **Public Access** or configure a custom domain
3. Update `R2_PUBLIC_URL` in `.env` with the public URL

## Usage

### Uploading Photos

1. Export photos from Lightroom to a local folder
2. Run the upload script:

```bash
node upload-script/upload.js --category theatre --source ./path/to/photos
```

Example:

```bash
node upload-script/upload.js --category theatre --source ~/exports/theatre-march-2026
```

The script will:
- Resize images to web (1920px) and thumbnail (400px) versions
- Optimize and compress images
- Upload to R2
- Update metadata in Workers KV
- Initialize click counts to 0

### Adding New Categories

1. Update `config.js` to add the category to the `categories` array
2. Add a navigation link in `public/index.html`
3. Photos will automatically filter by the new category

### Local Development

For local development with Wrangler:

```bash
# Start local dev server
npm run dev
```

This will start a local server at `http://localhost:8788` with:
- Static file serving from `public/`
- Local Worker for API endpoints
- Hot reloading

## Deployment Workflow

### Initial Setup

1. Follow all setup instructions above
2. Deploy Worker and Pages
3. Configure custom domain
4. Upload initial photos

### Adding New Photos

1. Export from Lightroom
2. Run upload script
3. Photos appear immediately (no rebuild needed)

### Frontend Changes

1. Edit files in `public/`
2. Deploy: `npm run deploy:pages`
3. Changes go live immediately

### API Changes

1. Edit `worker/index.js`
2. Deploy: `npm run deploy:worker`
3. Changes go live immediately

## Git Deployment (Automated)

For automated deployments:

1. Push to GitHub
2. Connect Cloudflare Pages to your GitHub repo
3. Configure build settings:
   - Build command: (none)
   - Build output directory: `/public`
4. Every push to `main` will auto-deploy

## Configuration

### Image Settings

Edit `config.js` to adjust:

- `thumbnailMaxSize`: Max thumbnail dimension (default: 400px)
- `webMaxSize`: Max web image dimension (default: 1920px)
- `thumbnailQuality`: JPEG quality for thumbnails (default: 80)
- `webQuality`: JPEG quality for web images (default: 85)
- `photosPerPage`: Photos per page (default: 30)

### Styling

The gallery matches the style of [jrbnz.com](https://jrbnz.com):

- **Colors**: Defined in `public/styles/main.css` CSS variables
- **Fonts**: Lora serif
- **Layout**: Responsive masonry grid

To customize:
- Edit CSS variables in `public/styles/main.css`
- Modify grid columns in `public/styles/gallery.css`

## Troubleshooting

### Upload Script Errors

**"Missing required environment variables"**
- Ensure `.env` file exists with all required variables
- Check that `.env` is in the root directory (not `upload-script/`)

**"Failed to upload to R2"**
- Verify R2 access keys are correct
- Check bucket name matches
- Ensure bucket exists

### API Not Working

**"CORS errors"**
- Check Worker routes are configured correctly
- Verify domain matches in `wrangler.toml`

**"Photos not loading"**
- Verify Worker is deployed: `npx wrangler deployments list`
- Check KV namespace ID is correct
- Ensure metadata exists: `npx wrangler kv:key get photo-metadata --namespace-id=YOUR_ID`

### Images Not Displaying

**"Image URLs broken"**
- Verify `R2_PUBLIC_URL` is correct
- Check R2 bucket has public access enabled
- Ensure images were uploaded successfully

## Costs

Cloudflare free tier includes:
- **R2**: 10 GB storage, 10 million Class A operations/month
- **Workers**: 100,000 requests/day
- **Pages**: Unlimited requests
- **Workers KV**: 100,000 reads/day, 1,000 writes/day

This project should easily fit within free tier limits for a personal portfolio.

## Future Enhancements

- [ ] Sub-categories (by year, destination, production)
- [ ] Search functionality
- [ ] Photo captions and alt text
- [ ] EXIF data display
- [ ] Admin panel for uploads
- [ ] Analytics dashboard
- [ ] WebP format support
- [ ] Infinite scroll option

## License

MIT License - See LICENSE file for details

## Author

James Bell - [jrbnz.com](https://jrbnz.com)
