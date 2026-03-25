import { useState, useRef, useCallback, useEffect } from 'react';
import { useMapRef } from '../context/MapContext';
import { fetchOSPlaceSearch, fetchPostcodeRiskSearch, type OSPlaceResult, type PostcodeRisk } from '../services/api';

/** Quick check: does the input look like a UK postcode or prefix? */
function looksLikePostcode(q: string): boolean {
  return /^[A-Z]{1,2}\d/i.test(q.trim());
}

function riskColor(entry: PostcodeRisk): string {
  if (entry.high.total > 0) return '#ef4444';
  if (entry.medium.total > 0) return '#f97316';
  if (entry.low.total > 0) return '#eab308';
  return '#22c55e';
}

function riskLabel(entry: PostcodeRisk): string {
  if (entry.high.total > 0) return 'High';
  if (entry.medium.total > 0) return 'Medium';
  if (entry.low.total > 0) return 'Low';
  return 'Very Low';
}

export default function PlaceSearch() {
  const mapRef = useMapRef();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OSPlaceResult[]>([]);
  const [postcodeResults, setPostcodeResults] = useState<PostcodeRisk[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setPostcodeResults([]); return; }
    setLoading(true);
    try {
      const promises: [Promise<{ results: OSPlaceResult[] }>, Promise<PostcodeRisk[]> | null] = [
        fetchOSPlaceSearch(q, 8),
        looksLikePostcode(q) ? fetchPostcodeRiskSearch(q, 5) : null,
      ];
      const [osData, pcData] = await Promise.all([
        promises[0],
        promises[1] ?? Promise.resolve([]),
      ]);
      setResults(osData.results);
      setPostcodeResults(pcData);
      setOpen(osData.results.length > 0 || pcData.length > 0);
    } catch { setResults([]); setPostcodeResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 350);
  }, [search]);

  const flyTo = useCallback((place: OSPlaceResult) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [place.lon, place.lat], zoom: 13, duration: 1800 });
    setQuery(place.name);
    setOpen(false);
  }, [mapRef]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-72" data-tour="place-search">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search UK places…"
          className="w-full px-3 py-1.5 pl-8 text-[11px] rounded-lg glass text-white placeholder:text-white/30
                     border border-white/[0.06] focus:border-flood-accent/40 focus:outline-none
                     transition-colors duration-200"
        />
        {/* Search icon */}
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        {loading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-flood-accent/40 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {open && (results.length > 0 || postcodeResults.length > 0) && (
        <ul className="mt-1 glass rounded-lg border border-white/[0.06] max-h-60 overflow-y-auto shadow-xl shadow-black/30">
          {/* Postcode risk results */}
          {postcodeResults.length > 0 && (
            <>
              <li className="px-3 py-1.5 border-b border-white/[0.06]">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Flood Risk by Postcode</span>
              </li>
              {postcodeResults.map((pc) => (
                <li key={pc.postcode}>
                  <div className="w-full text-left px-3 py-2 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/90">{pc.postcode}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium ml-auto"
                            style={{ background: `${riskColor(pc)}22`, color: riskColor(pc) }}>
                        {riskLabel(pc)} risk
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[9px] text-white/50">
                      <span>{pc.totalProperties} properties</span>
                      {pc.high.total > 0 && <span className="text-red-400">{pc.high.total} high</span>}
                      {pc.medium.total > 0 && <span className="text-orange-400">{pc.medium.total} medium</span>}
                      {pc.low.total > 0 && <span className="text-yellow-400">{pc.low.total} low</span>}
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}
          {/* OS place results */}
          {results.map((r, i) => (
            <li key={`${r.name}-${r.lat}-${i}`}>
              <button
                onClick={() => flyTo(r)}
                className="w-full text-left px-3 py-2 hover:bg-white/[0.06] transition-colors duration-150
                           border-b border-white/[0.03] last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/90 truncate">{r.name}</span>
                  <span className="text-[9px] text-white/30 ml-auto shrink-0">{r.localType}</span>
                </div>
                <div className="text-[9px] text-white/40 truncate">
                  {[r.populatedPlace, r.county, r.postcodeDistrict].filter(Boolean).join(' · ')}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
