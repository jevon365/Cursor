# GitHub Pages Deployment Guide

This guide will help you deploy Circus Maximus to GitHub Pages so anyone can play it without downloading the repository.

## Quick Setup (5 minutes)

### Step 1: Push to GitHub
1. Create a new repository on GitHub (or use an existing one)
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/circus-maximus.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 3: Wait for Deployment
- GitHub will build and deploy your site (usually takes 1-2 minutes)
- You'll see a green checkmark when it's ready
- Your game will be live at: `https://yourusername.github.io/circus-maximus/`

### Step 4: Update README
Update the "Live Demo" section in `README.md` with your actual URL.

## Important Notes

### ✅ What Works Automatically
- All JavaScript modules (ES6 imports)
- All CSS files
- All relative paths in your code
- Save/Load functionality (uses browser localStorage)

### 📁 Folder Structure
Your current folder structure is compatible with GitHub Pages. The following paths are used:
- Images: `refrence material/visual refrences/` (absolute paths from root)
- CSS: `css/` (relative paths)
- JavaScript: `js/` (relative paths)

### ⚠️ Potential Issues & Solutions

#### Issue 1: Images Not Loading
**Symptom**: Game board or icons don't appear

**Solution**: The paths use absolute references from project root. If your repo is named differently or served from a subdirectory, you may need to update paths in:
- `js/ui/CityBackdrop.js` (line 32)
- `js/ui/VictoryTracks.js` (line 98)

If needed, change from:
```javascript
"refrence material/visual refrences/game_board_reffrence.jpeg"
```

To (if repo is at `/circus-maximus/`):
```javascript
"./refrence material/visual refrences/game_board_reffrence.jpeg"
```

#### Issue 2: 404 Errors
**Symptom**: Some files return 404

**Solution**: 
- Ensure all files are committed and pushed
- Check that file names match exactly (case-sensitive on Linux servers)
- Verify `.gitignore` doesn't exclude needed files

#### Issue 3: CORS Errors
**Symptom**: Console shows CORS errors

**Solution**: GitHub Pages serves over HTTPS, so CORS shouldn't be an issue. If you see errors, check:
- All imports use relative paths (they do)
- No `file://` protocol references (there aren't any)

## Testing Locally Before Deploying

Before pushing to GitHub, test that everything works:

1. **Start local server**:
   ```bash
   python server.py
   # OR
   node server.js
   ```

2. **Open in browser**: `http://localhost:8000/index.html`

3. **Check browser console** (F12) for any errors

4. **Test all features**:
   - Game setup
   - Worker placement
   - Resource purchasing
   - Save/Load (should work in browser)

## After Deployment

### Verify It Works
1. Visit your GitHub Pages URL
2. Open browser console (F12) and check for errors
3. Test a full game to ensure everything works

### Update README
Don't forget to update the README.md "Live Demo" section with your actual URL!

### Custom Domain (Optional)
If you have a custom domain, you can add it in GitHub Pages settings under "Custom domain".

## Troubleshooting

### "Page not found" after deployment
- Wait 5-10 minutes (first deployment can take time)
- Check that the branch name matches (main vs master)
- Verify the root folder is selected in Pages settings

### Images/icons missing
- Check browser console for 404 errors
- Verify image files are in the repository
- Check file paths match exactly (case-sensitive)

### JavaScript errors
- Open browser console (F12) to see errors
- Check that all files are pushed to GitHub
- Verify no files are excluded by `.gitignore`

## Need Help?

If something doesn't work:
1. Check the browser console (F12) for errors
2. Verify all files are in the repository
3. Check GitHub Pages build logs (Settings → Pages → see deployment history)
