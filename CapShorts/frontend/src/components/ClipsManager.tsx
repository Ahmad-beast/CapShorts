import React from 'react';
import { Sparkles, Play, Flame, Download, Clock, Scissors, RotateCcw, Tag } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { apiUrl } from '../config';
import { formatTimeWithMs } from '../utils/timeFormat';
import { VideoClip } from '../types';

export const ClipsManager: React.FC = () => {
  const {
    clips,
    selectedClipId,
    selectClip,
    setCurrentTime,
    setIsPlaying,
    setIsExportModalOpen,
    transcript,
    duration,
    setClips
  } = useVideoStore();

  const handlePreviewClip = (clip: VideoClip) => {
    selectClip(clip.id);
    setCurrentTime(clip.start);
    setIsPlaying(true);
  };

  const handleExportClip = (clip: VideoClip) => {
    selectClip(clip.id);
    setIsExportModalOpen(true);
  };

  const handleResetToFullVideo = () => {
    selectClip(null);
    setCurrentTime(0);
  };

  const handleRegenerateClips = async () => {
    try {
      const res = await fetch(apiUrl('/api/clips/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: transcript,
          duration: duration || (transcript.length ? transcript[transcript.length - 1].end : 60),
          min_clip_duration: 25.0,
          max_clip_duration: 60.0
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.clips) {
          setClips(data.clips);
        }
      }
    } catch (err) {
      console.warn("Regenerate clips failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 select-none">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 flex items-center space-x-1.5">
              <span>AI Viral Shorts</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {clips.length}
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">Auto-detected 30s-60s Opus Clip highlights</p>
          </div>
        </div>

        <button
          onClick={handleRegenerateClips}
          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all"
          title="Regenerate Viral Clips"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Clip Banner if one is selected */}
      {selectedClipId && (
        <div className="bg-indigo-950/40 border-b border-indigo-800/40 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-indigo-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold">Focused on Short Clip</span>
          </div>
          <button
            onClick={handleResetToFullVideo}
            className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
          >
            Reset to Full Video
          </button>
        </div>
      )}

      {/* Clips Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Sparkles className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs font-semibold text-zinc-400">No clips generated yet</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
              Upload a long video (e.g. 10 minutes) and AI will automatically segment it into viral shorts.
            </p>
            <button
              onClick={handleRegenerateClips}
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Detect Clips Now
            </button>
          </div>
        ) : (
          clips.map((clip, index) => {
            const isSelected = selectedClipId === clip.id;
            return (
              <div
                key={clip.id}
                className={`group rounded-xl border p-3.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/40'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Top Row: Hook Score + Duration */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      <span>{clip.virality_score}% Viral Score</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Clip #{index + 1}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-[11px] text-zinc-400 font-mono">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{clip.duration}s</span>
                  </div>
                </div>

                {/* Title */}
                <h5 className="text-xs font-bold text-zinc-100 mb-1.5 leading-snug">
                  {clip.title}
                </h5>

                {/* Hook Snippet */}
                <p className="text-[11px] text-zinc-400 italic line-clamp-2 mb-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
                  "{clip.hook || clip.transcript_snippet}"
                </p>

                {/* Keywords */}
                {clip.keywords && clip.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {clip.keywords.slice(0, 4).map((kw, i) => (
                      <span key={i} className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1 border-t border-zinc-800/60">
                  <button
                    onClick={() => handlePreviewClip(clip)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSelected ? 'Playing Clip' : 'Preview Short'}</span>
                  </button>

                  <button
                    onClick={() => handleExportClip(clip)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
                    title="Export this Short in 9:16 vertical ratio"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export 9:16</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
