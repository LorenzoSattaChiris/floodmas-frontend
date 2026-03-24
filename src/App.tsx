import Header from './components/Header';
import LayerControl from './components/LayerControl';
import FloodMap from './components/FloodMap';
import MapLegend from './components/MapLegend';
import SocialFeed from './components/SocialFeed';
import Timeline from './components/Timeline';
import { MapProvider } from './context/MapContext';

export default function App() {
  return (
    <MapProvider>
      <div className="h-screen w-screen flex flex-col bg-flood-bg overflow-hidden">
        {/* Map fills entire viewport behind everything */}
        <div className="absolute inset-0 z-0">
          <FloodMap />
        </div>

        {/* Floating UI layer */}
        <div className="relative z-10 h-full flex flex-col pointer-events-none">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <LayerControl />
            <div className="flex-1" /> {/* spacer */}
            <SocialFeed />
          </div>
        </div>

        {/* Map legend — floating bottom-left */}
        <MapLegend />

        {/* Historical timeline — bottom overlay */}
        <Timeline />
      </div>
    </MapProvider>
  );
}
