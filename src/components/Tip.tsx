// ─── FloodMAS — Portal Tooltip ───────────────────────────────────────────────
// Renders the tooltip via React portal so it escapes overflow:hidden containers.

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TipProps {
  /** Tooltip label text */
  text: string;
  /** Which side of the element to render on. Defaults to 'top'. */
  side?: Side;
  children: React.ReactNode;
  /** Controls the CSS display of the wrapper span. Use 'block' for full-width children, 'flex' for flex items. */
  wrap?: 'auto' | 'block' | 'flex';
  /** Extra className applied to the wrapper span (e.g. 'flex-1') */
  wrapClass?: string;
  /** Hover delay in ms before tooltip appears. Defaults to 350. */
  delay?: number;
}

const TRANSFORMS: Record<Side, string> = {
  top:    'translateX(-50%) translateY(calc(-100% - 7px))',
  bottom: 'translateX(-50%) translateY(7px)',
  left:   'translateX(calc(-100% - 7px)) translateY(-50%)',
  right:  'translateX(7px) translateY(-50%)',
};

export function Tip({ text, side = 'top', children, wrap = 'auto', wrapClass, delay = 350 }: TipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [clamped, setClamped] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After the tooltip mounts, measure it and clamp within the viewport
  const tipRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const pad = 8;
    let { top, left } = pos;

    // For right/left tooltips, the transform positions the element relative
    // to pos — we need to clamp the final rendered rect
    if (rect.right > window.innerWidth - pad) {
      left -= rect.right - (window.innerWidth - pad);
    }
    if (rect.left < pad) {
      left += pad - rect.left;
    }
    if (rect.bottom > window.innerHeight - pad) {
      top -= rect.bottom - (window.innerHeight - pad);
    }
    if (rect.top < pad) {
      top += pad - rect.top;
    }

    if (top !== pos.top || left !== pos.left) {
      setClamped({ top, left });
    }
  }, [pos]);

  const handleEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let top: number, left: number;
      switch (side) {
        case 'top':    top = r.top;               left = r.left + r.width / 2; break;
        case 'bottom': top = r.bottom;            left = r.left + r.width / 2; break;
        case 'left':   top = r.top + r.height / 2; left = r.left;             break;
        default:       top = r.top + r.height / 2; left = r.right;            break; // right
      }
      setPos({ top, left });
      setClamped({ top, left });
      setVisible(true);
    }, delay);
  };

  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  const displayStyle = wrap === 'block' ? 'block' : wrap === 'flex' ? 'flex' : 'inline-flex';

  return (
    <>
      <span
        ref={wrapRef}
        style={{ display: displayStyle }}
        className={wrapClass}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </span>
      {visible && createPortal(
        <div
          ref={tipRef}
          className={`tip-popup tip-popup-${side}`}
          style={{ top: clamped.top, left: clamped.left, transform: TRANSFORMS[side] }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}
