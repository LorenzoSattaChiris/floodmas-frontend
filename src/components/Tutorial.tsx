// ─── FloodMAS — Interactive Tutorial Controller ─────────────────────

import { useEffect, useRef } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TUTORIAL_STEPS } from '../config/tutorial';
import { useLayerStore } from '../stores/layerStore';
import { useAgentChatStore } from '../stores/agentChatStore';

const STORAGE_KEY = 'floodmas-tour-dismissed';

/** Snapshot of panel states before the tour, so we can restore after. */
interface PanelSnapshot {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  agentPanelOpen: boolean;
}

/** Open/close the required panels for a given step index. */
function prepareStep(index: number) {
  const agent = useAgentChatStore.getState();

  switch (index) {
    case 0: // Welcome — close everything for clean start
    case 1: // Map — full map view
      useLayerStore.setState({ leftPanelOpen: false, rightPanelOpen: false });
      if (agent.panelOpen) useAgentChatStore.setState({ panelOpen: false });
      break;

    case 2: // Layer Control — open left only
      useLayerStore.setState({ leftPanelOpen: true, rightPanelOpen: false });
      if (agent.panelOpen) useAgentChatStore.setState({ panelOpen: false });
      break;

    case 3: // Header Status — clean header view
    case 4: // Place Search — clean view
      useLayerStore.setState({ leftPanelOpen: false, rightPanelOpen: false });
      if (agent.panelOpen) useAgentChatStore.setState({ panelOpen: false });
      break;

    case 5: // Social Feed — open right only
      useLayerStore.setState({ leftPanelOpen: false, rightPanelOpen: true });
      if (agent.panelOpen) useAgentChatStore.setState({ panelOpen: false });
      break;

    case 6:  // Agent Chat
    case 7:  // Live Trace (illustration, keep agent open)
    case 8:  // Proactive tab
    case 9:  // Report tab
    case 10: // Intel tab
      useLayerStore.setState({ rightPanelOpen: false });
      if (!agent.panelOpen) useAgentChatStore.setState({ panelOpen: true });
      break;

    case 11: // Map Legend — close everything
    case 12: // Timeline
      useLayerStore.setState({ leftPanelOpen: false, rightPanelOpen: false });
      if (agent.panelOpen) useAgentChatStore.setState({ panelOpen: false });
      break;
  }
}

/** Restore the original panel layout after the tour finishes. */
function restorePanels(snapshot: PanelSnapshot) {
  useLayerStore.setState({
    leftPanelOpen: snapshot.leftPanelOpen,
    rightPanelOpen: snapshot.rightPanelOpen,
  });
  useAgentChatStore.setState({ panelOpen: snapshot.agentPanelOpen });
}

// ── CTA action handlers (last step buttons) ─────────────────────────

function handleCtaAction(action: string) {
  // Destroy the tour first
  if (driverInstance) {
    try { driverInstance.destroy(); } catch { /* ignore */ }
  }

  switch (action) {
    case 'layers':
      useLayerStore.setState({ leftPanelOpen: true });
      break;

    case 'chat':
      useAgentChatStore.setState({ panelOpen: true });
      // Pre-fill the chat input after panel renders
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const input = document.querySelector<HTMLInputElement>('.agent-chat-input');
          if (input) {
            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            nativeSetter?.call(input, 'Full flood risk briefing for York');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
        });
      });
      break;

    case 'timeline': {
      const btn = document.querySelector<HTMLButtonElement>('.timeline-toggle');
      btn?.click();
      break;
    }
  }
}

let ctaListener: ((e: MouseEvent) => void) | null = null;

function attachCtaListeners() {
  if (ctaListener) document.removeEventListener('click', ctaListener);
  ctaListener = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-tour-action]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const action = target.dataset.tourAction;
      if (action) handleCtaAction(action);
    }
  };
  document.addEventListener('click', ctaListener);
}

function removeCtaListeners() {
  if (ctaListener) {
    document.removeEventListener('click', ctaListener);
    ctaListener = null;
  }
}

// ── Singleton driver instance ────────────────────────────────────────

let driverInstance: Driver | null = null;

function createDriver(snapshot: PanelSnapshot): Driver {
  const isLast = (i: number) => i === TUTORIAL_STEPS.length - 1;
  const isFirst = (i: number) => i === 0;

  const tourSteps = TUTORIAL_STEPS.map((step, i) => {
    const handlers: Record<string, unknown> = {};

    // Next button: prepare panels before advancing
    if (!isLast(i)) {
      handlers.onNextClick = () => {
        prepareStep(i + 1);
        // Mark tutorial completed as soon as the user reaches the last step
        if (isLast(i + 1)) {
          localStorage.setItem(STORAGE_KEY, 'true');
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => driverInstance?.moveNext());
        });
      };
    } else {
      // Last step: "Done" destroys the tour
      handlers.doneBtnText = 'Done \u2192';
      handlers.onNextClick = () => {
        driverInstance?.destroy();
      };
    }

    // Previous button: prepare panels before going back
    if (!isFirst(i)) {
      handlers.onPrevClick = () => {
        prepareStep(i - 1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => driverInstance?.movePrevious());
        });
      };
    }

    return {
      ...step,
      popover: {
        ...step.popover,
        ...handlers,
      },
    };
  });

  return driver({
    showProgress: true,
    animate: true,
    smoothScroll: false,
    allowClose: true,
    stagePadding: 12,
    stageRadius: 14,
    popoverClass: 'floodmas-tour-popover',
    steps: tourSteps,

    onDestroyStarted: () => {
      localStorage.setItem(STORAGE_KEY, 'true');
      restorePanels(snapshot);
      removeCtaListeners();
      driverInstance?.destroy();
    },
  });
}

// ── Public API ───────────────────────────────────────────────────────

export function startTutorial() {
  const snapshot: PanelSnapshot = {
    leftPanelOpen: useLayerStore.getState().leftPanelOpen,
    rightPanelOpen: useLayerStore.getState().rightPanelOpen,
    agentPanelOpen: useAgentChatStore.getState().panelOpen,
  };

  if (driverInstance) {
    try { driverInstance.destroy(); } catch { /* ignore */ }
  }

  driverInstance = createDriver(snapshot);
  prepareStep(0);
  attachCtaListeners();

  requestAnimationFrame(() => {
    driverInstance?.drive();
  });
}

// ── Component (mounts once in App) ───────────────────────────────────

export default function Tutorial() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (dismissed) return;

    // Wait for the map + panels to settle
    const timer = setTimeout(() => {
      startTutorial();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null; // renders nothing — controller only
}
