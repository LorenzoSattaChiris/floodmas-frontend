<div align="center">

# FloodMAS Client

**Real-time UK flood intelligence dashboard**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-4.7-396CB2?style=flat-square)](https://maplibre.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](../LICENSE)

React SPA for [FloodMAS](https://floodmas.lsattachiris.com) — 38 toggleable map layers, AI agent chat, historical timeline, and real-time flood feeds.  
Visualises live Environment Agency data, weather forecasts, risk models, local datasets, AI agent analysis, and social media signals on an interactive satellite map, with postcode-level risk search, LLFA strategy cards, and a cinematic historical timeline spanning 1947–2024.  
**Live:** [floodmas.lsattachiris.com](https://floodmas.lsattachiris.com) · **API:** [api.floodmas.lsattachiris.com](https://api.floodmas.lsattachiris.com)

</div>

---

## Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Map Layers (38)](#map-layers-38)
- [Data Sources & Datasets](#data-sources--datasets)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Design System](#design-system)

---

## Overview

FloodMAS Client is a single-page application built with React 19 and Vite. It renders a full-screen MapLibre GL map overlaid with floating dark-glass UI panels. All live data is fetched from the FloodMAS API server and cached client-side via TanStack Query with per-hook polling intervals.

The application is entirely read-only and stateless — no authentication is required and no user data is stored.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 6 + TypeScript 5.6 |
| Map engine | MapLibre GL JS 4.7 |
| Map tiles | MapTiler Hybrid Satellite (default), 3 OS Maps variants |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| Markdown | react-markdown 10 + remark-gfm |
| Styles | Tailwind CSS 3.4 |
| Toasts | Sonner 1.7 |
| Deployment | Firebase Hosting |

---

## Features

### Interactive Map (29 Layers)
Full-screen satellite map with 29 independently toggleable layers across 4 groups (Live, Weather, Risk, Reference). Each layer has click popups with contextual information, data-driven styling, and automatic polling.

### AI Agent Chat
A sliding panel providing access to a multi-agent system (Supervisor + 4 specialist workers):
- **Chat** — Natural-language flood queries with SSE-streamed responses, rendered as Markdown
- **Proactive Scan** — One-click flood risk assessment across the entire UK
- **Report Generation** — Professional flood reports from conversation context
- **Intel Tab** — Reference panel listing all 28 agent tools with descriptions, grouped by specialist role
- **Agent Graph** — Visual A2A agent network diagram showing coordinator → specialist relationships
- Agent status indicators show which specialist (Monitoring, Forecasting, Risk Analysis, Emergency Response) is active

### Place Search + Postcode Risk
Combined OS place name search + postcode flood risk lookup:
- **Place search** — OS Names API: type a location name → results with coordinates → fly-to on click
- **Postcode risk** — Type a UK postcode → see flood risk breakdown (total properties, residential/non-residential × very-low/low/medium/high) with colour-coded risk badges

### LLFA Information Cards
Click any LLFA boundary on the map to see a comprehensive information card:
- Authority name, ONS code, type (county / unitary)
- LFRMS strategy status (year published, living document, external consultant)
- Quality grades (A/B/C badges) for: clear objectives, SMART objectives, M&E, climate change, surface water, FCERM alignment
- Stakeholder mention counts (EA, DEFRA, Water Companies, RFCCs, Public)
- Key term counts (SuDS, NFM, NBS, resilience, etc.)

### Flood Feed
Real-time right panel combining two sources:
- **EA Warnings mode** — Official EA flood warnings with severity badges, river/county metadata, and NLP keyword colouring
- **All Sources mode** — Merges EA warnings with live Bluesky social posts (avatar, handle, engagement counts, direct links)

NLP semantic highlighting segments text into five categories (hazard, severity, alert, weather, location) each in a distinct colour.

### Historical Timeline (1947–2024)
Cinematic animated timeline:
- Stepped playback (0.5×, 1×, 2×, 4×)
- Intro sequence: camera flies to UK at 45° tilt
- Per-event fly-to with pitch/bearing variation
- Cumulative dot trail with pulsing current event
- Event info panel: name, year, cause, description, impact
- Outro summary: aggregate stats (floods, lives lost, properties, economic damage)
- Scrubber track with year markers and click-to-seek

### Draggable Panels
All floating UI panels (Layer Control, Flood Feed, Agent Chat) are draggable, resizable, and their positions, sizes, and open/closed state persist to `localStorage` across sessions. A settings gear in the Header provides a **Reset Panel Positions** option.

### Basemap Selector
Four basemap styles (Satellite/Hybrid, OS Light, OS Road, OS Outdoor) are switchable from within the Layer Control panel, below the Reference layer group.

### Header
- Live UK clock (ticks every second)
- Data source status: EA API, Bluesky, Met Office — green/amber indicators
- Panel toggle buttons (Layer Control left, Social Feed right)
- Settings gear → Reset Panel Positions

---

## Map Layers (38)

All layers defined in `src/config/layers.ts`. Grouped by visual hierarchy (reference at bottom, live on top).

### Live — Real-time Data (6 layers)

| # | ID | Label | Source | Colour | Default |
|---|---|-------|--------|--------|---------|
| 1 | `flood-warnings` | Flood Warnings & Alerts | EA Flood Monitoring API | `#dc2626` | ✅ ON |
| 2 | `water-level-stations` | Water Level Stations | EA Flood Monitoring API | `#0ea5e9` | ✅ ON |
| 3 | `rainfall-stations` | Rainfall Stations | EA Flood Monitoring API | `#8b5cf6` | OFF |
| 4 | `tidal-stations` | Tide Gauge Stations | EA Flood Monitoring API | `#06b6d4` | OFF |
| 5 | `groundwater-stations` | Groundwater Stations | EA Flood Monitoring API | `#0d9488` | OFF |
| 6 | `nrfa-stations` | NRFA Flow Gauges | UKCEH NRFA | `#e11d48` | OFF |

### Weather — Forecast & Conditions (6 layers)

| # | ID | Label | Source | Colour | Default |
|---|---|-------|--------|--------|---------|
| 7 | `precipitation` | Precipitation (Current) | Open-Meteo Forecast | `#3b82f6` | ✅ ON |
| 8 | `river-discharge` | River Discharge Forecast | Open-Meteo Flood | `#14b8a6` | OFF |
| 9 | `soil-moisture` | Soil Moisture | Open-Meteo Forecast | `#a16207` | OFF |
| 10 | `extended-weather` | Snow & Wind Gusts | Open-Meteo Forecast | `#60a5fa` | OFF |
| 11 | `met-office-forecast` | Met Office Forecast | Met Office DataHub | `#f59e0b` | OFF |
| 12 | `cds-reanalysis` | ERA5-Land Reanalysis | Copernicus CDS | `#7c3aed` | OFF |

### Risk — Modelled & Statutory (10 layers)

Layers 13–18 fetch GeoJSON polygons via `/api/features/risk/:layer`, which queries ArcGIS FeatureServer endpoints. Fetching is **zoom-gated** (≥ zoom 7); the Layer Control shows a **"zoom in"** badge when a risk layer is active but zoom is insufficient.

| # | ID | Label | Source | Colour | Default |
|---|---|-------|--------|--------|---------||
| 13 | `risk-rivers-sea` | Risk — Rivers & Sea | ArcGIS FeatureServer (GeoJSON) | `#7c3aed` | OFF |
| 14 | `risk-surface-water` | Risk — Surface Water | ArcGIS FeatureServer (GeoJSON) | `#06b6d4` | OFF |
| 15 | `flood-zone-2` | Flood Zone 2 (Medium) | ArcGIS FeatureServer (GeoJSON) | `#818cf8` | OFF |
| 16 | `flood-zone-3` | Flood Zone 3 (High) | ArcGIS FeatureServer (GeoJSON) | `#c084fc` | OFF |
| 17 | `reservoir-dry` | Reservoir Extents (Dry) | ArcGIS FeatureServer (GeoJSON) | `#f472b6` | OFF |
| 18 | `reservoir-wet` | Reservoir Extents (Wet) | ArcGIS FeatureServer (GeoJSON) | `#fb7185` | OFF |
| 19 | `flood-warning-areas` | Flood Warning Areas | EA Flood Monitoring API | `#fbbf24` | OFF |
| 20 | `flood-risk-areas` | Flood Risk Areas (Defra) | Local Dataset (BNG→WGS84) | `#e879f9` | OFF |
| 21 | `llfa-boundaries` | LLFA Boundaries | Local Dataset (GeoJSON+XLSX) | `#10b981` | OFF |
| 22 | `imd-deprivation` | IMD Deprivation (2019) | IMD 2019 CSV + ONS FeatureServer | `#f43f5e` | OFF |

### Reference — Static / Historical (15 layers)

| # | ID | Label | Source | Colour | Default |
|---|---|-------|--------|--------|---------|
| 23 | `wfd-catchments` | WFD River Catchments | Local Dataset (BNG→WGS84) | `#0891b2` | OFF |
| 24 | `nfm-hotspots` | NFM Hotspots | Local Dataset (GeoJSON) | `#16a34a` | OFF |
| 25 | `schools` | Schools (State-Funded) | Local Dataset (CSV + geocoded) | `#f97316` | OFF |
| 26 | `hospitals` | Health & Care (CQC) | Local Dataset (CSV + geocoded) | `#ef4444` | OFF |
| 27 | `bathing-waters` | Bathing Water Quality | Local Dataset (EA classifications) | `#06b6d4` | OFF |
| 28 | `ramsar-wetlands` | Ramsar Wetlands (England) | Local Dataset (GeoJSON) | `#059669` | OFF |
| 29 | `water-company-boundaries` | Water Company Boundaries | Local Dataset (GeoJSON) | `#7c3aed` | OFF |
| 30 | `edm-overflows` | Storm Overflows (EDM 2024) | Local Dataset (GeoJSON) | `#b91c1c` | OFF |
| 31 | `winep-overflows` | WINEP Overflows (Under Investigation) | Local Dataset (GeoJSON) | `#f59e0b` | OFF |
| 32 | `flood-defences` | Flood Defences | Defra ArcGIS FeatureServer | `#22c55e` | OFF |
| 33 | `historic-floods` | Historic Flood Outlines | Defra ArcGIS FeatureServer | `#f97316` | OFF |
| 34 | `main-rivers` | Main Rivers | Defra ArcGIS FeatureServer | `#2563eb` | OFF |
| 35 | `os-map-light` | OS Light Map | Ordnance Survey ZXY Tiles | `#94a3b8` | OFF |
| 36 | `os-map-road` | OS Road Map | Ordnance Survey ZXY Tiles | `#64748b` | OFF |
| 37 | `os-map-outdoor` | OS Outdoor Map | Ordnance Survey ZXY Tiles | `#059669` | OFF |

Layer 38 (timeline dots) is rendered dynamically during timeline playback.

---

## Data Sources & Datasets

All data is fetched from the FloodMAS API server, which proxies, caches, and serves:

### External APIs (via server proxy)

| # | Source | Auth | Data Consumed |
|---|--------|------|---------------|
| 1 | **EA Flood Monitoring API** | None | Flood warnings, station readings (level/rainfall/tidal/groundwater), flood areas |
| 2 | **Open-Meteo Forecast** | None | Precipitation grid, soil moisture, snow depth, wind gusts, pressure |
| 3 | **Open-Meteo Flood** | None | 72h river discharge forecast |
| 4 | **Defra ArcGIS Online** | None | Flood defences, historic flood outlines, main rivers (FeatureServer) |
| 5 | **EA ArcGIS FeatureServer** | None | 6 risk polygon layers (rivers/sea, surface water, zones 2/3, reservoir dry/wet) — fetched as GeoJSON via `/api/features/risk/:layer`, zoom-gated (≥ 7) |
| 6 | **Bluesky AT Protocol** | None | Public social flood posts |
| 7 | **UKCEH NRFA** | None | National River Flow Archive gauging stations (~1,500+) |
| 8 | **Met Office DataHub** | API key | Official hourly site-specific forecast (temperature, wind, rain probability, UV) |
| 9 | **Copernicus CDS** | API key | ERA5-Land reanalysis (temperature, precipitation, soil moisture, snow cover) |
| 10 | **Ordnance Survey** | API key | Place name search (Names API) + 3 ZXY tile basemaps (Light, Road, Outdoor) |
| 11 | **MapTiler** | API key | Hybrid satellite basemap tiles |

Sources 1–7 are free public APIs. Sources 8–11 require API keys (configured server-side or in `layers.ts`).

### Local Datasets (via server `/api/datasets` + `/api/llfa`)

| Dataset | Content | Size | Use in Client |
|---|---|---|---|
| **Flood Risk Areas** | Defra APSFR polygons (BNG→WGS84) | 189 polygons | Layer 20: purple fill on map |
| **Flood Management (NAO)** | Defence condition, spend, homes protected, properties at risk by region/UTLA/LTLA | 9 CSV files | Statistics in PlaceSearch / Agent context |
| **Flood Risk Zone (GOV.UK)** | Defence & property counts by UTLA/constituency | 2 CSV files | Supplementary statistics |
| **RoFRS Postcodes** | Flood risk per postcode (269K postcodes) | 269K rows | PlaceSearch postcode risk lookup |
| **RoFRS Properties** | Property-level flood risk aggregation | 2.4M rows | National property risk summary |
| **LLFA Boundaries** | 218 county/UA boundaries + Russell LFRMS audit | GeoJSON + XLSX | Layer 21: green boundaries + info cards |
| **WFD River Catchments** | Cycle 2 river water body catchment polygons (BNG→WGS84) | 6,503 polygons | Layer 23: cyan boundary fill |
| **NFM Hotspots** | Natural flood management opportunity hotspot polygons | 857 polygons | Layer 24: green fill on map |
| **Schools (State-Funded)** | DfE Edubase state-funded schools, geocoded | 24,402 points | Layer 25: orange circles |
| **Health & Care (CQC)** | CQC-registered hospitals & care providers, geocoded | 1,259 points | Layer 26: red circles |
| **Bathing Water Quality** | EA designated bathing waters with rBWD classification | 460 points | Layer 27: colour-coded by classification |
| **Ramsar Wetlands** | Ramsar Convention wetland sites (England) | 1,291 polygons (73 sites) | Layer 28: emerald fill |
| **Water Company Boundaries** | Ofwat water company service area polygons | 432 polygons (27 companies) | Layer 29: violet boundary fill |
| **EDM Storm Overflows 2024** | EA/Rivers Trust storm overflow discharge points | 16,625 points | Layer 30: circles colour-coded by spill count |
| **WINEP Overflows** | WINEP intermittent discharge sites under investigation | 4,320 points | Layer 31: circles colour-coded by action type |

---

## Project Structure

```
client/
├── .env.production              # Production API URL (VITE_API_URL)
├── index.html
├── vite.config.ts               # Dev server + /api proxy
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx                 # React root, QueryClient provider
    ├── App.tsx                  # Layout: map + floating UI
    ├── index.css                # Tailwind directives + design tokens
    ├── components/
    │   ├── FloodMap.tsx         # MapLibre GL map + 38 layer sources/renderers
    │   ├── Header.tsx           # Top bar: brand, status indicators, clock, panel toggles, settings
    │   ├── LayerControl.tsx     # Left panel: 38 layer toggles, counts, zoom hints, collapsible legend
    │   ├── MapLegend.tsx        # Legend swatches (embedded in LayerControl as collapsible section)
    │   ├── SocialFeed.tsx       # Right panel: EA warnings + Bluesky feed with NLP highlighting
    │   ├── Timeline.tsx         # Historical timeline overlay (1947–2024)
    │   ├── AgentChat.tsx        # AI agent panel: chat, proactive scan, report gen, intel, graph tabs
    │   ├── AgentGraph.tsx       # A2A agent network diagram (coordinator → specialists)
    │   ├── IntelTab.tsx         # Agent tool reference panel (28 tools, grouped by specialist)
    │   ├── DraggablePanel.tsx   # Draggable/resizable panel with localStorage position persistence
    │   ├── BaseMapSelector.tsx  # Basemap style switcher (4 options, local SVG previews)
    │   ├── PlaceSearch.tsx      # OS place search + postcode risk lookup
    │   ├── Tutorial.tsx         # Interactive onboarding tutorial overlay
    │   ├── Tip.tsx              # Portal tooltip component
    │   └── landing/             # Landing page section components
    ├── config/
    │   ├── layers.ts            # 38 LayerConfigs, FeatureServer URLs, OS tile URLs, MapTiler key
    │   ├── intel.ts             # Agent tool knowledge base (33 tool descriptions + specialist roles)
    │   └── tutorial.ts          # Tutorial step definitions
    ├── context/
    │   └── MapContext.tsx        # maplibregl.Map ref shared via React context
    ├── data/
    │   └── floodHistory.ts      # Curated UK flood events 1947–2024 (timeline data)
    ├── hooks/
    │   ├── useFloodData.ts      # 33 TanStack Query hooks for all API endpoints
    │   └── useAgentChat.ts      # SSE streaming hook for agent chat sessions
    ├── services/
    │   └── api.ts               # Typed fetch wrappers + TypeScript interfaces (40+ types)
    └── stores/
        ├── layerStore.ts        # Zustand: visibleLayers Set + panel open/close
        └── agentChatStore.ts    # Zustand: agent messages, events, streaming state
```

---

## Architecture

### Component Tree

```
<QueryClientProvider>              ← TanStack Query (global cache)
  <MapProvider>                    ← MapContext (map ref)
    <App>
      <FloodMap />                 ← Full-screen MapLibre map (z-index: 0)
      <Header />                   ← Floating top bar
      <LayerControl />             ← Floating left panel
      <SocialFeed />               ← Floating right panel
      <MapLegend />                ← Floating bottom-left
      <Timeline />                 ← Floating bottom overlay
      <AgentChat />                ← Sliding right panel (AI agents)
      <PlaceSearch />              ← Floating top search bar
    </App>
  </MapProvider>
</QueryClientProvider>
```

### State Management

| Store | Technology | Contents |
|---|---|---|
| Server state | TanStack Query | API data, loading/error states, per-hook cache TTLs |
| Layer state | Zustand (`layerStore`) | `visibleLayers: Set<string>`, `mapZoom: number`, panel open/close + localStorage persistence |
| Agent state | Zustand (`agentChatStore`) | Messages, SSE events, agent statuses, streaming/proactive/report flags + localStorage persistence |
| Map ref | React Context | `maplibregl.Map` instance shared across all components |

### Data Fetching — All 24 Hooks

| Hook | Endpoint | Interval | Notes |
|---|---|---|---|
| `useFloodWarnings` | `GET /api/floods` | 5 min | Active EA warnings |
| `useWaterLevelStations` | `GET /api/stations?parameter=level` | 15 min | ~500 river gauges |
| `useRainfallStations` | `GET /api/stations?parameter=rainfall` | 15 min | ~500 rain gauges |
| `useTideGaugeStations` | `GET /api/stations` (tidal filter) | 15 min | Coastal tide gauges |
| `useGroundwaterStations` | `GET /api/stations` (groundwater filter) | 15 min | Groundwater monitors |
| `useLatestReadings` | `GET /api/stations/readings/latest` | 5 min | Most recent value per station |
| `useStationReadings` | `GET /api/stations/:id/readings` | 5 min | Time-series for one station |
| `usePrecipitationGrid` | `GET /api/weather/precipitation` | 30 min | 30-point UK grid |
| `useRiverDischargeGrid` | `GET /api/weather/river-discharge` | 30 min | Grid-based discharge forecast |
| `useRiverDischarge` | `GET /api/weather/river-discharge` | 30 min | Custom coord-based discharge |
| `useSoilMoistureGrid` | `GET /api/weather/soil-moisture` | 60 min | Soil saturation 0–7 cm |
| `useExtendedWeather` | `GET /api/weather/extended` | 30 min | Snow, wind, pressure, cloud |
| `useMetOfficeForecast` | `GET /api/metoffice/forecast` | 30 min | Official Met Office forecast |
| `useCDSReanalysis` | `GET /api/cds/reanalysis` | 60 min | ERA5-Land reanalysis |
| `useFloodDefences` | `GET /api/features/defences` | 60 min | Defence infrastructure |
| `useHistoricFloods` | `GET /api/features/historic-floods` | 60 min | Historic flood outlines |
| `useMainRivers` | `GET /api/features/main-rivers` | 60 min | Statutory main rivers |
| `useNRFAStations` | `GET /api/nrfa/stations` | 60 min | ~1,500 gauging stations |
| `useFloodWarningAreas` | `GET /api/flood-areas?type=FloodWarningArea` | 60 min | Warning area boundaries |
| `useFloodFeed` | `GET /api/social/feed` | 2 min | Combined EA + Bluesky |
| `useHealth` | `GET /api/health` | 30 sec | Service connectivity |
| `useFloodRiskAreas` | `GET /api/datasets/flood-risk-areas` | ∞ (static) | Defra APSFR polygons |
| `usePostcodeRisk` | `GET /api/datasets/postcode-risk` | ∞ (static) | Single postcode lookup |
| `usePropertyRiskSummary` | `GET /api/datasets/properties-risk-summary` | ∞ (static) | National property stats |
| `useLLFABoundaries` | `GET /api/llfa` | ∞ (static) | 218 LLFA boundary polygons |
| `useRiskLayerFeatures` | `GET /api/features/risk/:layer` | 5 min | GeoJSON polygons for 6 risk layer types; **zoom-gated** (enabled only when zoom ≥ 7 and bbox available) |
| `useIMDBoundaries` | `GET /api/imd` | 5 min | LSOA IMD polygons for map view; **zoom-gated** (enabled only when zoom ≥ 9 and bbox available) |

### Map Layer Rendering Order

MapLibre GL layers follow a strict z-order (bottom to top):

```
── Reference (bottom) ──
  OS Map tiles (Light / Road / Outdoor)
  Historic Flood Outlines (orange fill)
  Main Rivers (blue polylines)
  Flood Defences (green lines)
── Risk ──
  ArcGIS FeatureServer GeoJSON polygons (6 risk layers: rivers/sea, surface water, zones 2/3, reservoir dry/wet)
  Flood Warning Areas (amber outlines)
  Flood Risk Areas (purple fill)
  LLFA Boundaries (green/grey data-driven fill)
  IMD Deprivation (LSOA decile choropleth, zoom ≥ 9)
── Weather ──
  Soil Moisture, Extended Weather, CDS, Met Office (circles)
  River Discharge (teal circles)
  Precipitation (blue circles, size = intensity)
── Live (top) ──
  NRFA Flow Gauges
  Groundwater / Tidal / Rainfall stations
  Water Level Stations
  Flood Warnings (red/orange/yellow circles + pulsing halos)
```

Each layer is toggled via `useLayerStore`. A `useEffect` in `FloodMap` syncs `visibility: visible/none` on every MapLibre layer when `visibleLayers` changes.

### API URL Resolution

```
Development:  fetch('/api/floods')       → Vite proxy → localhost:3000
Production:   fetch('https://api.floodmas.lsattachiris.com/api/floods')
```

In development, Vite proxies `/api` → `http://localhost:3000`. In production, `VITE_API_URL` is baked into the bundle at build time.

---

## Getting Started

### Prerequisites

- Node.js 18+
- The FloodMAS API server running locally on port 3000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at [localhost:5173](http://localhost:5173). All `/api/*` requests are proxied to `http://localhost:3000`.

---

## Configuration

### Environment Variables

| Variable | File | Description |
|---|---|---|
| `VITE_API_URL` | `.env.production` | Full API base URL. Only needed for production builds. |

**`.env.production`:**
```env
VITE_API_URL=https://api.floodmas.lsattachiris.com/api
```

### Map Keys (in `src/config/layers.ts`)

| Key | Service | Notes |
|---|---|---|
| `MAPTILER_KEY` | MapTiler | Hybrid satellite basemap. Free tier available at maptiler.com |
| `OS_API_KEY` | Ordnance Survey | 3 ZXY tile basemaps + Names API. Free tier at osdatahub.os.uk |

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

```bash
cd client && npm run build
cd .. && npx firebase deploy --only hosting
```

Or use the `deploy.sh` / `deploy.bat` scripts in the repository root.

Firebase configuration (`firebase.json` in monorepo root):
- Public directory: `client/dist`
- SPA rewrite: all routes → `index.html`
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Cache-Control: immutable for hashed assets, no-cache for `index.html`

### Other Hosts

Standard static SPA. Deploy `dist/` to any host and configure:
1. Set `VITE_API_URL` as a build environment variable
2. Add a catch-all redirect: all routes → `index.html`

---

## Design System

Dark glassmorphism design via custom Tailwind tokens (`tailwind.config.js`) and CSS utilities (`src/index.css`).

### Colour Tokens

| Token | Value | Usage |
|---|---|---|
| `flood-bg` | `#0b0f1a` | Page background |
| `flood-surface` | `#111827` | Panel surfaces |
| `flood-accent` | `#38bdf8` | Interactive elements, brand gradient |
| `flood-text` | `#f1f5f9` | Primary text |
| `flood-textMuted` | `#94a3b8` | Secondary text |

### Severity Palette

| Level | Colour | Meaning |
|---|---|---|
| 1 — Severe | `#ef4444` (red-500) | Life-threatening conditions |
| 2 — Warning | `#f97316` (orange-500) | Flooding expected |
| 3 — Alert | `#eab308` (yellow-500) | Flooding possible |
| 4 — Expired | `#94a3b8` (slate-400) | No longer in force |

### Glass Panels

```css
.glass {
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### NLP Highlight Classes

| Class | Colour | Category |
|---|---|---|
| `.nlp-hazard` | blue | flood, flooding, inundation… |
| `.nlp-severity` | red | severe, extreme, catastrophic… |
| `.nlp-alert` | amber | warning, evacuation, emergency… |
| `.nlp-weather` | sky | storm, rainfall, cyclone… |
| `.nlp-location` | emerald | river, coast, dam, levee… |

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | 19.x | UI framework |
| `maplibre-gl` | 4.7.x | WebGL map engine |
| `@tanstack/react-query` | 5.x | Server state, caching, polling |
| `zustand` | 5.x | Client state (layers, agent chat) |
| `react-markdown` | 10.x | Agent chat message rendering |
| `remark-gfm` | 4.x | GFM tables/strikethrough in Markdown |
| `sonner` | 1.7.x | Toast notifications |
| `tailwindcss` | 3.4.x | Utility-first CSS |
| `vite` | 6.x | Build tool + dev server |
| `typescript` | 5.6.x | Type safety |

---

## Browser Support

Requires WebGL 2 for MapLibre GL:

- Chrome 80+
- Firefox 71+
- Safari 15+
- Edge 80+

---

*Part of the [FloodMAS](https://floodmas.lsattachiris.com) monorepo — a multi-agent flood intelligence system for the UK.*
