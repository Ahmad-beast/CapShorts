import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Layers, Flame, X } from 'lucide-react';
import { useVideoStore } from '../store/useVideoStore';
import { SubtitlePreset, WordToken } from '../types';
import templatesData from '../data/templates.json';
import { formatTime } from '../utils/timeFormat';
import { formatCasing } from '../utils/styleHelper';

export const VideoPlayer: React.FC = () => {
  const {
    videoUrl,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    aspectRatio,
    transcript,
    activeTemplateId,
    customStyleOverrides,
    brollList,
    clips,
    selectedClipId,
    selectClip
  } = useVideoStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Active Clip (if user is viewing/previewing a specific AI Short)
  const activeClip = useMemo(() => {
    return clips.find(c => c.id === selectedClipId) || null;
  }, [clips, selectedClipId]);

  // Active Subtitle Preset
  const activePreset: SubtitlePreset = useMemo(() => {
    const rawList = templatesData as SubtitlePreset[];
    const found = rawList.find(t => t.id === activeTemplateId) || rawList[0];
    return { ...found, ...customStyleOverrides };
  }, [activeTemplateId, customStyleOverrides]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.log('Autoplay prevent:', e));
      setIsPlaying(true);
    }
  };

  // Sync external currentTime changes (from timeline or clip selection)
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      // If previewing a clip, loop smoothly at clip end
      if (activeClip && cur >= activeClip.end) {
        videoRef.current.currentTime = activeClip.start;
        setCurrentTime(activeClip.start);
      } else {
        setCurrentTime(cur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Group transcript words into blocks according to activePreset.maxWordsPerBlock
  const wordBlocks = useMemo(() => {
    if (!transcript || transcript.length === 0) return [];
    const blocks: { words: WordToken[]; start: number; end: number }[] = [];
    const size = Math.max(1, activePreset.maxWordsPerBlock || 2);

    for (let i = 0; i < transcript.length; i += size) {
      const slice = transcript.slice(i, i + size);
      const start = slice[0].start;
      const end = slice[slice.length - 1].end;
      blocks.push({
        words: slice,
        start,
        end: Math.max(end, start + 0.3)
      });
    }
    return blocks;
  }, [transcript, activePreset.maxWordsPerBlock]);

  // Find currently active word block at currentTime
  const currentBlock = useMemo(() => {
    return wordBlocks.find(b => currentTime >= b.start && currentTime <= b.end + 0.1);
  }, [wordBlocks, currentTime]);

  // Find active B-roll clip at currentTime
  const activeBroll = useMemo(() => {
    return brollList.find(b => b.enabled && currentTime >= b.start && currentTime <= b.end);
  }, [brollList, currentTime]);

  // Subtitle positioning CSS
  const positionClass = useMemo(() => {
    const pos = activePreset.position || 'bottom-center';
    if (pos.includes('top')) return 'top-[16%]';
    if (pos.includes('middle')) return 'top-1/2 -translate-y-1/2';
    return 'bottom-[18%]';
  }, [activePreset.position]);

  // Aspect ratio container size
  const containerSizeClass = useMemo(() => {
    if (aspectRatio === '9:16') {
      return 'w-[320px] sm:w-[360px] h-[570px] sm:h-[640px] aspect-[9/16]';
    } else if (aspectRatio === '16:9') {
      return 'w-[90%] max-w-[680px] aspect-[16/9]';
    } else {
      return 'w-[400px] sm:w-[480px] aspect-square';
    }
  }, [aspectRatio]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center h-full w-full select-none"
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Active Clip Top Banner */}
      {activeClip && (
        <div className="mb-2 bg-indigo-950/80 border border-indigo-500/40 px-3 py-1 rounded-full flex items-center space-x-2 text-xs shadow-lg animate-fade">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-indigo-200 truncate max-w-xs">{activeClip.title}</span>
          <span className="text-[10px] text-zinc-400">({activeClip.duration}s Short)</span>
          <button
            onClick={() => selectClip(null)}
            className="p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors ml-1"
            title="Exit Short preview"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Video Viewport Frame */}
      <div className={`relative ${containerSizeClass} bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center`}>
        {videoUrl ? (
          <>
            {/* Ambient Blurred Background for 9:16 Shorts preview */}
            {aspectRatio === '9:16' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 filter blur-xl scale-125">
                <video
                  src={videoUrl}
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              className={`w-full h-full ${aspectRatio === '9:16' ? 'object-contain relative z-10' : 'object-cover'}`}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 space-y-2 p-6 text-center">
            <Layers className="w-10 h-10 text-zinc-600" />
            <span className="text-xs">No video loaded</span>
          </div>
        )}

        {/* Live B-Roll Overlay (if active at current timestamp) */}
        {activeBroll && (
          <div className="absolute inset-0 z-10 animate-fade pointer-events-none">
            <video
              src={activeBroll.video_url || activeBroll.preview_url}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-amber-400 font-semibold uppercase tracking-wider border border-amber-500/30">
              B-Roll: {activeBroll.keyword}
            </div>
          </div>
        )}

        {/* Subtitle Overlay */}
        {currentBlock && (
          <div className={`absolute inset-x-0 ${positionClass} z-20 flex justify-center px-4 pointer-events-none`}>
            <div
              className={`flex flex-wrap items-center justify-center gap-1.5 transition-all duration-100 ${
                activePreset.bgBox ? 'px-3 py-1.5 rounded-lg' : ''
              }`}
              style={{
                backgroundColor: activePreset.bgBox ? activePreset.bgBoxColor : 'transparent',
              }}
            >
              {currentBlock.words.map((wordObj) => {
                const isWordSpeaking = currentTime >= wordObj.start && currentTime <= wordObj.end + 0.05;
                const isHighlighted = isWordSpeaking || wordObj.keyword;
                const textColor = isHighlighted ? activePreset.highlightColor : activePreset.primaryColor;
                const casedWord = formatCasing(wordObj.word, activePreset.textCasing);

                const outlineStyle = activePreset.outlineWidth > 0
                  ? `${activePreset.outlineWidth}px ${activePreset.outlineColor}`
                  : 'none';

                const shadowStyle = activePreset.shadowDepth > 0
                  ? `0px ${activePreset.shadowDepth}px ${activePreset.shadowDepth * 2}px ${activePreset.shadowColor}`
                  : 'none';

                let animationClass = '';
                if (isWordSpeaking) {
                  if (activePreset.animationTrigger === 'pop') animationClass = 'animate-pop';
                  else if (activePreset.animationTrigger === 'bounce') animationClass = 'animate-bounce';
                  else if (activePreset.animationTrigger === 'fade') animationClass = 'animate-fade';
                }

                return (
                  <span
                    key={wordObj.id}
                    className={`inline-block font-black tracking-tight leading-none transition-transform ${animationClass}`}
                    style={{
                      fontFamily: `${activePreset.fontFamily}, 'Montserrat', 'Noto Sans Devanagari', 'Segoe UI', sans-serif`,
                      fontSize: `${Math.round(activePreset.fontSize * (aspectRatio === '9:16' ? 0.72 : 0.85))}px`,
                      fontWeight: activePreset.fontWeight,
                      color: textColor,
                      WebkitTextStroke: outlineStyle !== 'none' ? outlineStyle : undefined,
                      paintOrder: 'stroke fill',
                      textShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
                    }}
                  >
                    {casedWord}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Modern Player Controls Bar */}
      {videoUrl && (
        <div className="w-full max-w-lg mt-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-2.5 flex flex-col space-y-2 shadow-xl">
          {/* Progress Slider Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-[11px] font-mono text-zinc-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <span className="text-[11px] font-mono text-zinc-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const t = Math.max(0, currentTime - 3);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors"
                title="Rewind 3s"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  const t = Math.min(duration, currentTime + 3);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors"
                title="Forward 3s"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume & Audio Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setIsMuted(v === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = v;
                    videoRef.current.muted = v === 0;
                  }
                }}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
