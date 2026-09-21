import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Subtitles,
  Type,
  Music,
  Film,
  Scissors,
  Upload,
  Sparkles,
  Play,
  RotateCcw,
  Languages,
  Check,
  Search,
  Sliders,
  Volume2,
  VolumeX,
  Flame,
  Plus,
  Trash2,
  Key,
  Clock,
  Download
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoStore } from '../../store/useVideoStore';
import { apiUrl } from '../../config';
import { SubtitlePreset, VideoClip, BrollClip } from '../../types';
import templatesData from '../../data/templates.json';
import { formatTime, formatTimeWithMs } from '../../utils/timeFormat';
import { formatCasing } from '../../utils/styleHelper';

type LibraryTab = 'media' | 'captions' | 'text' | 'audio' | 'broll' | 'shorts';

const TEMPLATE_CATEGORIES = ["All", "Viral Shorts", "Neon & Gaming", "Documentary & Clean", "Karaoke Sweep", "Urdu"];

export const MediaLibraryPanel: React.FC = () => {
  const {
    videoFile,
    videoUrl,
    videoName,
    duration,
    setCurrentTime,
    setVideo,
    selectedLanguage,
    setSelectedLanguage,
    selectedModel,
    setSelectedModel,
    transcript,
    activeTemplateId,
    setActiveTemplate,
    customStyleOverrides,
    updateCustomStyle,
    groqApiKey,
    setGroqApiKey,
    isTranscribing,
    transcribeProgress,
    transcribingStep,
    startTranscription,
    cancelTranscription,
    convertTranscriptScript,
    clips,
    selectedClipId,
    selectClip,
    setClips,
    brollList,
    toggleBroll,
    addBroll,
    removeBroll,
    videoVolume,
    setVideoVolume,
    videoSpeed,
    setVideoSpeed,
    setIsExportModalOpen
  } = useVideoStore(
    useShallow((state) => ({
      videoFile: state.videoFile,
      videoUrl: state.videoUrl,
      videoName: state.videoName,
      duration: state.duration,
      setCurrentTime: state.setCurrentTime,
      setVideo: state.setVideo,
      selectedLanguage: state.selectedLanguage,
      setSelectedLanguage: state.setSelectedLanguage,
      selectedModel: state.selectedModel,
      setSelectedModel: state.setSelectedModel,
      transcript: state.transcript,
      activeTemplateId: state.activeTemplateId,
      setActiveTemplate: state.setActiveTemplate,
      customStyleOverrides: state.customStyleOverrides,
      updateCustomStyle: state.updateCustomStyle,
      groqApiKey: state.groqApiKey,
      setGroqApiKey: state.setGroqApiKey,
      isTranscribing: state.isTranscribing,
      transcribeProgress: state.transcribeProgress,
      transcribingStep: state.transcribingStep,
      startTranscription: state.startTranscription,
      cancelTranscription: state.cancelTranscription,
      convertTranscriptScript: state.convertTranscriptScript,
      clips: state.clips,
      selectedClipId: state.selectedClipId,
      selectClip: state.selectClip,
      setClips: state.setClips,
      brollList: state.brollList,
      toggleBroll: state.toggleBroll,
      addBroll: state.addBroll,
      removeBroll: state.removeBroll,
      videoVolume: state.videoVolume,
      setVideoVolume: state.setVideoVolume,
      videoSpeed: state.videoSpeed,
      setVideoSpeed: state.setVideoSpeed,
      setIsExportModalOpen: state.setIsExportModalOpen,
    }))
  );

  const [activeTab, setActiveTab] = useState<LibraryTab>('captions');

  // Templates State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // B-Roll State
  const [brollKeyword, setBrollKeyword] = useState('');
  const [brollResults, setBrollResults] = useState<any[]>([]);
  const [isSearchingBroll, setIsSearchingBroll] = useState(false);
  const [pexelsKey, setPexelsKey] = useState(() => localStorage.getItem('opencaption_pexels_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const presets = templatesData as SubtitlePreset[];

  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.fontFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [presets, selectedCategory, searchQuery]);

  const activePreset = useMemo(() => {
    const found = presets.find(p => p.id === activeTemplateId) || presets[0];
    return { ...found, ...customStyleOverrides };
  }, [presets, activeTemplateId, customStyleOverrides]);

  const handleVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setVideo(file, url, file.name);
    setActiveTab('captions');
    await startTranscription(file, selectedModel, selectedLanguage);
  };

  const handleStartTranscribe = () => {
    if (!videoFile) return;
    startTranscription(videoFile, selectedModel, selectedLanguage);
  };

  const handleBrollSearch = async (kw: string) => {
    if (!kw.trim()) return;
    setBrollKeyword(kw);
    setIsSearchingBroll(true);
    try {
      const queryParams = new URLSearchParams({ keyword: kw, api_key: pexelsKey });
      const res = await fetch(apiUrl(`/api/broll/search?${queryParams}`));
      if (res.ok) {
        const data = await res.json();
        setBrollResults(data.results || []);
      }
    } catch (e) {
      console.warn("B-roll search error:", e);
    } finally {
      setIsSearchingBroll(false);
    }
  };

  const handleInsertBroll = (clip: any) => {
    const matchedWord = transcript.find(w => w.word.toLowerCase().includes(clip.keyword));
    const start = matchedWord ? matchedWord.start : useVideoStore.getState().currentTime;
    const end = start + Math.min(clip.duration || 3, 3.0);
    addBroll({
      id: `broll-${Date.now()}`,
      keyword: clip.keyword,
      title: clip.title || `${clip.keyword.toUpperCase()} Clip`,
      preview_url: clip.preview_url,
      video_url: clip.video_url,
      duration: clip.duration || 3,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      enabled: true
    });
  };

  return (
    <div className="w-[380px] lg:w-[420px] h-full flex flex-col bg-[#18181b] border-r border-[#27272a] select-none flex-shrink-0">
      {/* Top CapCut Icon Tabs Strip */}
      <div className="h-12 border-b border-[#27272a] px-2 flex items-center justify-between bg-[#121214]">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar w-full">
          <button
            onClick={() => setActiveTab('captions')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'captions'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>Auto Captions</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono">AI</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'text'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'shorts'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>AI Shorts</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              {clips.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>

          <button
            onClick={() => setActiveTab('broll')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'broll'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>B-Roll</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'audio'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 text-zinc-200 space-y-4">
        {/* ======================= AUTO CAPTIONS TAB ======================= */}
        {activeTab === 'captions' && (
          <div className="space-y-4 animate-fade">
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">Auto Captions & Subtitles</h4>
                    <p className="text-[10px] text-zinc-400">Generate viral, word-accurate animated captions in seconds.</p>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Language:</span>
                  <span className="text-[10px] text-cyan-400">Auto Word Timestamps</span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="auto">Auto Detect</option>
                  <option value="urdu">Urdu (Roman Urdu)</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ur_script">Urdu Script (اردو خط)</option>
                </select>
              </div>

              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300">Speech Engine:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="whisper-large-v3-turbo">⚡ Ultra Fast (Cloud AI)</option>
                  <option value="base">💻 Standard (Offline On-Device)</option>
                  <option value="small">💻 High Accuracy (Offline On-Device)</option>
                </select>
              </div>

              {/* Transcribe Action Button */}
              <button
                onClick={handleStartTranscribe}
                disabled={!videoFile || isTranscribing}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-zinc-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Subtitles className="w-4 h-4 stroke-[2.5]" />
                <span>{isTranscribing ? 'Generating Auto Captions...' : 'Generate Auto Captions'}</span>
              </button>

              {/* Transcribe Progress Bar */}
              {isTranscribing && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span className="truncate max-w-[200px]">{transcribingStep || 'Processing audio...'}</span>
                    <span className="font-mono text-cyan-400">{transcribeProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-teal-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, transcribeProgress)}%` }}
                    />
                  </div>
                  <button
                    onClick={cancelTranscription}
                    className="text-[10px] text-red-400 hover:underline pt-0.5 block mx-auto"
                  >
                    Cancel transcription
                  </button>
                </div>
              )}
            </div>

            {/* Quick Transliteration / Script Converter */}
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-200">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick Script Converter</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Instantly convert Devanagari/Hindi transcript text into clean Roman Urdu or Urdu script:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => convertTranscriptScript('roman_urdu')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141416] hover:bg-zinc-800 border border-[#27272a] text-xs font-semibold text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>To Roman Urdu</span>
                </button>
                <button
                  onClick={() => convertTranscriptScript('urdu')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141416] hover:bg-zinc-800 border border-[#27272a] text-xs font-semibold text-zinc-300 hover:border-zinc-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>To Urdu Script</span>
                </button>
              </div>
            </div>

            {/* Current Transcript Stats */}
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total Word Tokens:</span>
              <span className="font-mono font-bold text-cyan-400">{transcript.length} words</span>
            </div>
          </div>
        )}

        {/* ======================= TEXT TEMPLATES TAB ======================= */}
        {activeTab === 'text' && (
          <div className="space-y-3 animate-fade">
            {/* Search and Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 100+ styles (e.g. MrBeast, Hormozi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-black shadow-sm font-bold'
                        : 'bg-[#141416] text-zinc-400 hover:text-zinc-200 border border-[#27272a]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isSelected = preset.id === activeTemplateId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setActiveTemplate(preset.id)}
                    className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#202024] border-[#27272a] hover:border-zinc-600 hover:bg-[#25252a]'
                    }`}
                  >
                    {/* Top title & active check */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Live styled sample text preview */}
                    <div className="my-auto flex items-center justify-center py-1">
                      <span
                        className="font-black text-xs tracking-tight"
                        style={{
                          fontFamily: `${preset.fontFamily}, 'Montserrat', sans-serif`,
                          color: preset.highlightColor || preset.primaryColor,
                          WebkitTextStroke: preset.outlineWidth > 0 ? `1.5px ${preset.outlineColor}` : undefined,
                          paintOrder: 'stroke fill',
                          textShadow: preset.shadowDepth > 0 ? `0px 2px 4px ${preset.shadowColor}` : undefined,
                        }}
                      >
                        {formatCasing("SAMPLE TEXT", preset.textCasing)}
                      </span>
                    </div>

                    {/* Bottom tags */}
                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                      <span className="truncate max-w-[80px]">{preset.category}</span>
                      <span className="capitalize text-cyan-400/80 font-mono">{preset.animationTrigger}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= MEDIA TAB ======================= */}
        {activeTab === 'media' && (
          <div className="space-y-4 animate-fade">
            {videoFile || videoUrl ? (
              <div className="bg-[#202024] border border-[#27272a] rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate">{videoName || videoFile?.name || 'Imported Video'}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Duration: {formatTime(duration)} ({duration.toFixed(1)}s)
                    </p>
                    {videoFile && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272a]">
                  <label className="w-full py-2 px-3 rounded-lg bg-[#141416] hover:bg-zinc-800 border border-[#27272a] text-xs font-semibold text-zinc-200 cursor-pointer flex items-center justify-center space-x-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Replace Video File</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleVideoUpload(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm|mkv|avi)$/i))) {
                    handleVideoUpload(file);
                  }
                }}
                className="border-2 border-dashed border-[#27272a] hover:border-cyan-500/60 rounded-2xl p-6 text-center space-y-3 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Import Video</h4>
                  <p className="text-xs text-zinc-400 mt-1">Drag & drop video to auto-generate captions & viral shorts</p>
                </div>
                <label className="inline-block px-4 py-2 rounded-lg bg-cyan-400 text-black font-bold text-xs cursor-pointer hover:bg-cyan-300 transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleVideoUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* ======================= AI SHORTS TAB ======================= */}
        {activeTab === 'shorts' && (
          <div className="space-y-3 animate-fade">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Viral Shorts ({clips.length})</span>
                </h4>
                <p className="text-[10px] text-zinc-400">Auto-detected virality highlights</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(apiUrl('/api/clips/generate'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ words: transcript, duration: duration || 60 })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.clips) setClips(data.clips);
                    }
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="text-[10px] px-2 py-1 rounded bg-[#141416] border border-[#27272a] text-cyan-400 hover:bg-zinc-800"
              >
                Re-detect
              </button>
            </div>

            <div className="space-y-2">
              {clips.map(clip => {
                const isSelected = selectedClipId === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={() => {
                      selectClip(clip.id);
                      setCurrentTime(clip.start);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-[#202024] border-[#27272a] hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{clip.title}</span>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{clip.virality_score}%</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-300 line-clamp-2 italic mb-2">"{clip.hook}"</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-mono">{formatTime(clip.start)} - {formatTime(clip.end)} ({clip.duration}s)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectClip(clip.id);
                          setIsExportModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 border border-cyan-500/30 font-semibold"
                      >
                        Export Short
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= B-ROLL TAB ======================= */}
        {activeTab === 'broll' && (
          <div className="space-y-3 animate-fade">
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search B-Roll stock (e.g. money, city, coding)..."
                    value={brollKeyword}
                    onChange={(e) => setBrollKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBrollSearch(brollKeyword);
                    }}
                    className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={() => handleBrollSearch(brollKeyword)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {brollResults.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {brollResults.map((r, i) => (
                  <div key={i} className="bg-[#202024] border border-[#27272a] rounded-lg p-1.5 space-y-1">
                    <img src={r.preview_url} alt="" className="w-full h-20 object-cover rounded" />
                    <button
                      onClick={() => handleInsertBroll(r)}
                      className="w-full py-1 text-[10px] font-bold bg-cyan-400/20 text-cyan-300 rounded hover:bg-cyan-400/30"
                    >
                      + Add to Timeline
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Active B-Roll list */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-zinc-300">Active B-Roll Overlays ({brollList.length})</span>
              {brollList.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-[#202024] border border-[#27272a] text-xs">
                  <span className="text-zinc-200 font-medium truncate max-w-[140px]">{b.keyword}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{b.start}s - {b.end}s</span>
                  <button
                    onClick={() => removeBroll(b.id)}
                    className="p-1 hover:text-red-400 text-zinc-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= AUDIO TAB ======================= */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-fade">
            <div className="bg-[#202024] border border-[#27272a] rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Audio Track Controls</span>
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Track Volume:</span>
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

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Playback Speed:</span>
                  <span className="font-mono text-cyan-400">{videoSpeed}x</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[0.5, 0.75, 1.0, 1.25, 1.5].map(s => (
                    <button
                      key={s}
                      onClick={() => setVideoSpeed(s)}
                      className={`py-1 rounded text-xs font-mono font-semibold ${
                        videoSpeed === s
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#141416] text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
