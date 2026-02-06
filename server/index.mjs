import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

function parseCsvLine(line) {
  // Very small CSV parser: handles quoted fields.
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

async function fetchYahooQuote(symbol) {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.toUpperCase())}`);
  url.searchParams.set('interval', '5m');
  url.searchParams.set('range', '1d');
  url.searchParams.set('includePrePost', 'true');

  const res = await fetch(url, { headers: { 'user-agent': 'openclaw-portfolio-tracker/1.0' } });
  if (!res.ok) throw new Error(`yahoo http ${res.status}`);
  const data = await res.json();

  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];

  // Find latest non-null close.
  let lastClose = null;
  let lastTs = null;
  for (let i = closes.length - 1; i >= 0; i--) {
    const v = closes[i];
    if (typeof v === 'number' && Number.isFinite(v)) {
      lastClose = v;
      lastTs = timestamps[i] ?? null;
      break;
    }
  }

  const price = typeof lastClose === 'number' ? lastClose : meta?.regularMarketPrice;
  const prev = meta?.previousClose;
  const changePercent = typeof prev === 'number' && prev ? ((price - prev) / prev) * 100 : undefined;

  return {
    symbol: symbol.toUpperCase(),
    price: Number.isFinite(price) ? Math.round(price * 100) / 100 : NaN,
    changePercent: Number.isFinite(changePercent) ? Math.round(changePercent * 100) / 100 : undefined,
    timestamp: lastTs ? new Date(lastTs * 1000).toISOString() : new Date().toISOString(),
    source: 'yahoo'
  };
}

async function fetchStooqQuote(symbol) {
  // Fallback (often delayed). Stooq uses symbols like msft.us
  const stooqSymbol = `${symbol.toLowerCase()}.us`;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSymbol)}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { headers: { 'user-agent': 'openclaw-portfolio-tracker/1.0' } });
  if (!res.ok) throw new Error(`stooq http ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('stooq empty');
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const row = parseCsvLine(lines[1]);
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const close = Number(row[idx.close]);
  const open = Number(row[idx.open]);
  const changePercent = open ? ((close - open) / open) * 100 : undefined;

  return {
    symbol: symbol.toUpperCase(),
    price: Number.isFinite(close) ? close : NaN,
    changePercent: Number.isFinite(changePercent) ? Math.round(changePercent * 100) / 100 : undefined,
    timestamp: new Date().toISOString(),
    source: 'stooq'
  };
}

const CRYPTO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  LINK: 'chainlink'
};

async function fetchCoinGeckoQuotes(symbols) {
  const ids = symbols.map(s => CRYPTO_ID[s]).filter(Boolean);
  if (ids.length === 0) return [];

  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');

  const res = await fetch(url, { headers: { 'user-agent': 'openclaw-portfolio-tracker/1.0' } });
  if (!res.ok) throw new Error(`coingecko http ${res.status}`);
  const data = await res.json();

  const now = new Date().toISOString();
  return symbols.map(sym => {
    const id = CRYPTO_ID[sym];
    const row = id ? data[id] : null;
    const price = row?.usd;
    const changePercent = row?.usd_24h_change;
    return {
      symbol: sym,
      price: typeof price === 'number' ? price : NaN,
      changePercent: typeof changePercent === 'number' ? Math.round(changePercent * 100) / 100 : undefined,
      timestamp: now,
      source: 'coingecko'
    };
  });
}

function normalizeSymbolsParam(v) {
  if (!v) return [];
  if (Array.isArray(v)) v = v.join(',');
  return String(v)
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
}

app.get('/api/prices', async (req, res) => {
  try {
    const symbols = normalizeSymbolsParam(req.query.symbols);
    const unique = Array.from(new Set(symbols));

    const cryptoSyms = unique.filter(s => CRYPTO_ID[s]);
    const stockSyms = unique.filter(s => !CRYPTO_ID[s]);

    const [cryptoQuotes, stockQuotes] = await Promise.all([
      fetchCoinGeckoQuotes(cryptoSyms),
      Promise.all(stockSyms.map(async s => {
        try {
          return await fetchYahooQuote(s);
        } catch {
          return await fetchStooqQuote(s);
        }
      }))
    ]);

    const quotes = [...cryptoQuotes, ...stockQuotes].filter(q => Number.isFinite(q.price));
    res.json({ quotes, ts: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: String(e?.message ?? e) });
  }
});

// Serve static build when built
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 4173);
app.listen(port, () => {
  console.log(`server listening on http://127.0.0.1:${port}`);
});
