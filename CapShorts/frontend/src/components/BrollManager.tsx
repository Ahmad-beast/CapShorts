import React, { useState, useEffect } from 'react';
import { Film, Search, Key, Plus, Trash2, Eye, EyeOff, Sparkles, Clock, Check } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { BrollClip } from '../types';
import { formatTimeWithMs } from '../utils/timeFormat';

export const BrollManager: React.FC = () => {
  const {
    transcript,
    brollList,
    toggleBroll,
    addBroll,
    removeBroll,
    currentTime,
    setCurrentTime
  } = useVideoStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('opencaption_pexels_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Extract detected keywords from transcript
  const detectedKeywords = React.useMemo(() => {
    const set = new Set<string>();
    transcript.forEach(w => {
      if (w.keyword) {
        set.add(w.word.toLowerCase().replace(/[^a-z0-9]/g, ''));
      }
    });
    return Array.from(set);
  }, [transcript]);

  const handleSearch = async (kw: string) => {
    if (!kw.trim()) return;
    setSearchKeyword(kw);
    setIsSearching(true);

    try {
      const queryParams = new URLSearchParams({
        keyword: kw,
        api_key: apiKey
      });
      const res = await fetch(`/api/broll/search?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.warn("B-roll search fallback:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInsertClip = (clip: any) => {
    // Find closest keyword timestamp in transcript or use currentTime
    const matchedWord = transcript.find(
      w => w.word.toLowerCase().includes(clip.keyword)
    );
    const start = matchedWord ? matchedWord.start : currentTime;
    const end = start + Math.min(clip.duration || 3, 3.0);

    const newClip: BrollClip = {
      id: `broll-${Date.now()}`,
      keyword: clip.keyword,
      title: clip.title || `${clip.keyword.toUpperCase()} Clip`,
      preview_url: clip.preview_url,
      video_url: clip.video_url,
      duration: clip.duration || 3,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      enabled: true
    };

    addBroll(newClip);
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('opencaption_pexels_key', key);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 select-none">
      {/* Header & API Key Toggle */}
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Automated B-Roll Inserter
            </h3>
          </div>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-amber-400"
          >
            <Key className="w-3 h-3" />
            <span>{apiKey ? 'Pexels Key Set' : 'Add Pexels Key'}</span>
          </button>
        </div>

        {showKeyInput && (
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1.5 text-xs animate-fade">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Free Pexels API Key (Optional)</span>
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline"
              >
                Get Free Key
              </a>
            </div>
            <input
              type="password"
              placeholder="Paste Pexels API key for unlimited 4K portrait stock videos..."
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Search Input */}
        <div className="flex space-x-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vertical stock clips (e.g. money, rocket, city)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => handleSearch(searchKeyword)}
            disabled={isSearching}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </div>

        {/* Auto-detected Keywords Chips */}
        {detectedKeywords.length > 0 && (
          <div className="pt-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
              Keywords Found in Speech:
            </span>
            <div className="flex flex-wrap gap-1">
              {detectedKeywords.map(kw => (
                <button
                  key={kw}
                  onClick={() => handleSearch(kw)}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-[11px] flex items-center space-x-1 transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Search Results & Inserted Timeline B-Rolls */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Search Results Grid */}
        {searchResults.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Available Stock Clips ({searchResults.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {searchResults.map((clip) => (
                <div
                  key={clip.id}
                  className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col justify-between"
                >
                  <div className="relative h-28 bg-black">
                    <video
                      src={clip.preview_url}
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-zinc-300 font-mono">
                      {clip.duration}s
                    </div>
                  </div>

                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 truncate pr-2">
                      {clip.title}
                    </span>
                    <button
                      onClick={() => handleInsertClip(clip)}
                      className="flex items-center space-x-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold flex-shrink-0 transition-all shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Project B-Roll Overlay Segments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Timeline B-Roll Overlays ({brollList.length})
            </span>
          </div>

          {brollList.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              No B-roll overlays added yet. Search keywords above to insert portrait stock video clips.
            </div>
          ) : (
            <div className="space-y-2">
              {brollList.map((clip) => (
                <div
                  key={clip.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    clip.enabled
                      ? 'bg-zinc-900 border-zinc-700/80'
                      : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleBroll(clip.id)}
                      className={`p-1 rounded transition-colors ${
                        clip.enabled ? 'text-amber-400' : 'text-zinc-600'
                      }`}
                      title={clip.enabled ? 'Disable Overlay' : 'Enable Overlay'}
                    >
                      {clip.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div>
                      <h5 className="text-xs font-bold text-zinc-200">{clip.title}</h5>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400">
                        <span>{formatTimeWithMs(clip.start)}</span>
                        <span>→</span>
                        <span>{formatTimeWithMs(clip.end)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentTime(clip.start)}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => removeBroll(clip.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove B-Roll"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
