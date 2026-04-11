# Almighty

A Christian prayer generation site — personal, warm prayers powered by Claude AI.

## Features
- AI-generated contemporary Christian prayers
- 12 prayer categories
- Google sign-in for saving prayers (stored in localStorage per user)
- Clean, minimal design

## Deploy to GitHub Pages

### 1. Create the repository
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create almighty --public --source=. --push
```

Or manually on GitHub: create a new repo named `almighty`, then:
```bash
git remote add origin https://github.com/edselgrca-ops/almighty.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **main** / **/ (root)**
5. Click Save

Your site will be live at:
**https://edselgrca-ops.github.io/almighty**

(takes ~2 minutes after first push)

### 3. Update Google OAuth (important)
In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth client:

Add to **Authorized JavaScript origins**:
```
https://edselgrca-ops.github.io
```

Add to **Authorized redirect URIs**:
```
https://edselgrca-ops.github.io/almighty
```

## File structure
```
almighty/
├── index.html        ← single-page app
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Local development
Just open `index.html` in a browser — no build step needed.

Note: Google sign-in requires the origin to be registered. For local testing, `http://localhost` is already added to your OAuth client.
