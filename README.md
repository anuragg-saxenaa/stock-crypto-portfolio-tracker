# Stock & Crypto Portfolio Tracker

A real-time portfolio tracking web app for monitoring **stock** and **cryptocurrency** holdings with live price updates, P&L calculations, and a responsive UI.

This repo is based on the project requirements in [`rules.md`](./rules.md) and the implementation plan in [`plan.md`](./plan.md).

## Features

- Track holdings (symbol, quantity, average buy price)
- Separate sections for **Stocks** and **Crypto**
- Live/periodic price updates via local API (`/api/prices`)
- Real-time **unrealized P&L** and **% change**
- Mobile-first responsive UI
- Local persistence via **localStorage**

## Live Price Sources

| Type      | Source                     | Notes                                               |
|-----------|----------------------------|-----------------------------------------------------|
| **Stocks** | Yahoo Finance              | Falls back to Stooq if rate-limited                 |
| **Crypto** | CoinGecko                  | Free public API                                     |

> **Note:** "Real-time" is best-effort on free sources; timestamps are included in the API response.

## Tech Stack

| Technology | Version/Type |
|------------|--------------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |

## Project Structure

```
src/
├── components/    # UI components
├── hooks/         # React hooks for portfolio + prices + responsiveness
├── services/      # API/localStorage services
└── types/         # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js (18+ recommended)

### Install

```bash
npm install
```

### Run (dev)

Frontend dev server:

```bash
npm run dev
```

Live prices API (server):

```bash
npm run dev:api
```

Run both together (recommended):

```bash
npm run dev:full
```

Then open: http://127.0.0.1:3000/

### Build

```bash
npm run build
```

### Docker (deploy anywhere)

Build + run:

```bash
docker build -t portfolio-tracker .
docker run -p 4173:4173 portfolio-tracker
```

Or docker-compose:

```bash
docker compose up --build
```

Then open: http://localhost:4173/

### Hosting options

- Static hosting (no server API): Vercel / Netlify / Cloudflare Pages (fastest), but you lose the server-side price proxy.
- Docker hosting (recommended for live prices): Fly.io, Render, Railway, DigitalOcean App Platform.

### Lint (if configured)

```bash
npm run lint
```

## Notes / Next Improvements

- Add robust symbol validation for stocks and crypto
- Add WebSocket streaming where supported, fallback to polling
- Add charting (e.g., Chart.js) for allocation and performance
- Add import/export of portfolio JSON

## Disclaimer

This application is for informational/educational purposes only and does not constitute financial advice.
