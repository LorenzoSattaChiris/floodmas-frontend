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
