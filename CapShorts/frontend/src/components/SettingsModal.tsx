import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  Zap,
  CheckCircle2,
  ExternalLink,
  Film
} from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    groqApiKey,
    setGroqApiKey,
    selectedModel,
    setSelectedModel,
    engineHealth
  } = useVideoStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'ai' | 'hardware' | 'broll'>('ai');
  const [tempGroqKey, setTempGroqKey] = useState(groqApiKey);
  const [pexelsKey, setPexelsKey] = useState(() => localStorage.getItem('capshorts_pexels_key') || localStorage.getItem('opencaption_pexels_key') || '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isSettingsModalOpen) return null;

  const handleSaveGroqKey = () => {
    setGroqApiKey(tempGroqKey.trim());
    setSaveMessage('Groq Cloud API key saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSavePexelsKey = () => {
    localStorage.setItem('capshorts_pexels_key', pexelsKey.trim());
    localStorage.setItem('opencaption_pexels_key', pexelsKey.trim());
    setSaveMessage('Pexels B-Roll API key saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fade">
      <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/[0.12] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* macOS Style Header with Traffic Lights */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2 mr-2">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all flex items-center justify-center group"
                title="Close"
              >
                <X className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">CapShorts Preferences</h3>
                <p className="text-[11px] text-zinc-400">Configure AI speech models, hardware engines, and integrations</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* macOS Segmented Tab Navigation */}
        <div className="px-6 pt-3 pb-1 bg-zinc-950/30 border-b border-white/[0.06]">
          <div className="grid grid-cols-3 gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setActiveSettingsTab('ai')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeSettingsTab === 'ai'
                  ? 'bg-zinc-800 text-white shadow-xs ring-1 ring-white/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Speech Models</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('hardware')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeSettingsTab === 'hardware'
                  ? 'bg-zinc-800 text-white shadow-xs ring-1 ring-white/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Hardware & Engine</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('broll')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeSettingsTab === 'broll'
                  ? 'bg-zinc-800 text-white shadow-xs ring-1 ring-white/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>B-Roll Media</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {saveMessage && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-3 flex items-center space-x-2 text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">{saveMessage}</span>
            </div>
          )}

          {activeSettingsTab === 'ai' && (
            <div className="space-y-4">
              {/* Default Engine */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
                <label className="text-xs font-bold text-white block">Default Whisper Transcription Engine</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedModel('whisper-large-v3-turbo')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedModel === 'whisper-large-v3-turbo'
                        ? 'bg-indigo-500/15 border-indigo-400 ring-1 ring-indigo-400/40 text-white shadow-xs'
                        : 'bg-black/40 border-white/[0.08] text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 text-indigo-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Ultra Fast (Cloud AI)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Transcribes 10-minute videos in ~2-3 seconds via Groq Whisper Large-v3.
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedModel('base')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedModel === 'base'
                        ? 'bg-indigo-500/15 border-indigo-400 ring-1 ring-indigo-400/40 text-white shadow-xs'
                        : 'bg-black/40 border-white/[0.08] text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 text-zinc-200 font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Standard (Offline On-Device)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Processes locally with CTranslate2. Zero internet required, 100% private.
                    </p>
                  </button>
                </div>
              </div>

              {/* Personal Groq Cloud API Key */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Personal Groq Cloud API Key</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Optional: Paste your personal Groq key for dedicated rate limits (7,200 videos/day free forever, no credit card required).
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={tempGroqKey}
                    onChange={(e) => setTempGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="flex-1 bg-black/50 border border-white/[0.08] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleSaveGroqKey}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'hardware' && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3.5 shadow-sm backdrop-blur-md">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>Hardware & Video Acceleration</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-zinc-500 block mb-0.5">Execution Device:</span>
                    <span className="font-semibold text-zinc-200">{engineHealth?.device || 'CPU (CTranslate2 Native)'}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-zinc-500 block mb-0.5">Hardware Video Encoder:</span>
                    <span className="font-semibold text-sky-400">
                      {engineHealth?.hardware_encoder ? engineHealth.hardware_encoder.toUpperCase() : 'Apple VideoToolbox / libx264'}
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-zinc-500 block mb-0.5">GPU Acceleration:</span>
                    <span className="font-semibold text-zinc-200">{engineHealth?.cuda_available ? 'NVIDIA CUDA Active' : 'Apple Silicon Metal / CPU'}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-zinc-500 block mb-0.5">Local Daemon Status:</span>
                    <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{engineHealth?.status || 'Online'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Clear Local Media Cache</h4>
                  <p className="text-[11px] text-zinc-400">Clean up temporary split chunks, audio waveforms, and downloaded B-Roll.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('capshorts_cache');
                    localStorage.removeItem('opencaption_cache');
                    setSaveMessage('Temporary cache cleared successfully!');
                    setTimeout(() => setSaveMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 font-semibold border border-white/[0.08] transition-all"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'broll' && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pexels Stock Video API Key</span>
                  </label>
                  <a
                    href="https://www.pexels.com/api/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>Get Free Pexels Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Used to automatically search and insert contextual HD B-Roll video overlays into your viral shorts.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={pexelsKey}
                    onChange={(e) => setPexelsKey(e.target.value)}
                    placeholder="Pexels API Key..."
                    className="flex-1 bg-black/50 border border-white/[0.08] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleSavePexelsKey}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-amber-500/20"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-zinc-950/50 flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs rounded-xl border border-white/[0.08] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
