// ─── DraggablePanel ───────────────────────────────────────────────────────────
// Wraps any panel with fixed-position, drag (from [data-drag-handle] children),
// and 8-direction resize.  Completely transparent shell — all visual styling
// stays inside the wrapped component.
//
// Position is persisted to localStorage so panels remember where you left them
// across page reloads and browser sessions.

import { useState, useRef, useEffect, useCallback } from 'react';

// ── localStorage-backed position cache ─────────────────────────────────────
const STORAGE_PREFIX = 'floodmas-panel-';
type PanelState = { x: number; y: number; w: number; h: number };
const posCache = new Map<string, PanelState>();

function loadCached(id: string): PanelState | undefined {
  const mem = posCache.get(id);
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) {
      const parsed = JSON.parse(raw) as PanelState;
      posCache.set(id, parsed);
      return parsed;
    }
  } catch { /* ignore corrupt data */ }
  return undefined;
}

function saveCached(id: string, state: PanelState) {
  posCache.set(id, state);
  try { localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state)); } catch { /* quota */ }
}

/** Clear all saved panel positions and toggle states — call then reload. */
export function resetPanelLayout() {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('floodmas-')) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  posCache.clear();
}

// ── Types ──────────────────────────────────────────────────────────────────
type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface DraggablePanelProps {
  /** Stable cache key — if omitted, position resets on every mount */
  id: string;
  /** Distance from left edge (px).  Use defaultRight for right-anchored panels. */
  defaultLeft?: number;
  /** Distance from right edge (px) — converted to absolute left on first mount. */
  defaultRight?: number;
  /** Distance from top edge (px). */
  defaultTop: number;
  /** Initial width (px). */
  defaultWidth: number;
  minWidth?: number;
  minHeight?: number;
  zIndex?: number;
  children: React.ReactNode;
}

const DIR_CURSORS: Record<ResizeDir, string> = {
  n: 'ns-resize',  s: 'ns-resize',
  e: 'ew-resize',  w: 'ew-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  nw: 'nwse-resize', se: 'nwse-resize',
};

const DIRS: ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

// ── Component ──────────────────────────────────────────────────────────────
export default function DraggablePanel({
  id,
  defaultLeft,
  defaultRight,
  defaultTop,
  defaultWidth,
  minWidth = 180,
  minHeight = 120,
  zIndex = 30,
  children,
}: DraggablePanelProps) {
  const [state, setState] = useState<PanelState>(() => {
    const cached = loadCached(id);
    if (cached) return cached;
    return {
      x:
        defaultRight !== undefined
          ? window.innerWidth - defaultWidth - defaultRight
          : (defaultLeft ?? 12),
      y: defaultTop,
      w: defaultWidth,
      h: window.innerHeight - defaultTop - 16,
    };
  });

  // Persist position to cache + localStorage whenever it changes
  useEffect(() => {
    saveCached(id, state);
  }, [id, state]);

  const panelRef = useRef<HTMLDivElement>(null);
  const drag   = useRef<{ ox: number; oy: number; px: number; py: number } | null>(null);
  const resize = useRef<{
    dir: ResizeDir;
    ox: number; oy: number;
    px: number; py: number;
    pw: number; ph: number;
  } | null>(null);

  // ── Drag: only from [data-drag-handle], skip interactive children ─────────
  const onPanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-drag-handle]')) return;
      if (target.closest('button, input, select, textarea, a, [role="button"], [role="slider"]'))
        return;
      e.preventDefault();
      document.body.style.userSelect = 'none';
      drag.current = { ox: e.clientX, oy: e.clientY, px: state.x, py: state.y };
    },
    [state.x, state.y],
  );

  // ── Resize: initiated from edge/corner hit zones ──────────────────────────
  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, dir: ResizeDir) => {
      e.preventDefault();
      e.stopPropagation();
      document.body.style.userSelect = 'none';
      resize.current = {
        dir,
        ox: e.clientX, oy: e.clientY,
        px: state.x,   py: state.y,
        pw: state.w,   ph: state.h,
      };
    },
    [state],
  );

  // ── Global mouse move / up ────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (drag.current) {
        const dx = e.clientX - drag.current.ox;
        const dy = e.clientY - drag.current.oy;
        setState((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(window.innerWidth  - 60, drag.current!.px + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 40, drag.current!.py + dy)),
        }));
      } else if (resize.current) {
        const r = resize.current;
        const dx = e.clientX - r.ox;
        const dy = e.clientY - r.oy;
        let nx = r.px, ny = r.py, nw = r.pw, nh = r.ph;

        if (r.dir.includes('e')) nw = Math.max(minWidth,  r.pw + dx);
        if (r.dir.includes('w')) { nw = Math.max(minWidth,  r.pw - dx); nx = r.px + r.pw - nw; }
        if (r.dir.includes('s')) nh = Math.max(minHeight, r.ph + dy);
        if (r.dir.includes('n')) { nh = Math.max(minHeight, r.ph - dy); ny = r.py + r.ph - nh; }

        setState({ x: nx, y: ny, w: nw, h: nh });
      }
    };

    const onUp = () => {
      drag.current   = null;
      resize.current = null;
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [minWidth, minHeight]);

  return (
    <div
      ref={panelRef}
      // Shell is pointer-events: none so empty panels don't block the map.
      // Children (which have pointer-events-auto on themselves) still receive events.
      style={{
        position: 'fixed',
        left:   state.x,
        top:    state.y,
        width:  state.w,
        height: state.h,
        zIndex,
        pointerEvents: 'none',
      }}
      onMouseDown={onPanelMouseDown}
    >
      {children}

      {/* ── Resize handles — invisible hit zones, cursor affordance only ── */}
      {DIRS.map((dir) => (
        <div
          key={dir}
          className={`dp-resize dp-resize-${dir}`}
          style={{ cursor: DIR_CURSORS[dir] }}
          onMouseDown={(e) => onResizeMouseDown(e, dir)}
        />
      ))}
    </div>
  );
}
