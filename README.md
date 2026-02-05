# Stock & Crypto Portfolio Tracker

A real-time portfolio tracking web app for monitoring **stock** and **cryptocurrency** holdings with live price updates, P&L calculations, and a responsive UI.

This repo is based on the project requirements in [`rules.md`](./rules.md) and the implementation plan in [`plan.md`](./plan.md).

## Features

- Track holdings (symbol, quantity, average buy price)
- Separate sections for **Stocks** and **Crypto**
- Live/periodic price updates (service layer)
- Real-time **unrealized P&L** and **% change**
- Mobile-first responsive UI
- Local persistence via **localStorage**

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS

## Project Structure

```text
src/
  components/         UI components
  hooks/              React hooks for portfolio + prices + responsiveness
  services/           API/localStorage services
  types/              TypeScript types
```

## Getting Started

### Prerequisites

- Node.js (18+ recommended)

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Then open the local URL shown by Vite.

### Build

```bash
npm run build
```

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
