# Getting Started

Welcome to your photo gallery project! Here's what's been set up and how to get started.

## 🎉 What's Built

Your complete photo gallery system is ready:

✅ **Frontend** - Beautiful masonry gallery with lightbox modal
✅ **Backend** - Cloudflare Worker API for photo serving and click tracking
✅ **Upload Tool** - Script to optimize and upload photos
✅ **Local Development** - Mock API for testing without Cloudflare
✅ **Documentation** - Complete setup and deployment guides
✅ **Git Repository** - Initialized and first commit made

## 🚀 Quick Start Options

### Option 1: Preview Locally (No Setup Required)

View the gallery with placeholder images right now:

```bash
# Start a local server
python3 -m http.server 8000 -d public

# Or use Node.js
npx http-server public -p 8000
```

Then open: http://localhost:8000

The gallery will automatically use mock data with random placeholder images from Picsum.

### Option 2: Deploy to Cloudflare (Full Setup)

Follow the step-by-step guide in `SETUP.md` to:

1. Install Wrangler CLI
2. Create R2 bucket and KV namespace
3. Configure environment variables
4. Deploy Worker and Pages
5. Set up custom domain (photos.jrbnz.com)

**Time needed:** ~30 minutes

## 📂 Project Structure

```
.
├── public/               Frontend files (deploy this to Cloudflare Pages)
├── worker/               API endpoints (deploy as Cloudflare Worker)
├── upload-script/        Photo upload and optimization tool
├── README.md             Complete documentation
├── SETUP.md              Step-by-step Cloudflare setup
└── dev-server.html       Local development instructions
```

## 🎨 Design

The gallery matches your existing site (jrbnz.com):

- **Colors:** Dark teal background (#003a53) with cream text (#fcf4da)
- **Accent:** Red (#cd181b) and gold (#d4b92b)
- **Font:** Lora serif
- **Layout:** Responsive masonry grid

Customize colors in `public/styles/main.css` (CSS variables at the top).

## 📸 Adding Photos

Once deployed, upload photos with:

```bash
node upload-script/upload.js --category theatre --source /path/to/photos
```

The script will:
- Resize to thumbnail (400px) and web (1920px) versions
- Optimize file sizes
- Upload to R2
- Update metadata in KV

## 🔧 Development Workflow

### Local Changes

1. Edit files in `public/` or `worker/`
2. Test locally with a dev server
3. Commit changes to git

### Deploy Changes

```bash
# Deploy frontend changes
npm run deploy:pages

# Deploy API changes
npm run deploy:worker
```

### Upload Photos

```bash
node upload-script/upload.js --category <category> --source <path>
```

## 📚 Documentation

- **README.md** - Full project documentation
- **SETUP.md** - Cloudflare setup guide
- **dev-server.html** - Local development guide
- **config.js** - Configuration options

## 🆘 Need Help?

### Local Preview Not Working?

Make sure you're running a web server (not just opening the HTML file). Use one of:

```bash
python3 -m http.server 8000 -d public
npx http-server public -p 8000
php -S localhost:8000 -t public
```

### Cloudflare Setup Questions?

See `SETUP.md` for detailed instructions, or:

1. Check the troubleshooting section in README.md
2. Verify your `.env` file has all required values
3. Run `npx wrangler whoami` to check authentication

### Upload Script Errors?

Ensure:
- `.env` file exists in the root directory
- All required environment variables are set
- R2 access keys are correct
- Source folder path exists

## 🎯 Next Steps

**To preview locally:**
→ Open `dev-server.html` and follow instructions

**To deploy to production:**
→ Follow `SETUP.md` step-by-step

**To customize styling:**
→ Edit `public/styles/main.css`

**To add photos:**
→ Use `upload-script/upload.js`

## 📦 What You'll Need for Cloudflare

- Cloudflare account (free tier is fine)
- Node.js 18+ installed
- About 30 minutes for initial setup

The free tier includes:
- 10 GB R2 storage
- 100,000 Worker requests/day
- Unlimited Pages requests

Perfect for a personal portfolio!

---

Happy building! 📸
