# The Gateway

Five doors. Five surprises. One final secret.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Building for Production

```bash
# Build the production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

## Deploying to GitHub Pages

### Automatic Deployment via GitHub Actions (Recommended)
This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy The Gateway"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
3. That's it! GitHub will automatically run the build and publish your site at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Relative Asset Paths
The project is preconfigured with `base: './'` in `vite.config.ts`, ensuring that all stylesheets and JavaScript bundles resolve correctly regardless of your repository name or custom domain.
