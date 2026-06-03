# Quick Start Guide

## Local Development (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your API keys:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
- `GEMINI_API_KEY`: Get from [aistudio.google.com](https://aistudio.google.com)
- `FIRECRAWL_API_KEY`: Get from [firecrawl.dev](https://firecrawl.dev)

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test the demo landing page
- Go to [http://localhost:3000/demo-landing.html](http://localhost:3000/demo-landing.html)
- This page has all 37 `data-slot` attributes embedded

### 5. Test the API (optional)
```bash
curl -X POST http://localhost:3000/api/personalize \
  -H "Content-Type: application/json" \
  -d '{
    "adUrl": "https://via.placeholder.com/300x400",
    "adDescription": "Eco-friendly product for conscious consumers",
    "landingUrl": "http://localhost:3000/demo-landing.html"
  }'
```

---

## Deploy to Vercel (Production)

### Prerequisites
- GitHub account with repo pushed
- Vercel account

### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial Troopod setup"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Select your GitHub repo
- Click "Import"

3. **Add Environment Variables**
- In Vercel project dashboard, go to Settings → Environment Variables
- Add:
  - `GEMINI_API_KEY`
  - `FIRECRAWL_API_KEY`
- Click "Save"

4. **Deploy**
- Click "Deploy" button
- Wait for build to complete (~2-3 minutes)
- Visit your live URL

---

## File Structure

```
troopod/
├── app/
│   ├── page.jsx              # Main UI form
│   ├── layout.tsx            # App layout
│   └── api/
│       └── personalize/
│           └── route.js      # API endpoint
├── components/
│   └── OutputPanel.jsx       # Preview + download
├── lib/
│   ├── slots.js              # 37 slot definitions
│   └── injectSlots.js        # HTML slot injector
├── public/
│   └── demo-landing.html     # Demo ecommerce page
├── .env.example              # Environment template
├── .env.local                # (local secrets, not committed)
└── package.json              # Dependencies
```

---

## Troubleshooting

### "GEMINI_API_KEY is not defined"
- Check `.env.local` exists and has the correct key
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Failed to scrape landing page"
- Check if Firecrawl API key is valid
- Verify the landing URL is accessible and has `data-slot` attributes
- Use the demo page: `http://localhost:3000/demo-landing.html`

### "Module not found"
- Run `npm install` again
- Delete `node_modules/` and `.next/` folders
- Run `npm install && npm run dev`

---

## Next Steps

1. **Add your own landing page**: Create an HTML page with `data-slot` attributes (use the demo as a template)
2. **Customize the UI**: Edit `app/page.jsx` to add inspiration URL field
3. **Test end-to-end**: Upload an ad, scrape a landing page, verify personalization
4. **Deploy**: Push to GitHub → Vercel auto-deploys

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Firecrawl API](https://www.firecrawl.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
