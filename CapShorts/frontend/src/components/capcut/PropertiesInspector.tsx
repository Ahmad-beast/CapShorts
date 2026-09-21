import React, { useMemo } from 'react';
import {
  Type,
  Video,
  Volume2,
  Sparkles,
  Flame,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  RotateCcw,
  Palette,
  Layers,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoStore } from '../../store/useVideoStore';
import { SubtitlePreset } from '../../types';
import templatesData from '../../data/templates.json';

const FONTS = [
  'The Bold Font',
  'Montserrat',
  'Impact',
  'Komika Axis',
  'Poppins',
  'Inter',
  'Noto Nastaliq Urdu',
  'Arial'
];

export const PropertiesInspector: React.FC = () => {
  const {
    activeInspectorTab,
    setActiveInspectorTab,
    selectedTimelineItemId,
    selectedTimelineItemType,
    transcript,
    updateWord,
    deleteWord,
    toggleKeyword,
    activeTemplateId,
    customStyleOverrides,
    updateCustomStyle,
    resetCustomStyle,
    videoScale,
    setVideoScale,
    videoPosition,
    setVideoPosition,
    videoFitMode,
    setVideoFitMode,
    videoSpeed,
    setVideoSpeed,
    videoVolume,
    setVideoVolume,
    clips,
    selectedClipId,
    setIsExportModalOpen,
    showEmojis,
    setShowEmojis
  } = useVideoStore(
    useShallow((state) => ({
      activeInspectorTab: state.activeInspectorTab,
      setActiveInspectorTab: state.setActiveInspectorTab,
      selectedTimelineItemId: state.selectedTimelineItemId,
      selectedTimelineItemType: state.selectedTimelineItemType,
      transcript: state.transcript,
      updateWord: state.updateWord,
      deleteWord: state.deleteWord,
      toggleKeyword: state.toggleKeyword,
      activeTemplateId: state.activeTemplateId,
      customStyleOverrides: state.customStyleOverrides,
      updateCustomStyle: state.updateCustomStyle,
      resetCustomStyle: state.resetCustomStyle,
      videoScale: state.videoScale,
      setVideoScale: state.setVideoScale,
      videoPosition: state.videoPosition,
      setVideoPosition: state.setVideoPosition,
      videoFitMode: state.videoFitMode,
      setVideoFitMode: state.setVideoFitMode,
      videoSpeed: state.videoSpeed,
      setVideoSpeed: state.setVideoSpeed,
      videoVolume: state.videoVolume,
      setVideoVolume: state.setVideoVolume,
      clips: state.clips,
      selectedClipId: state.selectedClipId,
      setIsExportModalOpen: state.setIsExportModalOpen,
      showEmojis: state.showEmojis,
      setShowEmojis: state.setShowEmojis,
    }))
  );

  // Active Preset with live overrides
  const activePreset: SubtitlePreset = useMemo(() => {
    const rawList = templatesData as SubtitlePreset[];
    const found = rawList.find(t => t.id === activeTemplateId) || rawList[0];
    return { ...found, ...customStyleOverrides };
  }, [activeTemplateId, customStyleOverrides]);

  // Selected Word (if a subtitle word is currently selected)
  const selectedWordIndex = useMemo(() => {
    if (selectedTimelineItemType !== 'subtitle' || !selectedTimelineItemId) return -1;
    return transcript.findIndex(w => w.id === selectedTimelineItemId);
  }, [transcript, selectedTimelineItemId, selectedTimelineItemType]);

  const selectedWord = selectedWordIndex !== -1 ? transcript[selectedWordIndex] : null;

  // Selected Clip (if viral clip is active)
  const activeClip = useMemo(() => {
    return clips.find(c => c.id === selectedClipId) || null;
  }, [clips, selectedClipId]);

  return (
    <div className="w-[320px] lg:w-[350px] h-full flex flex-col bg-[#18181b] border-l border-[#27272a] select-none flex-shrink-0 text-zinc-200">
      {/* Top Inspector Tab Strip */}
      <div className="h-12 border-b border-[#27272a] px-2 flex items-center justify-between bg-[#121214]">
        <div className="grid grid-cols-4 gap-1 w-full">
          <button
            onClick={() => setActiveInspectorTab('text')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeInspectorTab === 'text'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('video')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeInspectorTab === 'video'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('audio')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeInspectorTab === 'audio'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('viral')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeInspectorTab === 'viral'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hook</span>
          </button>
        </div>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ======================= TEXT INSPECTOR ======================= */}
        {activeInspectorTab === 'text' && (
          <div className="space-y-4 animate-fade">
            {/* Selected Word Context Bar */}
            {selectedWord ? (
              <div className="bg-[#202024] border border-cyan-500/40 rounded-xl p-3 space-y-2.5 shadow-md shadow-cyan-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 flex items-center space-x-1">
                    <Edit2 className="w-3 h-3" />
                    <span>Selected Caption Word</span>
                  </span>
                  <button
                    onClick={() => toggleKeyword(selectedWordIndex)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-colors ${
                      selectedWord.keyword
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{selectedWord.keyword ? 'Viral Keyword: ON' : 'Make Keyword'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={selectedWord.word}
                    onChange={(e) => updateWord(selectedWordIndex, { word: e.target.value })}
                    className="w-full bg-[#141416] border border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-[#27272a]">
                  <span className="font-mono">{selectedWord.start.toFixed(2)}s - {selectedWord.end.toFixed(2)}s</span>
                  <button
                    onClick={() => deleteWord(selectedWordIndex)}
                    className="text-red-400 hover:text-red-300 flex items-center space-x-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Word</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#202024] border border-[#27272a] rounded-xl p-2.5 text-center text-xs text-zinc-400">
                <span>Select any word block in the timeline to edit its text & timing.</span>
              </div>
            )}

            {/* Typography Section */}
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Typography</span>
                </h4>
                <button
                  onClick={resetCustomStyle}
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                  title="Reset to Template Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Font Family */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400">Font Family</label>
                <select
                  value={activePreset.fontFamily}
                  onChange={(e) => updateCustomStyle({ fontFamily: e.target.value })}
                  className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {FONTS.map(f => (
                    <option key={f} value={f} className="bg-zinc-900">{f}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Font Size</span>
                  <span className="font-mono text-cyan-400">{activePreset.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="2"
                  value={activePreset.fontSize}
                  onChange={(e) => updateCustomStyle({ fontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Text Casing */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400">Text Casing</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['UPPERCASE', 'lowercase', 'Title Case', 'Default'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => updateCustomStyle({ textCasing: c })}
                      className={`py-1 rounded text-[10px] font-semibold capitalize ${
                        activePreset.textCasing === c
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#141416] text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {c === 'UPPERCASE' ? 'UPPER' : c === 'lowercase' ? 'lower' : c === 'Title Case' ? 'Title' : 'Default'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors & Stroke */}
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Colors & Stroke</span>
              </h4>

              {/* Primary & Highlight Color */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400">Primary Fill</label>
                  <div className="flex items-center space-x-1.5 bg-[#141416] border border-[#27272a] rounded-lg p-1">
                    <input
                      type="color"
                      value={activePreset.primaryColor}
                      onChange={(e) => updateCustomStyle({ primaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-zinc-300">{activePreset.primaryColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400">Active Highlight</label>
                  <div className="flex items-center space-x-1.5 bg-[#141416] border border-[#27272a] rounded-lg p-1">
                    <input
                      type="color"
                      value={activePreset.highlightColor}
                      onChange={(e) => updateCustomStyle({ highlightColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-zinc-300">{activePreset.highlightColor}</span>
                  </div>
                </div>
              </div>

              {/* Stroke Outline */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Outline Width</span>
                  <span className="font-mono text-cyan-400">{activePreset.outlineWidth}px</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={activePreset.outlineWidth}
                    onChange={(e) => updateCustomStyle({ outlineWidth: parseFloat(e.target.value) })}
                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <input
                    type="color"
                    value={activePreset.outlineColor}
                    onChange={(e) => updateCustomStyle({ outlineColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Shadow Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Shadow Depth</span>
                  <span className="font-mono text-cyan-400">{activePreset.shadowDepth}px</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={activePreset.shadowDepth}
                    onChange={(e) => updateCustomStyle({ shadowDepth: parseInt(e.target.value) })}
                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <input
                    type="color"
                    value={activePreset.shadowColor}
                    onChange={(e) => updateCustomStyle({ shadowColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Animation & Pacing */}
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Animation & Layout</span>
              </h4>

              {/* Animation Trigger */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400">Active Word Animation</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['pop', 'bounce', 'fade', 'none'] as const).map(anim => (
                    <button
                      key={anim}
                      onClick={() => updateCustomStyle({ animationTrigger: anim })}
                      className={`py-1 rounded text-[10px] font-semibold capitalize ${
                        activePreset.animationTrigger === anim
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#141416] text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submagic Style AI Animated Emojis */}
              <div className="flex items-center justify-between pt-1 border-t border-[#27272a]/80">
                <div>
                  <span className="text-[11px] font-bold text-zinc-200 flex items-center space-x-1">
                    <span>✨ AI Animated Emojis</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono">Submagic</span>
                  </span>
                  <p className="text-[9px] text-zinc-400">Pop 3D emojis on viral keywords</p>
                </div>
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    showEmojis ? 'bg-cyan-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showEmojis ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Words Per Block */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Words Per Screen</span>
                  <span className="font-mono text-cyan-400">{activePreset.maxWordsPerBlock} words</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map(w => (
                    <button
                      key={w}
                      onClick={() => updateCustomStyle({ maxWordsPerBlock: w })}
                      className={`py-1 rounded text-[10px] font-semibold ${
                        activePreset.maxWordsPerBlock === w
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#141416] text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {w === 1 ? '1 (Karaoke)' : `${w} words`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400">Screen Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['top', 'middle', 'bottom'] as const).map(pos => (
                    <button
                      key={pos}
                      onClick={() => updateCustomStyle({ position: `bottom-center` as any })}
                      className={`py-1 rounded text-[10px] font-semibold capitalize ${
                        activePreset.position.includes(pos)
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#141416] text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= VIDEO INSPECTOR ======================= */}
        {activeInspectorTab === 'video' && (
          <div className="space-y-4 animate-fade">
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Video Transform & Framing</span>
              </h4>

              {/* Quick Framing Presets for Podcasts & Shorts */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 font-medium">Quick Framing Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setVideoFitMode('contain');
                      setVideoScale(1.0);
                      setVideoPosition({ x: 0, y: 0 });
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      videoFitMode === 'contain' && videoScale <= 1.05
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-[#141416] border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    📺 Fit Full Video
                  </button>

                  <button
                    onClick={() => {
                      setVideoFitMode('cover');
                      setVideoScale(1.78);
                      setVideoPosition({ x: 0, y: 0 });
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      videoFitMode === 'cover' && videoScale > 1.2 && videoPosition.x === 0
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-[#141416] border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    📱 Fill 9:16 Center
                  </button>

                  <button
                    onClick={() => {
                      setVideoFitMode('cover');
                      setVideoScale(1.78);
                      setVideoPosition({ x: 120, y: 0 });
                    }}
                    className="px-2 py-1.5 rounded-lg border bg-[#141416] border-zinc-800 text-xs font-medium text-zinc-300 hover:border-cyan-500/50 hover:text-white transition-all"
                  >
                    👤 Left Speaker
                  </button>

                  <button
                    onClick={() => {
                      setVideoFitMode('cover');
                      setVideoScale(1.78);
                      setVideoPosition({ x: -120, y: 0 });
                    }}
                    className="px-2 py-1.5 rounded-lg border bg-[#141416] border-zinc-800 text-xs font-medium text-zinc-300 hover:border-cyan-500/50 hover:text-white transition-all"
                  >
                    👤 Right Speaker
                  </button>
                </div>
              </div>

              {/* Scale / Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Scale / Zoom</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round((videoScale > 5 ? videoScale / 100 : videoScale) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={videoScale > 5 ? videoScale / 100 : videoScale}
                  onChange={(e) => setVideoScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Position X */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Pan X (Horizontal)</span>
                  <span className="font-mono text-cyan-400">{videoPosition.x}px</span>
                </div>
                <input
                  type="range"
                  min="-300"
                  max="300"
                  step="5"
                  value={videoPosition.x}
                  onChange={(e) => setVideoPosition({ ...videoPosition, x: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Position Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Pan Y (Vertical)</span>
                  <span className="font-mono text-cyan-400">{videoPosition.y}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={videoPosition.y}
                  onChange={(e) => setVideoPosition({ ...videoPosition, y: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  setVideoFitMode('contain');
                  setVideoScale(1.0);
                  setVideoPosition({ x: 0, y: 0 });
                }}
                className="w-full py-1.5 rounded-lg bg-[#141416] hover:bg-zinc-800 border border-[#27272a] text-xs text-zinc-300 font-semibold transition-colors"
              >
                Reset Transform to Fit
              </button>
            </div>
          </div>
        )}

        {/* ======================= AUDIO INSPECTOR ======================= */}
        {activeInspectorTab === 'audio' && (
          <div className="space-y-4 animate-fade">
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audio Levels</span>
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Master Volume</span>
                  <span className="font-mono text-cyan-400">{Math.round(videoVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={videoVolume}
                  onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================= AI HOOK INSPECTOR ======================= */}
        {activeInspectorTab === 'viral' && (
          <div className="space-y-4 animate-fade">
            {activeClip ? (
              <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Virality Analysis</span>
                  </h4>
                  <div className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {activeClip.virality_score}/100
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400">Hook Sentence</label>
                  <p className="text-xs text-zinc-200 italic bg-[#141416] p-2.5 rounded-lg border border-[#27272a]">
                    "{activeClip.hook}"
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400">Detected Keywords</label>
                  <div className="flex flex-wrap gap-1">
                    {activeClip.keywords?.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Export This Viral Short
                </button>
              </div>
            ) : (
              <div className="bg-[#202024] border border-[#27272a] rounded-xl p-4 text-center space-y-2">
                <Flame className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Select any AI Short in the Left Library to inspect virality hook metrics.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
