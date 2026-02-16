# Quick Setup Guide

Follow these steps to get your photo gallery up and running.

## 1. Install Wrangler CLI

```bash
npm install
```

## 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window for authentication.

## 3. Create R2 Bucket

```bash
npx wrangler r2 bucket create photos
```

## 4. Create KV Namespace

```bash
npx wrangler kv:namespace create PHOTO_METADATA
```

**Copy the ID that's returned** - you'll need it for the next step.

## 5. Create Configuration Files

```bash
# Copy wrangler config
cp wrangler.toml.example wrangler.toml

# Copy environment variables
cp .env.example .env
```

## 6. Edit wrangler.toml

Open `wrangler.toml` and update:

```toml
[[kv_namespaces]]
binding = "PHOTO_METADATA"
id = "PASTE_KV_NAMESPACE_ID_HERE"  # From step 4

routes = [
    { pattern = "photos.jrbnz.com/api/*", zone_name = "jrbnz.com" }
]
```

## 7. Get Your Cloudflare Account ID

```bash
npx wrangler whoami
```

Copy your Account ID from the output.

## 8. Create R2 Access Keys

Go to Cloudflare Dashboard > R2 > Manage R2 API Tokens:

1. Click "Create API token"
2. Name: "Photo Gallery Upload"
3. Permissions: Object Read & Write
4. Bucket: photos
5. Click "Create API Token"
6. **Save the Access Key ID and Secret Access Key**

## 9. Create Cloudflare API Token

Go to Cloudflare Dashboard > My Profile > API Tokens:

1. Click "Create Token"
2. Use template: "Edit Cloudflare Workers"
3. Add additional permission: "Workers KV Storage:Edit"
4. Click "Continue to summary"
5. Click "Create Token"
6. **Save the token**

## 10. Edit .env File

Open `.env` and fill in all values:

```bash
CLOUDFLARE_ACCOUNT_ID=xxx           # From step 7
CLOUDFLARE_API_TOKEN=xxx            # From step 9
R2_BUCKET_NAME=photos
R2_ACCESS_KEY_ID=xxx                # From step 8
R2_SECRET_ACCESS_KEY=xxx            # From step 8
KV_NAMESPACE_ID=xxx                 # From step 4
```

## 11. Configure R2 Public Access

```bash
# Enable public access to your bucket
npx wrangler r2 bucket update photos --public-access
```

Or set up a custom domain in the Cloudflare Dashboard.

Get your R2 public URL from the dashboard and add to `.env`:

```bash
R2_PUBLIC_URL=https://pub-xxx.r2.dev  # Or your custom domain
```

## 12. Deploy Worker

```bash
npm run deploy:worker
```

## 13. Deploy Pages

```bash
npx wrangler pages deploy public --project-name=photos
```

## 14. Set Up Custom Domain

In Cloudflare Dashboard:

1. Go to **Workers & Pages**
2. Select your **photos** project
3. Click **Custom domains**
4. Click **Set up a custom domain**
5. Enter: `photos.jrbnz.com`
6. Cloudflare will configure DNS automatically

## 15. Upload Test Photos

```bash
# Install upload script dependencies
cd upload-script
npm install
cd ..

# Upload photos
node upload-script/upload.js --category theatre --source /path/to/photos
```

## 16. Visit Your Gallery!

Navigate to: `https://photos.jrbnz.com`

---

## Troubleshooting

### Command Not Found: wrangler

```bash
npx wrangler <command>
```

Use `npx` prefix if wrangler isn't globally installed.

### Authentication Issues

```bash
npx wrangler logout
npx wrangler login
```

### KV Namespace Issues

List your namespaces:

```bash
npx wrangler kv:namespace list
```

### View Deployed Workers

```bash
npx wrangler deployments list
```

### Check R2 Buckets

```bash
npx wrangler r2 bucket list
```

### Test Worker Locally

```bash
npm run dev
```

Visit `http://localhost:8788`

---

## Next Steps

- Upload more photos with the upload script
- Customize colors in `public/styles/main.css`
- Add more categories in `config.js`
- Set up GitHub auto-deployment

See `README.md` for full documentation.
