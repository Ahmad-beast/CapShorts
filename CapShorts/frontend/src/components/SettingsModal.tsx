import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  Zap,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
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
  const [pexelsKey, setPexelsKey] = useState(() => localStorage.getItem('opencaption_pexels_key') || '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isSettingsModalOpen) return null;

  const handleSaveGroqKey = () => {
    setGroqApiKey(tempGroqKey.trim());
    setSaveMessage('Groq AI API key saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSavePexelsKey = () => {
    localStorage.setItem('opencaption_pexels_key', pexelsKey.trim());
    setSaveMessage('Pexels B-Roll API key saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] bg-[#141416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">System & Engine Settings</h3>
              <p className="text-[11px] text-zinc-400">Configure AI cloud engines, hardware encoders, and API integrations</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#27272a] px-5 bg-[#121214] text-xs">
          <button
            onClick={() => setActiveSettingsTab('ai')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSettingsTab === 'ai'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI & Speech Engines</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('hardware')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSettingsTab === 'hardware'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware Acceleration</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('broll')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSettingsTab === 'broll'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Media Integrations</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {saveMessage && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 flex items-center space-x-2 text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {activeSettingsTab === 'ai' && (
            <div className="space-y-4">
              {/* Default Engine */}
              <div className="bg-[#141416] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
                <label className="text-xs font-bold text-zinc-200 block">Default Whisper Transcription Engine</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedModel('whisper-large-v3-turbo')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedModel === 'whisper-large-v3-turbo'
                        ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-500/30 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 text-cyan-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Ultra Fast (Cloud AI)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Transcribes 10-minute videos in ~2-3 seconds via Groq Whisper Large-v3.</p>
                  </button>

                  <button
                    onClick={() => setSelectedModel('base')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedModel === 'base'
                        ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-500/30 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 text-zinc-300 font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Standard (Offline On-Device)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Processes locally with CTranslate2. Zero internet required, fully private.</p>
                  </button>
                </div>
              </div>

              {/* Personal Groq Cloud API Key */}
              <div className="bg-[#141416] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Personal Groq Cloud API Key</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Optional: Paste your personal Groq API key for dedicated rate limits (7,200 videos/day free forever, no credit card required).
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={tempGroqKey}
                    onChange={(e) => setTempGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={handleSaveGroqKey}
                    className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'hardware' && (
            <div className="space-y-4">
              <div className="bg-[#141416] border border-[#27272a] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Hardware Engine Status</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">Execution Device:</span>
                    <span className="font-semibold text-zinc-200">{engineHealth?.device || 'CPU (CTranslate2)'}</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">Hardware Video Encoder:</span>
                    <span className="font-semibold text-cyan-400">
                      {engineHealth?.hardware_encoder ? engineHealth.hardware_encoder.toUpperCase() : 'Default CPU (libx264)'}
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">CUDA GPU Acceleration:</span>
                    <span className="font-semibold text-zinc-200">{engineHealth?.cuda_available ? 'Enabled (NVIDIA CUDA)' : 'Disabled (CPU Native)'}</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">Local Daemon Status:</span>
                    <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{engineHealth?.status || 'Online'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#141416] border border-[#27272a] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Clear Local Media Cache</h4>
                  <p className="text-[11px] text-zinc-400">Clean up temporary split chunks and downloaded b-roll clips.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('opencaption_cache');
                    setSaveMessage('Temporary cache cleared!');
                    setTimeout(() => setSaveMessage(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'broll' && (
            <div className="space-y-4">
              <div className="bg-[#141416] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pexels Stock Video API Key</span>
                  </label>
                  <a
                    href="https://www.pexels.com/api/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                  >
                    <span>Get Free Pexels Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Used to automatically search and insert contextual HD B-Roll overlays into your viral shorts.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={pexelsKey}
                    onChange={(e) => setPexelsKey(e.target.value)}
                    placeholder="Pexels API Key..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={handleSavePexelsKey}
                    className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#27272a] bg-[#141416] flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
