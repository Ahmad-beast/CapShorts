import React from 'react';
import { Sparkles, Cpu, Film, Share2, RefreshCw, Smartphone, Monitor, Square } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { AspectRatio } from '../types';

export const Header: React.FC = () => {
  const {
    aspectRatio,
    setAspectRatio,
    engineHealth,
    isExporting,
    setIsExportModalOpen,
    videoFile,
    setVideo
  } = useVideoStore();

  const handleReset = () => {
    if (confirm("Reset current project and load a new video?")) {
      setVideo(null, null, '');
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm tracking-tight text-white">OpenCaption</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Desktop v1.0
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-none">Free Local AI Video & Subtitle Suite</p>
        </div>
      </div>

      {/* Center: Aspect Ratio Switcher */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
        <button
          onClick={() => setAspectRatio('9:16')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '9:16'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="9:16 Vertical (Shorts, Reels, TikTok)"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>9:16 Shorts</span>
        </button>
        <button
          onClick={() => setAspectRatio('16:9')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '16:9'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="16:9 Widescreen (YouTube)"
        >
          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          <span>16:9 Wide</span>
        </button>
        <button
          onClick={() => setAspectRatio('1:1')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '1:1'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="1:1 Square (Instagram, LinkedIn)"
        >
          <Square className="w-3.5 h-3.5 text-pink-400" />
          <span>1:1 Square</span>
        </button>
      </div>

      {/* Right Controls & Engine Health */}
      <div className="flex items-center space-x-3">
        {/* Hardware / Engine Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-xs bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-md">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-300 font-medium">
              {engineHealth?.device || 'AI Engine: Local CPU'}
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center space-x-1 text-zinc-400">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>{engineHealth?.cuda_available ? 'CUDA GPU' : 'Whisper int8'}</span>
          </div>
        </div>

        {/* New Video Button */}
        {videoFile && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700/80 transition-all active:scale-95"
            title="Upload another video"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Video</span>
          </button>
        )}


        {/* Export Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={isExporting}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Export Video'}</span>
        </button>
      </div>
    </header>
  );
};
