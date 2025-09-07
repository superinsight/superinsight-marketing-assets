# superinsight-marketing-assets
Repository to store all public marketing materials

## Deploying Landing Pages to GitHub Pages

This repository uses GitHub Pages to host landing pages. Follow these steps to deploy your landing pages:

### Initial Setup (One-time)

1. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Scroll down to the "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

2. **Repository Structure**
   ```
   /landing-pages/
     ├── page-name/
     │   ├── index.html
     │   ├── style.css
     │   └── script.js
     └── another-page/
         ├── index.html
         └── assets/
   ```

### Running Landing Pages Locally

Before deploying, you can test your landing pages locally:

#### Option 1: Using Python (Recommended)
```bash
# Navigate to your landing page directory
cd landing-pages/[page-name]

# Python 3
python -m http.server 8000

# Python 2 (if Python 3 not available)
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

#### Option 2: Using Node.js
```bash
# Install a simple HTTP server globally
npm install -g http-server

# Navigate to your landing page directory
cd landing-pages/[page-name]

# Start the server
http-server -p 8000
```
Then open `http://localhost:8000` in your browser.

#### Option 3: Using Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on your `index.html` file
3. Select "Open with Live Server"
4. Your page will open automatically with live reload

### Deploying a New Landing Page

1. **Create and test your landing page**
   - Create a new folder under `/landing-pages/` with your page name
   - Add your `index.html` file and any assets (CSS, JS, images)
   - Test locally using one of the methods above
   - Ensure your `index.html` is properly structured and self-contained

2. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "Add new landing page: [page-name]"
   git push origin main
   ```

3. **Access your deployed page**
   - Your page will be available at: `https://[username].github.io/superinsight-marketing-assets/landing-pages/[page-name]/`
   - GitHub Pages typically takes 1-2 minutes to deploy changes

### Tips for Landing Pages

- **File naming**: Always use `index.html` as your main file for clean URLs
- **Relative paths**: Use relative paths for assets to ensure they work on GitHub Pages
- **Testing**: Test your pages locally before deploying
- **Custom domains**: You can configure a custom domain in repository settings if needed

### Troubleshooting

- **404 errors**: Ensure your folder structure is correct and `index.html` exists
- **Assets not loading**: Check that all file paths are relative and case-sensitive
- **Changes not appearing**: Wait a few minutes for GitHub Pages to rebuild, or check the Actions tab for deployment status
