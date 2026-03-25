import { useIsFetching } from '@tanstack/react-query';
import Header from './components/Header';
import LayerControl from './components/LayerControl';
import FloodMap from './components/FloodMap';

import PlaceSearch from './components/PlaceSearch';
import SocialFeed from './components/SocialFeed';
import Timeline from './components/Timeline';
import AgentChat from './components/AgentChat';
import DraggablePanel from './components/DraggablePanel';
import Tutorial from './components/Tutorial';
import { MapProvider } from './context/MapContext';
import { useLayerStore } from './stores/layerStore';
import { useAgentChatStore } from './stores/agentChatStore';

/** Thin top-of-page progress bar — shows while any API data is being fetched (excluding health pings) */
function GlobalLoadingBar() {
  const count = useIsFetching({ predicate: (q) => q.queryKey[0] !== 'health' });
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] overflow-hidden pointer-events-none"
      style={{ height: '2px', opacity: count > 0 ? 1 : 0, transition: 'opacity 0.4s ease' }}
    >
      <style>{`@keyframes _floodbar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
      <div
        className="h-full w-1/2 bg-gradient-to-r from-sky-400 via-flood-accent to-indigo-400"
        style={{ animation: '_floodbar 1.1s ease-in-out infinite', boxShadow: '0 0 6px rgba(56,189,248,0.7)' }}
      />
    </div>
  );
}

function Panels() {
  const { leftPanelOpen, rightPanelOpen } = useLayerStore();
  const agentPanelOpen = useAgentChatStore((s) => s.panelOpen);

  return (
    <>
      {leftPanelOpen && (
        <DraggablePanel id="layer-control" defaultLeft={12} defaultTop={56} defaultWidth={256} zIndex={30}>
          <LayerControl />
        </DraggablePanel>
      )}
      {rightPanelOpen && (
        <DraggablePanel id="social-feed" defaultRight={12} defaultTop={56} defaultWidth={288} zIndex={30}>
          <SocialFeed />
        </DraggablePanel>
      )}
      {agentPanelOpen && (
        <DraggablePanel id="agent-chat" defaultRight={16} defaultTop={52} defaultWidth={380} zIndex={40}>
          <AgentChat />
        </DraggablePanel>
      )}
    </>
  );
}

export default function App() {
  return (
    <MapProvider>
      <div className="h-screen w-screen bg-flood-bg overflow-hidden">
        <GlobalLoadingBar />
        {/* Map fills entire viewport */}
        <div className="absolute inset-0 z-0">
          <FloodMap />
        </div>

        {/* Floating header + place search */}
        <div className="relative z-10 flex flex-col pointer-events-none">
          <Header />
          <PlaceSearch />
        </div>

        {/* Draggable / resizable panels */}
        <Panels />

        {/* Historical timeline — bottom overlay */}
        <Timeline />

        {/* Guided tour — auto-starts on first visit */}
        <Tutorial />
      </div>
    </MapProvider>
  );
}
