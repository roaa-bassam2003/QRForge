# QRForge — QR Code & Barcode Generator

A modern, full-featured QR code and barcode generator built with Next.js 14, Tailwind CSS, and TypeScript.

## ✨ Features

- **QR Code Generation** — instant live preview as you type
- **Barcode Generation** — CODE128, EAN-13, EAN-8, UPC, CODE39, ITF-14
- **Deep Customization** — foreground/background colors, size, shape (squares/dots/rounded)
- **Logo Overlay** — upload any image as a logo inside QR codes
- **Error Correction** — L / M / Q / H levels
- **Download** — PNG and SVG formats
- **Copy to Clipboard** — one-click copy
- **Share Link** — copy URL with current settings encoded
- **History** — auto-saves last 20 generated codes
- **Favorites** — save and reuse style presets
- **Dark Mode** — toggle with persistence
- **Arabic Support** — full RTL layout and translated UI
- **Responsive** — works on mobile & desktop

## 📁 Project Structure

```
qrforge/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with theme init
│   │   └── page.tsx            # Main application page
│   ├── components/
│   │   ├── QRPreview.tsx       # Canvas/SVG rendering engine
│   │   ├── SettingsPanel.tsx   # Customization controls
│   │   ├── HistoryPanel.tsx    # Generated codes history
│   │   ├── FavoritesPanel.tsx  # Saved style presets
│   │   └── Toast.tsx           # Notification component
│   ├── hooks/
│   │   └── useAppState.ts      # Central state management
│   ├── lib/
│   │   ├── types.ts            # TypeScript types & defaults
│   │   ├── i18n.ts             # EN/AR translations
│   │   └── utils.ts            # Helper functions
│   └── styles/
│       └── globals.css         # Global styles & design tokens
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

```bash
# 1. Navigate to project
cd qrforge

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

## 🌐 Deploy on Vercel

### Option A — Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
cd qrforge
vercel

# Follow prompts, then for production:
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**

That's it — Vercel handles build & deployment automatically.

## 🎨 Customization

### Colors & Theme
Edit CSS variables in `src/styles/globals.css`:
```css
:root {
  --accent: #FF5C00;     /* Primary accent color */
  --bg: #F5F3EE;         /* Page background */
  --bg-card: #FFFFFF;    /* Card background */
}
```

### Adding Languages
Add a new key to `src/lib/i18n.ts` following the existing `en` / `ar` pattern.

### Adding Barcode Formats
Add to the `BARCODE_FORMATS` array in `src/components/SettingsPanel.tsx`.

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `qrcode` | QR code generation (canvas) |
| `qrcode.react` | React QR component |
| `jsbarcode` | Barcode generation (SVG) |
| `lucide-react` | Icons |
| `next` 14 | Framework |
| `tailwindcss` | Utility CSS |

## 📄 License

MIT — free to use and modify.
