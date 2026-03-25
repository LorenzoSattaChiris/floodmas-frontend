// ─── Feature Hint Dots — post-tutorial nudges ───────────────────────

import { useState, useEffect, useCallback, type ReactNode } from 'react';

const TOUR_KEY = 'floodmas-tour-dismissed';
const HINTS_KEY = 'floodmas-hints-dismissed';

type HintId = 'layers' | 'feed' | 'tutorial' | 'agents';

const HINT_LABELS: Record<HintId, string> = {
  layers:   'Open the map layers panel to toggle flood data overlays',
  feed:     'Open the live NLP feed — EA warnings & social posts',
  tutorial: 'Replay the guided platform tour anytime',
  agents:   'Open AI agent orchestration — chat, monitoring & reports',
};

function getDismissed(): Set<HintId> {
  try {
    const raw = localStorage.getItem(HINTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dismiss(id: HintId) {
  const set = getDismissed();
  set.add(id);
  localStorage.setItem(HINTS_KEY, JSON.stringify([...set]));
}

/** Wrap a header button to show a subtle hint dot after the tutorial. */
export function FeatureHint({ id, children }: { id: HintId; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tourDone = localStorage.getItem(TOUR_KEY) === 'true';
    const alreadyDismissed = getDismissed().has(id);
    setVisible(tourDone && !alreadyDismissed);
  }, [id]);

  const handleInteract = useCallback(() => {
    if (!visible) return;
    dismiss(id);
    setVisible(false);
  }, [id, visible]);

  if (!visible) return <>{children}</>;

  return (
    <span className="feature-hint-wrap" onClick={handleInteract}>
      {children}
      <span className="feature-hint-dot" />
      <span className="feature-hint-tooltip">{HINT_LABELS[id]}</span>
    </span>
  );
}
