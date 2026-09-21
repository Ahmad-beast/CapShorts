import React, { useState } from 'react';
import {
  Film,
  Smartphone,
  Monitor,
  Square,
  Share2,
  RefreshCw,
  Cpu,
  Undo2,
  Redo2,
  Settings,
  Edit3,
  Check
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoStore } from '../../store/useVideoStore';
import { AspectRatio } from '../../types';

export const CapCutHeader: React.FC = () => {
  const {
    aspectRatio,
    setAspectRatio,
    engineHealth,
    isExporting,
    setIsExportModalOpen,
    setIsSettingsModalOpen,
    videoFile,
    setVideo,
    projectTitle,
    setProjectTitle
  } = useVideoStore(
    useShallow((state) => ({
      aspectRatio: state.aspectRatio,
      setAspectRatio: state.setAspectRatio,
      engineHealth: state.engineHealth,
      isExporting: state.isExporting,
      setIsExportModalOpen: state.setIsExportModalOpen,
      setIsSettingsModalOpen: state.setIsSettingsModalOpen,
      videoFile: state.videoFile,
      setVideo: state.setVideo,
      projectTitle: state.projectTitle,
      setProjectTitle: state.setProjectTitle,
    }))
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setProjectTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleReset = () => {
    if (confirm("Reset current project and load a new video?")) {
      setVideo(null, null, '');
    }
  };

  return (
    <header className="h-12 bg-[#121214] border-b border-[#27272a] px-3 flex items-center justify-between z-30 select-none text-zinc-100 flex-shrink-0">
      {/* Left: Brand + Project Title + History */}
      <div className="flex items-center space-x-3">
        {/* CapShorts Brand Logo Badge */}
        <div className="flex items-center space-x-2.5">
          <img
            src="/logo.png"
            alt="CapShorts Logo"
            className="w-7 h-7 rounded-lg object-contain shadow-md shadow-cyan-500/25 ring-1 ring-white/10"
          />
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-sm tracking-tight text-white">
              Cap<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]">Shorts</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              AI
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800" />

        {/* Project Title Editor */}
        <div className="flex items-center space-x-1.5">
          {isEditingTitle ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="bg-zinc-900 border border-cyan-500/80 rounded px-2 py-0.5 text-xs text-white font-medium focus:outline-none w-48"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 hover:bg-zinc-800 text-cyan-400 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTitle(projectTitle);
                setIsEditingTitle(true);
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-zinc-800/80 text-xs text-zinc-300 font-medium group transition-colors"
              title="Click to rename project"
            >
              <span className="truncate max-w-[180px]">{projectTitle}</span>
              <Edit3 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        <div className="h-4 w-[1px] bg-zinc-800" />

        {/* Undo / Redo controls */}
        <div className="flex items-center space-x-0.5">
          <button
            className="p-1.5 rounded hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Aspect Ratio Switcher */}
      <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-0.5">
        <button
          onClick={() => setAspectRatio('9:16')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '9:16'
              ? 'bg-[#27272a] text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="9:16 Vertical (Shorts, Reels, TikTok)"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>9:16 Shorts</span>
        </button>
        <button
          onClick={() => setAspectRatio('16:9')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '16:9'
              ? 'bg-[#27272a] text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="16:9 Landscape (YouTube)"
        >
          <Monitor className="w-3.5 h-3.5 text-zinc-300" />
          <span>16:9 Wide</span>
        </button>
        <button
          onClick={() => setAspectRatio('1:1')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            aspectRatio === '1:1'
              ? 'bg-[#27272a] text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="1:1 Square (Instagram Post)"
        >
          <Square className="w-3.5 h-3.5 text-zinc-300" />
          <span>1:1 Square</span>
        </button>
      </div>

      {/* Right: Engine Status & Signature Cyan Export Button */}
      <div className="flex items-center space-x-2.5">
        {/* Clean System Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 text-xs bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-full text-zinc-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-zinc-200">Ready</span>
          <span className="text-zinc-600">·</span>
          <span className="text-[11px] font-medium text-cyan-400">⚡ Hardware Accelerated</span>
        </div>

        {/* Replace/New Video */}
        {videoFile && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-medium text-xs border border-zinc-700/60 transition-all active:scale-95"
            title="Import different video"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>New Video</span>
          </button>
        )}

        {/* Vibrant Cyan Export Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={isExporting}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-zinc-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 tracking-wide"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="System & AI Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
