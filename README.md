# Troopod

AI-powered landing page personalizer. Input an ad creative and a landing page URL — get back the same page, personalized to match the ad's audience, tone, and offer.

**Live Demo:** [troopod.vercel.app](https://troopod.vercel.app)  
**Demo Landing Page:** [landingpage-phi-lovat.vercel.app](https://landingpage-phi-lovat.vercel.app/)

---

## What It Does

Most landing pages fail because they say the same thing to everyone. An ad targeting freelancers and an ad targeting enterprise CTOs should never land on the same page with the same headline. Troopod fixes that automatically.

It takes your ad creative, analyzes the audience, tone, and offer, and rewrites 37 specific content elements on your landing page — headlines, subheadlines, CTAs, benefits, testimonials, pricing, FAQs — while leaving the layout, design, and structure completely untouched.

---

## How It Works

```
Ad Creative (image/PDF)          Landing Page URL
        ↓                                ↓
   Gemini 3.1 Flash lite              Firecrawl Scraper
   (analyzes ad,                 (scrapes full HTML
   generates 37                   + CSS)
   slot values as JSON)
        ↓                                ↓
        └──────────── injectSlots.js ────┘
                            ↓
                   Personalized HTML
                   (rendered in iframe)
```

Firecrawl and Gemini run in **parallel** — neither depends on the other, so response time is minimized.

---

## Stack

- **Frontend** — Next.js, React, Tailwind CSS
- **Backend** — Next.js API routes
- **Scraping** — Firecrawl REST API
- **AI** — Google Gemini 3.1 Flash lite
- **Deployment** — Vercel

---

## Project Structure

```
troopod-mvp/
├── app/
│   ├── page.jsx              # Input UI — ad creative + description + landing URL
│   ├── layout.jsx            # App metadata
│   └── api/
│       └── personalize/
│           └── route.js      # Orchestration — Firecrawl + Gemini + inject
├── components/
│   └── OutputPanel.jsx       # Renders personalized HTML in iframe
├── lib/
│   ├── slots.js              # Hardcoded list of 37 data-slot names
│   └── injectSlots.js        # Injects Gemini JSON into scraped HTML
└── .env.local                # API keys
```

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/Harshmahto/troopod
cd troopod
```

**2. Install dependencies**
```bash
npm install
```

**3. Add environment variables**

Create a `.env.local` file in the root:
```
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

Get your keys:
- Gemini API key — [aistudio.google.com](https://aistudio.google.com)
- Firecrawl API key — [firecrawl.dev](https://firecrawl.dev)

**4. Run locally**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How To Use

1. Upload an ad creative (image or PDF) or paste a direct image URL
2. Add an optional description of the ad for better context
3. Paste the landing page URL — use `https://landingpage-phi-lovat.vercel.app/` for best results
4. Click **Personalize Landing Page**
5. View the personalized page in the preview below

> **Note:** Ad images must be under 4.5MB. Use direct image URLs — Google Drive and Dropbox preview links are not supported.

---

## The Data-Slot System

The core of Troopod's injection approach. Every changeable element on the landing page is marked with a `data-slot` attribute:

```html
<h1 data-slot="headline">Original Headline</h1>
<button data-slot="cta-primary">Get Started</button>
```

Gemini generates a JSON object with values for all 37 slots. The injector finds each `data-slot` in the scraped HTML and replaces the text content — nothing else changes.

**The 37 slots cover:**
- Navigation CTA
- Hero section (eyebrow, headline, subheadline, CTAs, social proof)
- Stats (3 stats with numbers and labels)
- Benefits (4 benefits with titles and descriptions)
- How It Works (3 steps)
- Testimonials (3 testimonials)
- Pricing (plan name, price, period, description)
- FAQ (4 questions and answers)
- Final CTA section

---

## Known Limitations

- Pages with external CSS frameworks (Tailwind, Bootstrap) may not render with full visual fidelity — Firecrawl captures HTML but not external stylesheets
- Ad images must be under 4.5MB due to Vercel's request body limit
- Google Drive and Dropbox preview links are not supported — use direct image URLs
- The `data-slot` injection only works on pages that have `data-slot` attributes — the demo page is purpose-built for this

---

## Future Improvements

- AI-based DOM analysis to work on any landing page without `data-slot` attributes
- Multiple variant generation for A/B testing
- Analytics integration to track conversion by variant
- Video ad creative support via keyframe extraction
- Direct publishing to a staging URL
- Personalization confidence scoring

---

## Why Gemini Generates JSON, Not HTML

An earlier version sent the full HTML to Gemini and asked it to rewrite the page. Results were inconsistent — layout changes, invented sections, broken structure. The fix was to separate responsibilities: Firecrawl owns the HTML, Gemini owns the content, the injector brings them together. Gemini's only job is to fill 37 blanks. This makes hallucinations structurally contained and layout breakage architecturally impossible.

---

*Built for the Troopod PM Assignment.*

