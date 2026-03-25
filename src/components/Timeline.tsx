import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapRef } from '../context/MapContext';
import {
  UK_FLOOD_HISTORY,
  getUniqueYears,
  type HistoricFloodEvent,
} from '../data/floodHistory';
import { MAP_INITIAL_VIEW } from '../config/layers';
import { Tip } from './Tip';

const YEARS = getUniqueYears();
const YEAR_MIN = YEARS[0];
const YEAR_MAX = YEARS[YEARS.length - 1];

/** Speed presets in ms per event */
const SPEEDS = [
  { label: '0.5×', ms: 6000, tip: 'Slow speed — 6 seconds per event' },
  { label: '1×',   ms: 3500, tip: 'Normal speed — 3.5 seconds per event' },
  { label: '2×',   ms: 2000, tip: 'Fast speed — 2 seconds per event' },
  { label: '4×',   ms: 1000, tip: 'Fastest speed — 1 second per event' },
];

const SEVERITY_COLORS: Record<number, string> = { 1: '#ef4444', 2: '#f97316', 3: '#eab308' };
const SEVERITY_LABELS: Record<number, string> = { 1: 'Catastrophic', 2: 'Major', 3: 'Significant' };

type Phase = 'idle' | 'intro' | 'playing' | 'outro';

const INTRO_DURATION = 4000;
const OUTRO_DURATION = 6000;

/** Aggregate stats from curated data */
const SUMMARY = {
  events: UK_FLOOD_HISTORY.length,
  yearsSpanned: YEAR_MAX - YEAR_MIN,
  deaths: '350+',
  properties: '230,000+',
  cost: '£8bn+',
};

// ─── Source & layer IDs for the timeline animation ──────────────────
const TL_SOURCE = 'timeline-events';
const TL_HALO = 'timeline-halo';
const TL_CIRCLES = 'timeline-circles';
const TL_PULSE = 'timeline-pulse';
const TL_AFFECTED = 'timeline-affected';
const TL_AFFECTED_SRC = 'timeline-affected-src';

export default function Timeline() {
  const mapRef = useMapRef();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layersAdded = useRef(false);
  const prevOpen = useRef(false);

  const currentEvent: HistoricFloodEvent | undefined = UK_FLOOD_HISTORY[eventIndex];
  const cumulativeEvents = UK_FLOOD_HISTORY.slice(0, eventIndex + 1);

  // ─── Add timeline map layers when opened ──────────────────────────
  const ensureLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || layersAdded.current) return;

    // Main event circles source
    if (!map.getSource(TL_SOURCE)) {
      map.addSource(TL_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Affected locations source
    if (!map.getSource(TL_AFFECTED_SRC)) {
      map.addSource(TL_AFFECTED_SRC, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Halo — large glowing area
    if (!map.getLayer(TL_HALO)) {
      map.addLayer({
        id: TL_HALO,
        type: 'circle',
        source: TL_SOURCE,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'radiusKm'],
            10, 40, 40, 80, 100, 140, 120, 180,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['case', ['get', 'isCurrent'], 0.18, 0.06],
          'circle-blur': 1.0,
        },
      });
    }

    // Main circles
    if (!map.getLayer(TL_CIRCLES)) {
      map.addLayer({
        id: TL_CIRCLES,
        type: 'circle',
        source: TL_SOURCE,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'severity'],
            1, 14, 2, 10, 3, 7,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['case', ['get', 'isCurrent'], 0.95, 0.35],
          'circle-stroke-width': ['case', ['get', 'isCurrent'], 2.5, 1],
          'circle-stroke-color': ['case',
            ['get', 'isCurrent'], 'rgba(255,255,255,0.9)',
            'rgba(255,255,255,0.2)',
          ],
        },
      });
    }

    // Pulse ring on current event
    if (!map.getLayer(TL_PULSE)) {
      map.addLayer({
        id: TL_PULSE,
        type: 'circle',
        source: TL_SOURCE,
        filter: ['==', ['get', 'isCurrent'], true],
        paint: {
          'circle-radius': 25,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0,
          'circle-stroke-width': 3,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.7,
        },
      });
    }

    // Affected location dots
    if (!map.getLayer(TL_AFFECTED)) {
      map.addLayer({
        id: TL_AFFECTED,
        type: 'circle',
        source: TL_AFFECTED_SRC,
        paint: {
          'circle-radius': 4,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });
    }

    layersAdded.current = true;
  }, [mapRef]);

  // ─── Clean up layers when timeline closes ─────────────────────────
  const removeLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !layersAdded.current) return;

    [TL_AFFECTED, TL_PULSE, TL_CIRCLES, TL_HALO].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    [TL_SOURCE, TL_AFFECTED_SRC].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
    layersAdded.current = false;
  }, [mapRef]);

  // ─── Sync map data when event changes ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !open || !layersAdded.current) return;

    // Build cumulative features
    const eventFeatures = cumulativeEvents.map((evt) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: evt.center },
      properties: {
        id: evt.id,
        name: evt.name,
        year: evt.year,
        severity: evt.severity,
        radiusKm: evt.radiusKm,
        color: SEVERITY_COLORS[evt.severity],
        isCurrent: evt.id === currentEvent?.id,
      },
    }));

    // Affected locations for current event only
    const affectedFeatures = (currentEvent?.affected || []).map((a) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: a.coords },
      properties: {
        name: a.name,
        color: SEVERITY_COLORS[currentEvent!.severity],
      },
    }));

    const src = map.getSource(TL_SOURCE) as maplibregl.GeoJSONSource;
    if (src) src.setData({ type: 'FeatureCollection', features: eventFeatures });

    const affSrc = map.getSource(TL_AFFECTED_SRC) as maplibregl.GeoJSONSource;
    if (affSrc) affSrc.setData({ type: 'FeatureCollection', features: affectedFeatures });

    // Animate camera fly-to for current event
    if (currentEvent) {
      map.flyTo({
        center: currentEvent.center,
        zoom: currentEvent.radiusKm > 80 ? 5.5 : currentEvent.radiusKm > 40 ? 6.5 : 8,
        pitch: 30,
        bearing: (eventIndex * 15) % 60 - 30,
        duration: 2200,
        essential: true,
      });
    }

    // Pulse animation
    animatePulse(map);
  }, [eventIndex, open, mapRef, currentEvent, cumulativeEvents, ensureLayers]);

  // ─── Pulse ring animation ─────────────────────────────────────────
  const pulseAnimRef = useRef<number | null>(null);

  function animatePulse(map: maplibregl.Map) {
    if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current);

    let start: number | null = null;
    const duration = 2000;

    function frame(ts: number) {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      const t = elapsed / duration;

      if (map.getLayer(TL_PULSE)) {
        // Expand from 15 to 50 and fade out
        const radius = 15 + t * 45;
        const opacity = 0.7 * (1 - t);
        map.setPaintProperty(TL_PULSE, 'circle-stroke-opacity', opacity);
        map.setPaintProperty(TL_PULSE, 'circle-radius', radius);
      }

      if (layersAdded.current) {
        pulseAnimRef.current = requestAnimationFrame(frame);
      }
    }

    pulseAnimRef.current = requestAnimationFrame(frame);
  }

  // ─── Intro / Outro phase engine ────────────────────────────────────
  const startIntro = useCallback(() => {
    setPhase('intro');
    setPlaying(false);
    setEventIndex(0);
    // Clear map layers during intro
    const map = mapRef.current;
    if (map) {
      const src = map.getSource(TL_SOURCE) as maplibregl.GeoJSONSource;
      if (src) src.setData({ type: 'FeatureCollection', features: [] });
      const affSrc = map.getSource(TL_AFFECTED_SRC) as maplibregl.GeoJSONSource;
      if (affSrc) affSrc.setData({ type: 'FeatureCollection', features: [] });
      map.flyTo({
        center: MAP_INITIAL_VIEW.center,
        zoom: 5.2,
        pitch: 45,
        bearing: -10,
        duration: 2800,
        essential: true,
      });
    }
    phaseTimerRef.current = setTimeout(() => {
      setPhase('playing');
      setPlaying(true);
    }, INTRO_DURATION);
  }, [mapRef]);

  const startOutro = useCallback(() => {
    setPhase('outro');
    setPlaying(false);
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: MAP_INITIAL_VIEW.center,
        zoom: 5.4,
        pitch: 30,
        bearing: 0,
        duration: 2500,
        essential: true,
      });
    }
    phaseTimerRef.current = setTimeout(() => {
      setPhase('idle');
    }, OUTRO_DURATION);
  }, [mapRef]);

  // ─── Playback engine ──────────────────────────────────────────────
  useEffect(() => {
    if (!playing || !open || phase !== 'playing') return;

    timerRef.current = setTimeout(() => {
      if (eventIndex < UK_FLOOD_HISTORY.length - 1) {
        setEventIndex((i) => i + 1);
      } else {
        startOutro();
      }
    }, SPEEDS[speedIdx].ms);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, eventIndex, speedIdx, open, phase, startOutro]);

  // ─── Open/close lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (open && !prevOpen.current) {
      // Opening — add layers + reset
      const map = mapRef.current;
      if (map) {
        ensureLayers();
      }
    }
    if (!open && prevOpen.current) {
      // Closing — clean up
      setPlaying(false);
      setEventIndex(0);
      setPhase('idle');
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      removeLayers();
      // Reset camera
      const map = mapRef.current;
      if (map) {
        map.flyTo({
          center: MAP_INITIAL_VIEW.center,
          zoom: MAP_INITIAL_VIEW.zoom,
          pitch: 0,
          bearing: 0,
          duration: 1500,
        });
      }
    }
    prevOpen.current = open;
  }, [open, mapRef, ensureLayers, removeLayers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      removeLayers();
    };
  }, [removeLayers]);

  // ─── Toggle button when closed ────────────────────────────────────
  if (!open) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto" data-tour="timeline">
        <Tip text="Explore 70+ years of major UK flood events visualised on the map" side="top">
          <button
            onClick={() => setOpen(true)}
            className="timeline-toggle group"
          >
            <span className="timeline-toggle-icon">&#9654;</span>
            <span className="timeline-toggle-text">Flood History</span>
            <span className="timeline-toggle-years">{YEAR_MIN} — {YEAR_MAX}</span>
          </button>
        </Tip>
      </div>
    );
  }

  // ─── Progress fraction ────────────────────────────────────────────
  const progress = UK_FLOOD_HISTORY.length > 1
    ? eventIndex / (UK_FLOOD_HISTORY.length - 1)
    : 0;

  // ─── Full timeline UI ─────────────────────────────────────────────
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto timeline-panel" data-tour="timeline">
      {/* Cinematic gradient backdrop */}
      <div className="timeline-backdrop" />

      <div className="relative px-6 pt-3 pb-4 max-w-screen-xl mx-auto">
        {/* Close button */}
        <Tip text="Close timeline and return to live map view" side="left">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-4 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            ✕
          </button>
        </Tip>

        {/* ─── Intro Band ─── */}
        {phase === 'intro' && (
          <div className="tl-intro-band mb-3">
            <span className="tl-intro-icon">🌊</span>
            <div className="tl-intro-copy">
              <h3 className="tl-intro-title">UK Flood History</h3>
              <p className="tl-intro-sub">{SUMMARY.yearsSpanned} years of rising waters</p>
            </div>
            <div className="tl-intro-right">
              <span className="tl-intro-range">{YEAR_MIN} — {YEAR_MAX}</span>
              <div className="tl-intro-bar-track">
                <div className="tl-intro-bar-fill" />
              </div>
              <span className="tl-intro-starting">Starting playback…</span>
            </div>
          </div>
        )}

        {/* ─── Outro Band ─── */}
        {phase === 'outro' && (
          <div className="tl-outro-band mb-3">
            <div className="tl-outro-stats">
              <div className="tl-outro-stat">
                <span className="tl-outro-val">{SUMMARY.events}</span>
                <span className="tl-outro-lbl">Major floods</span>
              </div>
              <div className="tl-outro-sep" />
              <div className="tl-outro-stat">
                <span className="tl-outro-val" style={{ color: '#f87171' }}>{SUMMARY.deaths}</span>
                <span className="tl-outro-lbl">Lives lost</span>
              </div>
              <div className="tl-outro-sep" />
              <div className="tl-outro-stat">
                <span className="tl-outro-val" style={{ color: '#fb923c' }}>{SUMMARY.properties}</span>
                <span className="tl-outro-lbl">Properties flooded</span>
              </div>
              <div className="tl-outro-sep" />
              <div className="tl-outro-stat">
                <span className="tl-outro-val" style={{ color: '#fbbf24' }}>{SUMMARY.cost}</span>
                <span className="tl-outro-lbl">Economic damage</span>
              </div>
            </div>
            <div className="tl-outro-footer">
              <p className="tl-outro-msg">
                Climate change is increasing flood frequency and severity across the UK.
              </p>
              <button
                onClick={() => { setPhase('idle'); if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current); }}
                className="tl-outro-btn"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ─── Event Info (playing / idle) ─── */}
        {(phase === 'playing' || phase === 'idle') && showInfo && currentEvent && (
          <div className="timeline-event-info mb-3">
            <div className="flex items-center gap-3">
              <span
                className="timeline-year-badge"
                style={{ '--severity-color': SEVERITY_COLORS[currentEvent.severity] } as React.CSSProperties}
              >
                {currentEvent.year}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{currentEvent.name}</h3>
                <p className="text-[10px] text-white/50 truncate">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                    style={{ background: SEVERITY_COLORS[currentEvent.severity] }}
                  />
                  {SEVERITY_LABELS[currentEvent.severity]} · {currentEvent.cause}
                  {currentEvent.affected.length > 0 && ` · ${currentEvent.affected.length} areas`}
                </p>
              </div>
              <Tip text="Collapse the current event description" side="top">
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-white/30 hover:text-white/60 text-xs shrink-0"
                >
                  Hide info
                </button>
              </Tip>
            </div>
            <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed line-clamp-2">
              {currentEvent.description}
            </p>
            <p className="text-[10px] text-white/40 mt-1 italic">{currentEvent.impact}</p>
          </div>
        )}
        {(phase === 'playing' || phase === 'idle') && !showInfo && (
        <Tip text="Show current flood event details" side="top">
          <button
            onClick={() => setShowInfo(true)}
            className="text-[9px] text-white/30 hover:text-white/50 mb-2"
          >
            Show info
          </button>
        </Tip>
        )}

        {/* ─── Progress Track ─── */}
        <div className="timeline-track-container mb-3">
          <div className="timeline-track">
            {/* Filled progress */}
            <div
              className="timeline-track-fill"
              style={{
                width: `${progress * 100}%`,
                background: currentEvent
                  ? `linear-gradient(90deg, ${SEVERITY_COLORS[3]}, ${SEVERITY_COLORS[currentEvent.severity]})`
                  : undefined,
              }}
            />

            {/* Event markers on the track */}
            {UK_FLOOD_HISTORY.map((evt, i) => {
              const pos = UK_FLOOD_HISTORY.length > 1 ? (i / (UK_FLOOD_HISTORY.length - 1)) * 100 : 0;
              const isCurrent = i === eventIndex;
              const isPast = i <= eventIndex;
              return (
                <button
                  key={evt.id}
                  className={`timeline-marker ${isCurrent ? 'timeline-marker-active' : ''} ${isPast ? 'timeline-marker-past' : ''}`}
                  style={{
                    left: `${pos}%`,
                    '--marker-color': SEVERITY_COLORS[evt.severity],
                  } as React.CSSProperties}
                  onClick={() => { setEventIndex(i); setPlaying(false); }}
                  title={`${evt.year} — ${evt.name}`}
                />
              );
            })}
          </div>

          {/* Year labels under the track */}
          <div className="timeline-year-labels">
            {YEARS.filter((_, i) => i % Math.ceil(YEARS.length / 8) === 0 || i === YEARS.length - 1).map((yr) => {
              const evtIdx = UK_FLOOD_HISTORY.findIndex((e) => e.year === yr);
              const pos = UK_FLOOD_HISTORY.length > 1 ? (evtIdx / (UK_FLOOD_HISTORY.length - 1)) * 100 : 0;
              return (
                <span
                  key={yr}
                  className="timeline-year-label"
                  style={{ left: `${pos}%` }}
                >
                  {yr}
                </span>
              );
            })}
          </div>
        </div>

        {/* ─── Controls Row ─── */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Playback */}
          <div className="flex items-center gap-2">
            {/* Skip backward */}
            <Tip text="Go to previous flood event" side="top">
              <button
                onClick={() => { setEventIndex(Math.max(0, eventIndex - 1)); setPlaying(false); }}
                disabled={eventIndex === 0}
                className="timeline-btn"
              >
                ⏮
              </button>
            </Tip>

            {/* Play / Pause */}
            <Tip text={playing || phase === 'intro' ? 'Pause playback' : eventIndex >= UK_FLOOD_HISTORY.length - 1 ? 'Restart from the beginning' : 'Start playback from this event'} side="top">
              <button
                onClick={() => {
                  if (phase === 'intro' || phase === 'outro') return;
                  if (eventIndex >= UK_FLOOD_HISTORY.length - 1 || phase === 'idle') {
                    startIntro();
                  } else {
                    setPlaying(!playing);
                  }
                }}
                className="timeline-play-btn"
                disabled={phase === 'intro' || phase === 'outro'}
              >
                {playing || phase === 'intro' ? '⏸' : '▶'}
              </button>
            </Tip>

            {/* Skip forward */}
            <Tip text="Go to next flood event" side="top">
              <button
                onClick={() => { setEventIndex(Math.min(UK_FLOOD_HISTORY.length - 1, eventIndex + 1)); setPlaying(false); }}
                disabled={eventIndex >= UK_FLOOD_HISTORY.length - 1}
                className="timeline-btn"
              >
                ⏭
              </button>
            </Tip>
          </div>

          {/* Center: Counter */}
          <div className="text-center">
            <span className="text-[10px] text-white/40 tabular-nums">
              {eventIndex + 1} / {UK_FLOOD_HISTORY.length} events
            </span>
          </div>

          {/* Right: Speed */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s, i) => (
              <Tip key={s.label} text={s.tip} side="top">
                <button
                  onClick={() => setSpeedIdx(i)}
                  className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
                    i === speedIdx
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {s.label}
                </button>
              </Tip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
