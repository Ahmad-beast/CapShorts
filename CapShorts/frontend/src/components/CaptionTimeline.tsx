import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Trash2, Plus, Edit2, Check, Clock, Volume2, Flame, Languages } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { WordToken } from '../types';
import { formatTimeWithMs } from '../utils/timeFormat';

export const CaptionTimeline: React.FC = () => {
  const {
    transcript,
    currentTime,
    setCurrentTime,
    updateWord,
    deleteWord,
    addWord,
    toggleKeyword,
    isPlaying,
    clips,
    selectedClipId,
    convertTranscriptScript
  } = useVideoStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filterKeywordOnly, setFilterKeywordOnly] = useState(false);
  const [filterClipOnly, setFilterClipOnly] = useState(true);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeClip = useMemo(() => {
    return selectedClipId ? clips.find(c => c.id === selectedClipId) : null;
  }, [selectedClipId, clips]);

  // Auto-scroll timeline to active word during playback
  useEffect(() => {
    if (isPlaying && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentTime, isPlaying]);

  const handleWordClick = (word: WordToken) => {
    setCurrentTime(word.start);
  };

  const handleStartEdit = (word: WordToken, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(word.id);
    setEditText(word.word);
  };

  const handleSaveEdit = (index: number) => {
    if (editingId) {
      updateWord(index, { word: editText.trim() });
      setEditingId(null);
    }
  };

  const handleAddNewWord = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = transcript[index];
    const newWord: WordToken = {
      id: `w-new-${Date.now()}`,
      word: 'NewWord',
      start: round(current.end, 2),
      end: round(current.end + 0.35, 2),
      keyword: false
    };
    addWord(newWord, index);
  };

  const round = (val: number, decimals: number) => {
    return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/70 border-t border-zinc-800 select-none">
      {/* Timeline Controls Header */}
      <div className="h-10 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-200">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Word-by-Word Timeline</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
              {transcript.length} words
            </span>
          </div>

          {activeClip && (
            <div className="flex items-center space-x-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>Short Clip Active: {activeClip.duration}s</span>
            </div>
          )}

          <div className="text-[11px] text-zinc-500 hidden md:inline">
            Click any word to seek • Click pencil to edit spelling
          </div>
        </div>

        {/* Filter Keywords */}
        <div className="flex items-center space-x-2">
          {activeClip && (
            <button
              onClick={() => setFilterClipOnly(!filterClipOnly)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs transition-colors ${
                filterClipOnly
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{filterClipOnly ? 'Showing Clip Words' : 'Show All Words'}</span>
            </button>
          )}

          <button
            onClick={() => setFilterKeywordOnly(!filterKeywordOnly)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
              filterKeywordOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Keywords Only</span>
          </button>

          <button
            onClick={() => convertTranscriptScript('roman_urdu')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
            title="Convert any Hindi/Devanagari words into clean Roman Urdu / English letters"
          >
            <Languages className="w-3 h-3 text-indigo-400" />
            <span>Roman Urdu</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Word Cards Track */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden p-3 flex items-center space-x-2.5 scroll-smooth"
      >
        {transcript.length === 0 ? (
          <div className="flex items-center justify-center w-full text-xs text-zinc-500">
            No transcribed words available. Upload a video or load sample to generate captions.
          </div>
        ) : (
          transcript.map((item, index) => {
            if (filterKeywordOnly && !item.keyword) return null;
            if (activeClip && filterClipOnly) {
              if (item.end < activeClip.start || item.start > activeClip.end) {
                return null;
              }
            }

            const isCurrentlySpeaking = currentTime >= item.start && currentTime <= item.end;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                ref={isCurrentlySpeaking ? activeWordRef : null}
                onClick={() => handleWordClick(item)}
                className={`relative flex-shrink-0 group flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-150 cursor-pointer min-w-[120px] max-w-[160px] h-[86px] ${
                  isCurrentlySpeaking
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : item.keyword
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Top Timing & Keyword Indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center space-x-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTimeWithMs(item.start)}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKeyword(index);
                    }}
                    className={`p-0.5 rounded transition-colors ${
                      item.keyword ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                    title="Toggle Viral Keyword Highlight"
                  >
                    <Sparkles className="w-3 h-3 fill-current" />
                  </button>
                </div>

                {/* Center Word Text or Inline Input */}
                <div className="my-1">
                  {isEditing ? (
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(index);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-zinc-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-bold truncate block tracking-wide ${
                        isCurrentlySpeaking
                          ? 'text-indigo-200'
                          : item.keyword
                          ? 'text-amber-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      {item.word}
                    </span>
                  )}
                </div>

                {/* Bottom Timing Adjusters & Quick Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px] text-zinc-500">
                  <span>dur: {round(item.end - item.start, 2)}s</span>

                  {/* Hover Buttons: Edit, Add, Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                    <button
                      onClick={(e) => handleStartEdit(item, e)}
                      className="p-0.5 hover:text-indigo-400"
                      title="Edit Word"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => handleAddNewWord(index, e)}
                      className="p-0.5 hover:text-emerald-400"
                      title="Add Word After"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWord(index);
                      }}
                      className="p-0.5 hover:text-red-400"
                      title="Delete Word"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
