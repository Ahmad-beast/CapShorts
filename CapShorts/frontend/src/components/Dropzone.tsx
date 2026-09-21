import React, { useState, useRef } from 'react';
import { UploadCloud, Play, Sparkles, AlertCircle, CheckCircle2, Zap, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { apiUrl } from '../config';

const SAMPLE_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-talking-on-the-phone-in-the-city-43183-large.mp4";

export const Dropzone: React.FC = () => {
  const {
    setVideo,
    startTranscription,
    isTranscribing,
    transcribingStep,
    transcribeProgress,
    groqApiKey,
    setGroqApiKey,
    rangeMode,
    setRangeMode,
    engineHealth,
    setEngineHealth
  } = useVideoStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedModel, setSelectedModel] = useState("base");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGroqInput, setShowGroqInput] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isServerMasterActive = Boolean(engineHealth?.master_groq_active);
  const isUserKeyActive = Boolean(groqApiKey && groqApiKey.trim().length > 10);
  const isTurboActive = isServerMasterActive || isUserKeyActive;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage("Please upload a supported video format (.mp4, .mov, .mkv, .avi)");
      return;
    }

    setErrorMessage(null);
    const objectUrl = URL.createObjectURL(file);
    setVideo(file, objectUrl, file.name);

    await startTranscription(file, selectedModel, selectedLanguage);
  };

  const loadSample = () => {
    setErrorMessage(null);
    const sampleFile = new File(["sample"], "viral_short_demo.mp4", { type: "video/mp4" });
    setVideo(sampleFile, SAMPLE_VIDEO_URL, "Viral Short Demo (9:16)");
    useVideoStore.getState().loadSampleDemo();
  };

  const handleSaveAsMaster = async () => {
    if (!groqApiKey || groqApiKey.trim().length < 10) return;
    try {
      const res = await fetch(apiUrl('/api/settings/master-key'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: groqApiKey.trim() })
      });
      if (res.ok) {
        setSaveStatus("Saved as Server Master Key for everyone!");
        if (engineHealth) {
          setEngineHealth({ ...engineHealth, master_groq_active: true });
        }
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.warn("Save master key error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto select-none">
      {/* Turbo Mode Banner (CapCut Speed: 2-3s) */}
      <div className={`w-full mb-4 p-3.5 rounded-2xl border transition-all duration-200 ${
        isTurboActive
          ? 'bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/20'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isTurboActive ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">⚡ Ultra-Fast Cloud AI (~3s Instant)</span>
                {isServerMasterActive ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Master Active (All Users)</span>
                  </span>
                ) : isUserKeyActive ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                    Personal Key Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.2 rounded-full font-semibold">
                    Master Key Not Configured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {isServerMasterActive
                  ? "Transcribes 10-minute videos in 2 to 3 seconds using Master Groq Pool (7,200 videos/day free)."
                  : "Transcribes 10-minute videos in 2 to 3 seconds using free Groq Whisper Large-v3."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGroqInput(!showGroqInput)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded hover:bg-zinc-800/80 transition-colors"
          >
            {showGroqInput ? 'Hide Settings' : isTurboActive ? 'Key Settings' : 'Add Free Key'}
          </button>
        </div>

        {showGroqInput && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="Paste free Groq key (gsk_...)"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleSaveAsMaster}
                disabled={!groqApiKey || groqApiKey.trim().length < 10}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[11px] text-white font-semibold rounded-lg shadow transition-colors"
                title="Save as Server Master Key so all users get 3s speed without entering a key"
              >
                Save for Everyone
              </button>
            </div>

            {saveStatus && (
              <div className="text-[11px] text-emerald-400 font-semibold">{saveStatus}</div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Free forever • 7,200 videos per day • No credit card</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
              >
                <span>Get Free Key (15 seconds)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Drag & Drop Card */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.mkv,.avi"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isTranscribing ? (
          <div className="flex flex-col items-center space-y-4 py-6 w-full max-w-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center"></div>
              <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="w-full text-center">
              <p className="text-sm font-bold text-white tracking-wide">Processing Speech AI</p>
              <p className="text-xs text-indigo-400 mt-1">{transcribingStep || "Transcribing speech..."}</p>
              
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, transcribeProgress)}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">{transcribeProgress}% completed</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-zinc-100 mb-1">
              Drag & drop your video here, or <span className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4">browse</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              Supports MP4, MOV, MKV, AVI. Word-level subtitles & Opus Clip shorts generated automatically.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-400">
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/50 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Zero Subscription</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/50 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Opus Clip Highlights</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/50 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Ultra-Fast (~3s)</span>
              </span>
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Row: Range / Length & Language */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Scope / Length
          </label>
          <select
            value={rangeMode}
            onChange={(e) => setRangeMode(e.target.value as any)}
            disabled={isTranscribing}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="full">Full Video (Analyze entire video)</option>
            <option value="short_60s">⚡ First 60s Only (Instant Viral Short)</option>
            <option value="short_180s">⚡ First 3 Minutes (Fast 3-Clip Mode)</option>
          </select>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Subtitle Output Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isTranscribing}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="en">⚡ English Captions (Viral Shorts Standard)</option>
            <option value="roman">Roman Urdu / Hinglish (English Alphabet - e.g. "Kitab...")</option>
            <option value="ur">Urdu (اردو نستعلیق)</option>
            <option value="auto">Auto-Detect Spoken Language</option>
            <option value="hi">Hindi (हिंदी देवनागरी)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="ja">Japanese (日本語)</option>
          </select>
        </div>
      </div>

      {/* Quick Demo Video Loader */}
      <div className="mt-5 flex flex-col items-center">
        <span className="text-xs text-zinc-400 mb-2">Want to test without uploading a video?</span>
        <button
          onClick={loadSample}
          disabled={isTranscribing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
          <span>Load Viral Short Sample Video</span>
        </button>
      </div>
    </div>
  );
};
