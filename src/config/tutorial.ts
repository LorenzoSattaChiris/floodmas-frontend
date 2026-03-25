// ─── FloodMAS — Interactive Tutorial Step Definitions ────────────────

import type { DriveStep } from 'driver.js';

/**
 * Guided walkthrough steps for the FloodMAS dashboard.
 * Each step targets a `data-tour` attribute on a component.
 * Descriptions use HTML for rich visual content — badges, stats, illustrations.
 */
export const TUTORIAL_STEPS: DriveStep[] = [
  // 0. Welcome — no element, hero overview
  {
    popover: {
      title: 'Welcome to FloodMAS',
      description:
        '<div class="tour-hero">' +
          '<span class="tour-chip" style="--c:#0ea5e9">5 Live AI Agents</span>' +
          '<span class="tour-chip" style="--c:#14b8a6">27 Tools</span>' +
          '<span class="tour-chip" style="--c:#a855f6">20+ Data Sources</span>' +
          '<span class="tour-chip" style="--c:#f97316">2 ML Models (PINN &amp; LSTM)</span>' +
          '<span class="tour-chip" style="--c:#ef4444">28 Map Layers</span>' +
        '</div>' +
        '<p class="tour-desc">The UK\'s first autonomous multi-agent AI platform for real-time flood intelligence ' +
        'and emergency coordination. This short walkthrough introduces the system\'s key capabilities.</p>',
      side: 'over',
      align: 'center',
    },
  },

  // 1. Map
  {
    element: '[data-tour="map"]',
    popover: {
      title: 'Satellite Intelligence Map',
      description:
        '<span class="tour-badge">GEOSPATIAL</span>' +
        '<p class="tour-desc">Full-screen MapLibre GL map with 28 independently toggleable layers across four groups. ' +
        'Every layer is data-driven and supports click popups with contextual detail.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>28</strong> layers</span>' +
          '<span class="tour-stat"><strong>4</strong> groups</span>' +
          '<span class="tour-stat">MapLibre GL</span>' +
        '</div>',
      side: 'over',
      align: 'center',
    },
  },

  // 2. Layer Control
  {
    element: '[data-tour="layer-control"]',
    popover: {
      title: '28 Live Map Layers',
      description:
        '<span class="tour-badge">MAP LAYERS</span>' +
        '<p class="tour-desc">Toggle any layer on or off. Live layers refresh every 5–15 min from the Environment Agency and Open-Meteo. ' +
        'Risk layers show EA statutory flood zones, surface water models, and reservoir extents.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>5</strong> Live</span>' +
          '<span class="tour-stat"><strong>4</strong> Weather</span>' +
          '<span class="tour-stat"><strong>9</strong> Risk</span>' +
          '<span class="tour-stat"><strong>4</strong> Reference</span>' +
        '</div>',
      side: 'right',
      align: 'start',
    },
  },

  // 3. Status Indicators
  {
    element: '[data-tour="header-status"]',
    popover: {
      title: 'Live Service Health',
      description:
        '<span class="tour-badge">MONITORING</span>' +
        '<p class="tour-desc">Real-time health indicators for upstream APIs. Green confirms responding; red means unreachable. ' +
        'The live UK clock updates every second.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat">EA API</span>' +
          '<span class="tour-stat">Bluesky</span>' +
          '<span class="tour-stat">Live clock</span>' +
        '</div>',
      side: 'bottom',
      align: 'center',
    },
  },

  // 4. Place Search
  {
    element: '[data-tour="place-search"]',
    popover: {
      title: 'Location & Postcode Risk',
      description:
        '<span class="tour-badge">SEARCH</span>' +
        '<p class="tour-desc">Search any UK location by name via the Ordnance Survey Names API, or enter a postcode for property-level ' +
        'flood risk — with residential and non-residential breakdowns by severity.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>269K</strong> postcodes</span>' +
          '<span class="tour-stat">OS Names API</span>' +
        '</div>',
      side: 'bottom',
      align: 'center',
    },
  },

  // 5. Social Feed
  {
    element: '[data-tour="social-feed"]',
    popover: {
      title: 'Real-Time Flood Feed',
      description:
        '<span class="tour-badge">DATA FEEDS</span>' +
        '<p class="tour-desc">Two live streams: official EA flood warnings with severity badges, plus community flood reports from Bluesky. ' +
        'Text is segmented into five NLP categories — each in a distinct colour.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat">EA Warnings</span>' +
          '<span class="tour-stat">Bluesky</span>' +
          '<span class="tour-stat"><strong>5</strong> NLP categories</span>' +
        '</div>',
      side: 'left',
      align: 'start',
    },
  },

  // 6. Agent Chat
  {
    element: '[data-tour="agent-chat"]',
    popover: {
      title: 'Multi-Agent AI System',
      description:
        '<span class="tour-badge">AI AGENTS</span>' +
        '<p class="tour-desc">5 coordinated AI agents — a GPT-5.4 Coordinator plus 4 specialists — with 27 registered tools. ' +
        'Ask any flood question in natural language for a synthesised, evidence-based briefing.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>5</strong> agents</span>' +
          '<span class="tour-stat">GPT-5.4</span>' +
          '<span class="tour-stat"><strong>27</strong> tools</span>' +
        '</div>',
      side: 'left',
      align: 'start',
    },
  },

  // 7. Live Trace — no element (only visible during streaming), illustration
  {
    popover: {
      title: 'Agent Execution Trace',
      description:
        '<span class="tour-badge">LIVE TRACE</span>' +
        '<div class="tour-trace">' +
          '<div class="tour-trace-row"><span class="tour-dot" style="--c:#0ea5e9"></span><span class="tour-trace-label">Coordinator</span><span class="tour-trace-action">dispatch_specialists</span></div>' +
          '<div class="tour-trace-row"><span class="tour-dot" style="--c:#14b8a6"></span><span class="tour-trace-label">Forecasting</span><span class="tour-trace-action">get_river_levels</span></div>' +
          '<div class="tour-trace-row"><span class="tour-dot" style="--c:#a855f6"></span><span class="tour-trace-label">Monitoring</span><span class="tour-trace-action">check_warnings</span></div>' +
          '<div class="tour-trace-row"><span class="tour-dot" style="--c:#f97316"></span><span class="tour-trace-label">Risk Analysis</span><span class="tour-trace-action">assess_flood_risk</span></div>' +
          '<div class="tour-trace-row"><span class="tour-dot" style="--c:#ef4444"></span><span class="tour-trace-label">Emergency</span><span class="tour-trace-action">locate_resources</span></div>' +
        '</div>' +
        '<p class="tour-desc">Watch agents think in real time via SSE. Every specialist activation, tool call, and data retrieval ' +
        'is traced live with timestamps, agent colours, and an LLM call counter.</p>',
      side: 'over',
      align: 'center',
    },
  },

  // 8. Proactive Scan
  {
    element: '[data-tour="tab-proactive"]',
    popover: {
      title: 'Autonomous Scanning',
      description:
        '<span class="tour-badge">AUTONOMOUS</span>' +
        '<p class="tour-desc">One-click proactive monitoring: agents autonomously scan the entire UK for flood risks ' +
        'every 60 seconds for up to 5 cycles — zero human prompting required.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>60s</strong> interval</span>' +
          '<span class="tour-stat"><strong>5</strong> cycles</span>' +
          '<span class="tour-stat">Zero-prompt</span>' +
        '</div>',
      side: 'bottom',
      align: 'center',
    },
  },

  // 9. Report Generation
  {
    element: '[data-tour="tab-report"]',
    popover: {
      title: 'Report Generation',
      description:
        '<span class="tour-badge">REPORTING</span>' +
        '<p class="tour-desc">Generate comprehensive, print-ready flood risk assessment reports from conversation context. ' +
        'Includes multi-agent analysis, risk scores, recommended actions, and PDF export.</p>',
      side: 'bottom',
      align: 'center',
    },
  },

  // 10. Intel Tab
  {
    element: '[data-tour="tab-intel"]',
    popover: {
      title: 'Platform Intelligence',
      description:
        '<span class="tour-badge">TRANSPARENCY</span>' +
        '<p class="tour-desc">Explore every data source, AI agent, tool, and ML model powering the platform — ' +
        'live data-source table, interactive agent graph, full tool inventory, and ML model cards.</p>',
      side: 'bottom',
      align: 'center',
    },
  },

  // 11. Map Legend
  {
    element: '[data-tour="map-legend"]',
    popover: {
      title: 'Dynamic Map Legend',
      description:
        '<span class="tour-badge">UX</span>' +
        '<p class="tour-desc">Updates automatically as you toggle layers. Each active layer shows its colour swatch, ' +
        'severity scale, or data-range key.</p>',
      side: 'top',
      align: 'start',
    },
  },

  // 12. Timeline
  {
    element: '[data-tour="timeline"]',
    popover: {
      title: 'Historic Flood Timeline',
      description:
        '<span class="tour-badge">HISTORY</span>' +
        '<p class="tour-desc">Cinematic animated timeline of 23 major UK floods from 1947 to 2024. Stepped playback with camera fly-to, ' +
        'cumulative dot trails, and aggregate impact statistics.</p>' +
        '<div class="tour-stats">' +
          '<span class="tour-stat"><strong>23</strong> floods</span>' +
          '<span class="tour-stat"><strong>77</strong> years</span>' +
          '<span class="tour-stat">1947 – 2024</span>' +
        '</div>',
      side: 'top',
      align: 'center',
    },
  },

  // 13. Finish — no element
  {
    popover: {
      title: 'Start Exploring',
      description:
        '<p class="tour-desc" style="margin-bottom:8px">You\'re ready. Try any of these to begin:</p>' +
        '<div class="tour-cta">' +
          '<button class="tour-cta-item" data-tour-action="layers"><svg class="tour-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> Explore the live map layers</button>' +
          '<button class="tour-cta-item" data-tour-action="chat"><svg class="tour-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> Ask the agents a flood question</button>' +
          '<button class="tour-cta-item" data-tour-action="timeline"><svg class="tour-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Launch the historic flood timeline</button>' +
        '</div>',
      side: 'over',
      align: 'center',
    },
  },
];
