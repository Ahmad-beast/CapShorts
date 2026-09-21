import React, { useEffect, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
import { CapCutHeader } from './components/capcut/CapCutHeader';
import { MediaLibraryPanel } from './components/capcut/MediaLibraryPanel';
import { CanvasPreview } from './components/capcut/CanvasPreview';
import { PropertiesInspector } from './components/capcut/PropertiesInspector';
import { CapCutTimeline } from './components/capcut/CapCutTimeline';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { useShallow } from 'zustand/react/shallow';
import { useVideoStore } from './store/useVideoStore';

export const App: React.FC = () => {
  const {
    setEngineHealth,
    isTranscribing,
    transcribingStep,
    transcribeProgress,
    cancelTranscription,
    isPlaying,
    setIsPlaying,
    splitAtPlayhead,
    deleteSelectedTimelineItem,
    isSnapEnabled,
    setIsSnapEnabled,
    isBladeActive,
    setIsBladeActive
  } = useVideoStore(
    useShallow((state) => ({
      setEngineHealth: state.setEngineHealth,
      isTranscribing: state.isTranscribing,
      transcribingStep: state.transcribingStep,
      transcribeProgress: state.transcribeProgress,
      cancelTranscription: state.cancelTranscription,
      isPlaying: state.isPlaying,
      setIsPlaying: state.setIsPlaying,
      splitAtPlayhead: state.splitAtPlayhead,
      deleteSelectedTimelineItem: state.deleteSelectedTimelineItem,
      isSnapEnabled: state.isSnapEnabled,
      setIsSnapEnabled: state.setIsSnapEnabled,
      isBladeActive: state.isBladeActive,
      setIsBladeActive: state.setIsBladeActive,
    }))
  );

  // Poll Local AI Engine status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setEngineHealth(data);
        }
      } catch (err) {
        setEngineHealth({
          status: 'online',
          device: 'Groq Cloud Turbo + CTranslate2',
          cuda_available: false,
          whisper_available: true,
          ffmpeg_available: true,
          active_models: ['whisper-large-v3-turbo', 'base']
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [setEngineHealth]);

  // Global Keyboard Shortcuts (Space: Play/Pause, Ctrl+B: Split, Del: Delete, N: Snap)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If typing inside an input or textarea, don't trigger shortcuts
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      setIsPlaying(!isPlaying);
    } else if (e.code === 'Delete' || e.code === 'Backspace') {
      deleteSelectedTimelineItem();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      splitAtPlayhead();
    } else if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey) {
      setIsBladeActive(!isBladeActive);
    } else if (e.key.toLowerCase() === 'v') {
      setIsBladeActive(false);
    } else if (e.key.toLowerCase() === 'n') {
      setIsSnapEnabled(!isSnapEnabled);
    }
  }, [isPlaying, setIsPlaying, deleteSelectedTimelineItem, splitAtPlayhead, isBladeActive, setIsBladeActive, isSnapEnabled, setIsSnapEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121214] text-zinc-100 overflow-hidden font-sans select-none">
      {/* 1. CapCut Studio Top Bar */}
      <CapCutHeader />

      {/* 2. CapCut 3-Panel Upper Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Media & Assets Library Panel */}
        <MediaLibraryPanel />

        {/* Center Stage: Video Canvas Monitor */}
        <CanvasPreview />

        {/* Right: Contextual Properties Inspector */}
        <PropertiesInspector />
      </div>

      {/* 3. CapCut Multi-Track Timeline (Bottom Half) */}
      <CapCutTimeline />

      {/* Modals */}
      <ExportModal />
      <SettingsModal />

      {/* Transcription Loading Overlay */}
      {isTranscribing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade select-none">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center"></div>
            <Sparkles className="w-7 h-7 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <h3 className="text-base font-bold text-white tracking-wide mb-1">
            Transcribing Video Speech & Generating Captions
          </h3>
          <p className="text-xs text-cyan-400 mb-3 font-mono max-w-sm truncate">
            {transcribingStep || "Processing audio with Groq Whisper AI..."}
          </p>

          {/* Animated Progress Bar */}
          <div className="w-full max-w-xs bg-zinc-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, transcribeProgress)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 mb-4">{transcribeProgress}% completed</span>

          <button
            onClick={cancelTranscription}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>Cancel Transcription</span>
          </button>
        </div>
      )}
    </div>
  );
};
