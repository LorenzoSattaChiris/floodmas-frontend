# FloodMAS — Intelligence Platform Client

A real-time flood intelligence dashboard for the United Kingdom. Visualises live Environment Agency data, weather forecasts, and social media signals on an interactive satellite map — with a cinematic historical timeline spanning 1947–2024.

**Live:** [floodmas.lsattachiris.com](https://floodmas.lsattachiris.com)  
**API:** [api.floodmas.lsattachiris.com](https://api.floodmas.lsattachiris.com)

---

## Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Layer System](#layer-system)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Design System](#design-system)

---

## Overview

FloodMAS Client is a single-page application built with React 19 and Vite. It renders a full-screen MapLibre GL map overlaid with floating dark-glass UI panels. All live data is fetched from the [FloodMAS API server](https://github.com/LorenzoSattaChiris/floodmas) and cached client-side via TanStack Query.

The application is entirely read-only and stateless — no authentication is required and no user data is stored.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 6 + TypeScript 5.6 |
| Map engine | MapLibre GL JS 4.7 |
| Map tiles | MapTiler Hybrid Satellite |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| Styles | Tailwind CSS 3.4 |
| Toasts | Sonner 1.7 |
| Deployment | Firebase Hosting |

---

## Features

### Live Map Layers (9 toggleable)
- **Flood Warnings & Alerts** — Active EA warnings rendered as colour-coded circles (red = severe, orange = warning, yellow = alert) with pulsing halos. Popup includes full message text, affected area, and timestamp.
- **Water Level Stations** — 500+ EA river gauges colour-coded green/amber/red against typical range thresholds. Popup shows current reading, typical range min/max, and record max.
- **Rainfall Stations** — 500+ EA rain gauges across England.
- **Precipitation Grid** — Open-Meteo current hourly precipitation at 30 UK grid points. Circle size encodes intensity; popup shows 3h/6h forecast, temperature, and wind speed.
- **River Discharge Forecast** — Open-Meteo 72-hour river discharge forecast.
- **Risk — Rivers & Sea** — EA WMS raster: modelled flood risk probability from rivers and the sea.
- **Risk — Surface Water** — EA WMS raster: modelled surface water flooding risk.
- **Flood Defences** — Defra spatial flood defence infrastructure: walls, embankments, and barriers.
- **Historic Flood Outlines** — EA recorded flood event footprints rendered as translucent orange fills.

### Flood Feed
Real-time right panel combining two sources:
- **EA Warnings mode** — Official Environment Agency flood warnings with severity badges, highlight river/county metadata, and NLP keyword colouring.
- **All Sources mode** — Merges EA warnings with live Bluesky social posts. Posts show author avatar, handle, like/repost counts, and direct links.

NLP semantic highlighting segments text into five categories: hazard terms, severity descriptors, alert keywords, weather vocabulary, and location features — each rendered in a distinct colour.

### Historical Timeline (1947–2024)
An animated cinematic timeline accessible from the bottom bar:
- Stepped playback at 0.5×, 1×, 2×, or 4× speed
- Cinematic **intro sequence** — camera flies to the UK overview at 45° tilt
- Per-event **fly-to** animation with pitch and bearing variation
- Cumulative dot trail: all previous events shown at reduced opacity, current event highlighted with a pulsing ring
- Affected location dots for each event plotted on the map
- Event info panel: name, year, cause, description, impact text
- Cinematic **outro summary** — aggregate stats: major floods, lives lost, properties flooded, economic damage
- Scrubber track with year markers and click-to-seek

### Header
- Live ticking clock (UK time, updated every second)
- Data source status indicators: EA API and Bluesky with green/amber dot
- Panel toggle buttons for left (layer control) and right (flood feed) panels

---

## Project Structure

```
client/
├── .env.production          # Production API URL (VITE_API_URL)
├── index.html
├── vite.config.ts           # Dev server + /api proxy
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx             # React root, QueryClient provider
    ├── App.tsx              # Layout: map + floating UI
    ├── index.css            # Tailwind directives + design tokens
    ├── components/
    │   ├── FloodMap.tsx     # MapLibre GL map + all data layers
    │   ├── Header.tsx       # Top bar: brand, status, clock, toggles
    │   ├── LayerControl.tsx # Left panel: layer visibility toggles
    │   ├── SocialFeed.tsx   # Right panel: EA warnings + Bluesky feed
    │   ├── Timeline.tsx     # Historical timeline overlay
    │   └── MapLegend.tsx    # Floating bottom-left legend
    ├── config/
    │   └── layers.ts        # Layer IDs, labels, groups, WMS URLs
    ├── context/
    │   └── MapContext.tsx   # maplibregl.Map ref shared via context
    ├── data/
    │   └── floodHistory.ts  # Curated UK flood events 1947–2024
    ├── hooks/
    │   └── useFloodData.ts  # TanStack Query hooks for all API calls
    ├── services/
    │   └── api.ts           # Typed fetch wrappers + TypeScript interfaces
    └── stores/
        └── layerStore.ts    # Zustand: layer visibility + panel state
```

---

## Architecture

### Component Tree

```
<QueryClientProvider>          ← TanStack Query (global cache)
  <MapProvider>                ← MapContext (map ref)
    <App>
      <FloodMap />             ← Full-screen MapLibre map (z-index: 0)
      <Header />               ← Floating top bar
      <LayerControl />         ← Floating left panel
      <SocialFeed />           ← Floating right panel
      <MapLegend />            ← Floating bottom-left
      <Timeline />             ← Floating bottom overlay
    </App>
  </MapProvider>
</QueryClientProvider>
```

### State Management

| Store | Technology | Contents |
|---|---|---|
| Server state | TanStack Query | API data, loading/error states, cache TTLs |
| Layer state | Zustand | `visibleLayers: Set<string>`, panel open/close |
| Map ref | React Context | `maplibregl.Map` instance shared across components |

### Data Fetching (polling intervals)

| Hook | Endpoint | Interval |
|---|---|---|
| `useFloodWarnings` | `GET /api/floods` | 5 min |
| `useWaterLevelStations` | `GET /api/stations?parameter=level` | 15 min |
| `useRainfallStations` | `GET /api/stations?parameter=rainfall` | 15 min |
| `useLatestReadings` | `GET /api/stations/readings/latest` | 5 min |
| `usePrecipitationGrid` | `GET /api/weather/precipitation` | 30 min |
| `useFloodDefences` | `GET /api/features/defences` | 60 min |
| `useHistoricFloods` | `GET /api/features/historic-floods` | 60 min |
| `useFloodFeed` | `GET /api/social/feed` | 2 min |
| `useHealth` | `GET /api/health` | 30 sec |

### Map Layer Rendering Order

MapLibre GL layers are registered in strict z-order to ensure visual correctness:

```
8. Flood warnings (highest priority — top)
7. Water level stations
6. Rainfall stations
5. Precipitation grid
4. River discharge forecast
3. Flood defences
2. Historic flood outlines
1. WMS risk rasters (bottom)
```

Each data layer is controlled by `useLayerStore`. When `visibleLayers` changes, a `useEffect` in `FloodMap` syncs `visibility: visible/none` on every corresponding MapLibre layer.

### API URL Resolution

In development, Vite proxies `/api` → `http://localhost:3000`. In production, `VITE_API_URL` is read at build time and baked into the bundle:

```
Development:  fetch('/api/floods')       → Vite proxy → localhost:3000
Production:   fetch('https://api.floodmas.lsattachiris.com/api/floods')
```

---

## Layer System

Layer definitions live in `src/config/layers.ts`. Each layer has:

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier used in Zustand store and MapLibre |
| `label` | `string` | Display name in `LayerControl` |
| `group` | `'live' \| 'weather' \| 'risk' \| 'reference'` | Panel grouping |
| `color` | `string` | Hex colour for the toggle dot |
| `defaultVisible` | `boolean` | Initial visibility on load |
| `description` | `string?` | Tooltip text in the layer panel |

To add a new layer:
1. Add an entry to `LAYER_CONFIGS` in `layers.ts`
2. Register the MapLibre source and layer(s) inside the `map.on('load', ...)` block in `FloodMap.tsx`
3. Add the layer ID to the `layerMapping` object in `syncVisibility()`
4. Add a data-sync `useEffect` if the layer requires live data

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [FloodMAS API server](https://github.com/LorenzoSattaChiris/floodmas) running locally on port 3000

### Installation

```bash
git clone https://github.com/LorenzoSattaChiris/floodmas-client
cd floodmas-client
npm install
```

### Development

```bash
npm run dev
```

Opens at [localhost:5173](http://localhost:5173). All `/api/*` requests are proxied to `http://localhost:3000` by the Vite dev server.

---

## Configuration

### Environment Variables

| Variable | File | Description |
|---|---|---|
| `VITE_API_URL` | `.env.production` | Full API base URL (no trailing slash). Omit `/api` — it is appended per-request. |

The variable is only needed for production. In development the Vite proxy (`vite.config.ts`) handles routing.

**`.env.production`** (already present in this repo):
```env
VITE_API_URL=https://api.floodmas.lsattachiris.com/api
```

Rename `.env.production` or create `.env.local` to point to a different API server.

### MapTiler Key

The MapTiler API key is set in `src/config/layers.ts`:

```ts
export const MAPTILER_KEY = '...';
```

The current key is valid for `floodmas.lsattachiris.com`. For a fork, replace it with a key from [maptiler.com](https://www.maptiler.com/) (free tier available).

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Vite dev server at localhost:5173 with HMR |
| Type check + build | `npm run build` | `tsc -b && vite build` → outputs to `dist/` |
| Preview build | `npm run preview` | Serve the production build locally |

---

## Deployment

### Firebase Hosting

The project is configured for deployment to Firebase Hosting. The site is deployed from the `dist/` build output.

From the monorepo root:

```bash
cd client && npm run build
cd .. && npx firebase deploy --only hosting
```

Or use the `deploy.sh` / `deploy.bat` scripts in the repository root.

The Firebase configuration (`firebase.json` in the monorepo root) sets:
- Public directory: `client/dist`
- SPA rewrite: all routes → `index.html`
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Cache-Control: immutable for hashed JS/CSS assets, no-cache for `index.html`

### Deploying to Other Hosts

The build is a standard static SPA. Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, etc.) and configure:

1. Set `VITE_API_URL` as a build environment variable pointing to your API server
2. Configure a catch-all redirect: all routes → `index.html`

---

## Design System

The UI uses a dark glassmorphism design language defined via custom Tailwind tokens in `tailwind.config.js` and CSS utility classes in `src/index.css`.

### Colour Tokens

| Token | Value | Usage |
|---|---|---|
| `flood-bg` | `#0b0f1a` | Page background |
| `flood-surface` | `#111827` | Panel surfaces |
| `flood-accent` | `#38bdf8` | Interactive elements, brand gradient |
| `flood-text` | `#f1f5f9` | Primary text |
| `flood-textMuted` | `#94a3b8` | Secondary text |

### Severity Palette (consistent across all layers)

| Level | Colour | Meaning |
|---|---|---|
| 1 — Severe | `#ef4444` (red-500) | Life-threatening conditions |
| 2 — Warning | `#f97316` (orange-500) | Flooding expected |
| 3 — Alert | `#eab308` (yellow-500) | Flooding possible |
| 4 — Expired | `#94a3b8` (slate-400) | Warning no longer in force |

### Glass Panels

Panels use `.glass` — a backdrop-blur frosted surface:

```css
.glass {
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### NLP Keyword Highlight Classes

The `SocialFeed` component uses five semantic highlight classes:

| Class | Colour | Category |
|---|---|---|
| `.nlp-hazard` | blue | flood, flooding, inundation… |
| `.nlp-severity` | red | severe, extreme, catastrophic… |
| `.nlp-alert` | amber | warning, evacuation, emergency… |
| `.nlp-weather` | sky | storm, rainfall, cyclone… |
| `.nlp-location` | emerald | river, coast, dam, levee… |

---

## Data Sources

All data displayed by the client is sourced through the FloodMAS API, which proxies and caches:

| Source | Data |
|---|---|
| [Environment Agency Flood Monitoring API](https://environment.data.gov.uk/flood-monitoring/doc/reference) | Flood warnings, river gauges, rainfall gauges, latest readings |
| [Open-Meteo](https://open-meteo.com/) | Precipitation grid, river discharge forecast |
| [Defra ArcGIS Portal](https://environment.data.gov.uk/arcgis/) | Flood defences, historic flood outlines, WMS risk rasters |
| [Bluesky AT Protocol](https://atproto.com/) | Social flood posts (via `@atproto/api`) |

All external APIs are free and require no authentication.

---

## Browser Support

Requires a modern browser with WebGL 2 support for MapLibre GL:

- Chrome 80+
- Firefox 71+
- Safari 15+
- Edge 80+

---

*Part of the FloodMAS project — a multi-agent flood intelligence system built for the UK.*
