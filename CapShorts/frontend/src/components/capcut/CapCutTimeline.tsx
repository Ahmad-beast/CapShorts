import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  MousePointer,
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  Magnet,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Type,
  Video,
  Music,
  Plus,
  Edit2,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoStore } from '../../store/useVideoStore';
import { WordToken, VideoSegment } from '../../types';
import { formatTimecode } from '../../utils/timeFormat';

/* ==========================================================================
   1. ISOLATED GPU-ACCELERATED TIMELINE PLAYHEAD (ZERO FORCED LAYOUT)
   ========================================================================== */
interface TimelinePlayheadProps {
  timelineZoom: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  containerWidth: number;
  onPlayheadMouseDown: (e: React.MouseEvent) => void;
}

const TimelinePlayhead: React.FC<TimelinePlayheadProps> = React.memo(({
  timelineZoom,
  scrollContainerRef,
  containerWidth,
  onPlayheadMouseDown,
}) => {
  const currentTime = useVideoStore((state) => state.currentTime);
  const isPlaying = useVideoStore((state) => state.isPlaying);
  const playheadX = currentTime * timelineZoom;
  const lastScrollTime = useRef(0);

  // Throttled auto-scroll to keep playhead in view during playback without DOM thrashing
  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      const now = Date.now();
      if (now - lastScrollTime.current > 250) {
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;

        if (playheadX > scrollLeft + containerWidth - 100) {
          container.scrollLeft = playheadX - 120;
          lastScrollTime.current = now;
        } else if (playheadX < scrollLeft) {
          container.scrollLeft = Math.max(0, playheadX - 60);
          lastScrollTime.current = now;
        }
      }
    }
  }, [playheadX, isPlaying, containerWidth, scrollContainerRef]);

  return (
    <div
      style={{
        transform: `translate3d(${playheadX}px, 0, 0)`,
        willChange: 'transform',
      }}
      className="absolute top-0 bottom-0 left-0 w-[2px] bg-red-500 z-30 pointer-events-none shadow-[0_0_6px_rgba(239,68,68,0.7)]"
    >
      {/* Playhead Top Badge Handle (Click and drag to scrub) */}
      <div
        onMouseDown={onPlayheadMouseDown}
        className="absolute -top-1 -left-[7px] w-4 h-5 bg-red-500 hover:bg-red-400 active:scale-110 rounded-b-sm flex flex-col items-center justify-center pointer-events-auto cursor-ew-resize shadow-md shadow-red-500/40 transition-transform"
        title="Drag to scrub timeline"
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full pointer-events-none mb-0.5" />
        <div className="w-0.5 h-1.5 bg-white/70 rounded-full pointer-events-none" />
      </div>

      {/* Red vertical stem handle: clicking anywhere on the line allows scrubbing */}
      <div
        onMouseDown={onPlayheadMouseDown}
        className="absolute top-4 bottom-0 -left-1.5 w-3.5 pointer-events-auto cursor-ew-resize hover:bg-red-500/20 transition-colors"
      />
    </div>
  );
});

/* ==========================================================================
   2. ISOLATED TIMECODE DISPLAY
   ========================================================================== */
const TimecodeDisplay: React.FC = React.memo(() => {
  const currentTime = useVideoStore((state) => state.currentTime);
  return (
    <div className="font-mono text-xs font-bold text-cyan-400 bg-[#141416] px-2 py-1 rounded border border-[#27272a]">
      {formatTimecode(currentTime)}
    </div>
  );
});

/* ==========================================================================
   3. VIRTUALIZED RULER TRACK (ONLY RENDERS VISIBLE TICKS)
   ========================================================================== */
interface RulerTrackProps {
  effectiveDuration: number;
  timelineZoom: number;
  scrollLeft: number;
  containerWidth: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

const RulerTrack: React.FC<RulerTrackProps> = React.memo(({
  effectiveDuration,
  timelineZoom,
  scrollLeft,
  containerWidth,
  onMouseDown,
}) => {
  const visibleStartSec = Math.max(0, Math.floor((scrollLeft - 100) / timelineZoom));
  const visibleEndSec = Math.min(effectiveDuration + 5, Math.ceil((scrollLeft + containerWidth + 100) / timelineZoom));

  const ticks = useMemo(() => {
    const list: { sec: number; isMajor: boolean }[] = [];
    const step = timelineZoom > 100 ? 1 : timelineZoom > 50 ? 2 : 5;
    for (let t = visibleStartSec; t <= visibleEndSec; t += step) {
      list.push({
        sec: t,
        isMajor: t % (step * 2) === 0 || t === 0,
      });
    }
    return list;
  }, [visibleStartSec, visibleEndSec, timelineZoom]);

  return (
    <div
      className="h-6 border-b border-[#27272a] bg-[#161619] relative cursor-pointer overflow-hidden"
      onMouseDown={onMouseDown}
    >
      {ticks.map((t) => (
        <div
          key={t.sec}
          style={{ left: `${t.sec * timelineZoom}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
        >
          <div className={`w-[1px] ${t.isMajor ? 'h-3 bg-zinc-500' : 'h-1.5 bg-zinc-700'}`} />
          {t.isMajor && (
            <span className="text-[9px] font-mono text-zinc-400 pl-1 -translate-y-2 select-none">
              {Math.floor(t.sec)}s
            </span>
          )}
        </div>
      ))}
    </div>
  );
});

/* ==========================================================================
   4. VIRTUALIZED CAPTION BLOCK & TRACK (CLEAN PHRASES, ZERO DOM CLUTTER)
   ========================================================================== */
interface SubtitlePhraseBlock {
  id: string;
  words: WordToken[];
  start: number;
  end: number;
  text: string;
  hasKeyword: boolean;
}

interface SubtitleBlockProps {
  block: SubtitlePhraseBlock;
  isSelected: boolean;
  timelineZoom: number;
  onClick: (block: SubtitlePhraseBlock, e: React.MouseEvent) => void;
  onResizeStart: (blockId: string, edge: 'start' | 'end', e: React.MouseEvent) => void;
}

const SubtitleBlock: React.FC<SubtitleBlockProps> = React.memo(({
  block,
  isSelected,
  timelineZoom,
  onClick,
  onResizeStart,
}) => {
  const leftPx = block.start * timelineZoom;
  const widthPx = Math.max(10, (block.end - block.start) * timelineZoom);

  return (
    <div
      onClick={(e) => onClick(block, e)}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      className={`absolute top-2 bottom-2 rounded-md border flex items-center justify-between px-1.5 text-xs font-bold select-none overflow-hidden cursor-pointer ${
        isSelected
          ? 'bg-yellow-500/25 border-yellow-400 ring-2 ring-yellow-400 text-yellow-200 shadow-md shadow-yellow-500/20 z-10'
          : block.hasKeyword
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:border-amber-400 hover:bg-amber-500/30'
          : 'bg-[#202024] border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-[#25252a]'
      }`}
    >
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(block.id, 'start', e);
          }}
          className="absolute left-0 top-0 bottom-0 w-2.5 bg-yellow-400 cursor-ew-resize hover:bg-white"
        />
      )}

      {widthPx >= 28 ? (
        <span className="truncate px-0.5 text-[11px] tracking-wide pointer-events-none font-semibold">
          {block.text}
        </span>
      ) : null}

      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(block.id, 'end', e);
          }}
          className="absolute right-0 top-0 bottom-0 w-2.5 bg-yellow-400 cursor-ew-resize hover:bg-white"
        />
      )}
    </div>
  );
});

interface VirtualizedSubtitleTrackProps {
  transcript: WordToken[];
  timelineZoom: number;
  scrollLeft: number;
  containerWidth: number;
  selectedTimelineItemId: string | null;
  selectedTimelineItemType: string | null;
  onBlockClick: (block: SubtitlePhraseBlock, e: React.MouseEvent) => void;
  onResizeStart: (blockId: string, edge: 'start' | 'end', e: React.MouseEvent) => void;
}

const VirtualizedSubtitleTrack: React.FC<VirtualizedSubtitleTrackProps> = React.memo(({
  transcript,
  timelineZoom,
  scrollLeft,
  containerWidth,
  selectedTimelineItemId,
  selectedTimelineItemType,
  onBlockClick,
  onResizeStart,
}) => {
  // Group words into clean phrase blocks (2 to 4 words per block like CapCut Desktop)
  const blocks = useMemo(() => {
    if (!transcript || transcript.length === 0) return [];
    const list: SubtitlePhraseBlock[] = [];
    const blockSize = 3;

    for (let i = 0; i < transcript.length; i += blockSize) {
      const slice = transcript.slice(i, i + blockSize);
      const start = slice[0].start;
      const end = slice[slice.length - 1].end;
      list.push({
        id: slice[0].id,
        words: slice,
        start,
        end: Math.max(end, start + 0.35),
        text: slice.map(w => w.word).join(' '),
        hasKeyword: slice.some(w => w.keyword)
      });
    }
    return list;
  }, [transcript]);

  // Virtualization window: only render blocks that intersect the visible scroll window
  const visibleStartPx = Math.max(0, scrollLeft - 150);
  const visibleEndPx = scrollLeft + containerWidth + 150;

  const visibleBlocks = useMemo(() => {
    return blocks.filter(b => {
      const bLeft = b.start * timelineZoom;
      const bRight = b.end * timelineZoom;
      return bRight >= visibleStartPx && bLeft <= visibleEndPx;
    });
  }, [blocks, timelineZoom, visibleStartPx, visibleEndPx]);

  return (
    <div className="h-16 border-b border-[#27272a]/80 relative flex items-center px-1 bg-[#141416]/50 overflow-hidden">
      {visibleBlocks.map((block) => {
        const isSelected = (selectedTimelineItemId === block.id || block.words.some(w => w.id === selectedTimelineItemId)) && selectedTimelineItemType === 'subtitle';
        return (
          <SubtitleBlock
            key={block.id}
            block={block}
            isSelected={isSelected}
            timelineZoom={timelineZoom}
            onClick={onBlockClick}
            onResizeStart={onResizeStart}
          />
        );
      })}
    </div>
  );
});

/* ==========================================================================
   5. MULTI-SEGMENT VIDEO FILMSTRIP TRACK (SPLIT & RIPPLE DELETE)
   ========================================================================== */
interface VideoTrackProps {
  segments: VideoSegment[];
  timelineZoom: number;
  selectedTimelineItemId: string | null;
  selectedTimelineItemType: string | null;
  isBladeActive: boolean;
  onSegmentClick: (segment: VideoSegment, e: React.MouseEvent) => void;
}

const VideoTrack: React.FC<VideoTrackProps> = React.memo(({
  segments,
  timelineZoom,
  selectedTimelineItemId,
  selectedTimelineItemType,
  isBladeActive,
  onSegmentClick,
}) => {
  if (!segments || segments.length === 0) return <div className="h-16 border-b border-[#27272a]/80 bg-[#121214]/60" />;

  return (
    <div className="h-16 border-b border-[#27272a]/80 relative flex items-center bg-[#121214]/60 overflow-hidden">
      {segments.map((seg) => {
        const isSelected = selectedTimelineItemId === seg.id && selectedTimelineItemType === 'video';
        const leftPx = seg.start * timelineZoom;
        const widthPx = Math.max(2, (seg.end - seg.start) * timelineZoom);

        return (
          <div
            key={seg.id}
            onClick={(e) => onSegmentClick(seg, e)}
            style={{
              left: `${leftPx}px`,
              width: `${widthPx}px`,
            }}
            className={`absolute top-2 bottom-2 rounded-xs border-y border-l overflow-hidden select-none flex items-center justify-between px-1.5 cursor-pointer ${
              isSelected
                ? 'bg-cyan-950/80 border-yellow-400 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20 z-20 border-r border-r-yellow-400'
                : isBladeActive
                ? 'bg-slate-900/95 border-cyan-500/50 hover:border-cyan-400 border-r-2 border-r-cyan-400/90'
                : 'bg-slate-900/85 border-slate-700/80 hover:border-slate-500 border-r-2 border-r-cyan-500/40'
            }`}
          >
            {widthPx >= 65 ? (
              <div className="flex items-center space-x-1.5 text-zinc-300 pointer-events-none truncate min-w-0">
                <Video className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="text-[11px] font-bold truncate">
                  {seg.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">
                  {seg.duration.toFixed(1)}s
                </span>
              </div>
            ) : widthPx >= 22 ? (
              <div className="flex items-center justify-center w-full pointer-events-none text-cyan-400">
                <Video className="w-3 h-3" />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

/* ==========================================================================
   6. HIGH-PERFORMANCE AUDIO WAVEFORM CANVAS (ZERO DOM ELEMENTS)
   ========================================================================== */
interface AudioWaveformCanvasProps {
  duration: number;
  timelineZoom: number;
}

const AudioWaveformCanvas: React.FC<AudioWaveformCanvasProps> = React.memo(({ duration, timelineZoom }) => {
  const width = Math.max(800, Math.round((duration || 10) * timelineZoom));

  return (
    <div className="h-14 relative flex items-center px-1 bg-[#0f0f11] overflow-hidden">
      <div
        style={{ width: `${width}px` }}
        className="h-full relative flex items-center bg-emerald-950/20 border border-emerald-500/20 rounded-md overflow-hidden pointer-events-none"
      >
        <div
          className="w-full h-9 opacity-85"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #34d399 0px, #34d399 2px, transparent 2px, transparent 6px), radial-gradient(ellipse at center, rgba(52, 211, 153, 0.45) 0%, transparent 80%)`,
            backgroundSize: '6px 75%, 100% 100%',
            backgroundRepeat: 'repeat-x, no-repeat',
            backgroundPosition: 'center, center',
          }}
        />
      </div>
    </div>
  );
});

/* ==========================================================================
   7. MAIN CAPCUT TIMELINE CONTAINER (ZERO LAG ARCHITECTURE)
   ========================================================================== */
export const CapCutTimeline: React.FC = () => {
  const {
    duration,
    isPlaying,
    setIsPlaying,
    transcript,
    updateWord,
    timelineZoom,
    setTimelineZoom,
    isBladeActive,
    setIsBladeActive,
    isSnapEnabled,
    setIsSnapEnabled,
    selectedTimelineItemId,
    selectedTimelineItemType,
    setSelectedTimelineItem,
    splitAtPlayhead,
    deleteSelectedTimelineItem,
    videoName,
    detectAndRemoveSilence,
    undoSilenceRemoval,
    isDetectingSilence,
    removedSilenceDuration,
    setCurrentTime,
    videoSegments,
    splitSegmentAtTime,
    isScrubbing,
    setIsScrubbing,
  } = useVideoStore(
    useShallow((state) => ({
      duration: state.duration,
      isPlaying: state.isPlaying,
      setIsPlaying: state.setIsPlaying,
      transcript: state.transcript,
      updateWord: state.updateWord,
      timelineZoom: state.timelineZoom,
      setTimelineZoom: state.setTimelineZoom,
      isBladeActive: state.isBladeActive,
      setIsBladeActive: state.setIsBladeActive,
      isSnapEnabled: state.isSnapEnabled,
      setIsSnapEnabled: state.setIsSnapEnabled,
      selectedTimelineItemId: state.selectedTimelineItemId,
      selectedTimelineItemType: state.selectedTimelineItemType,
      setSelectedTimelineItem: state.setSelectedTimelineItem,
      splitAtPlayhead: state.splitAtPlayhead,
      deleteSelectedTimelineItem: state.deleteSelectedTimelineItem,
      videoName: state.videoName,
      detectAndRemoveSilence: state.detectAndRemoveSilence,
      undoSilenceRemoval: state.undoSilenceRemoval,
      isDetectingSilence: state.isDetectingSilence,
      removedSilenceDuration: state.removedSilenceDuration,
      setCurrentTime: state.setCurrentTime,
      videoSegments: state.videoSegments,
      splitSegmentAtTime: state.splitSegmentAtTime,
      isScrubbing: state.isScrubbing,
      setIsScrubbing: state.setIsScrubbing,
    }))
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [resizingWordId, setResizingWordId] = useState<string | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'start' | 'end' | null>(null);
  const [track1Locked, setTrack1Locked] = useState(false);
  const [track2Locked, setTrack2Locked] = useState(false);
  const [track3Locked, setTrack3Locked] = useState(false);

  // Viewport geometry state for virtualization (no forced clientWidth in loop)
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [bladeHoverX, setBladeHoverX] = useState<number | null>(null);
  const [bladeHoverTime, setBladeHoverTime] = useState<number | null>(null);

  const effectiveDuration = Math.max(duration || 10, transcript.length ? transcript[transcript.length - 1].end + 2 : 10);
  const timelineWidth = Math.max(800, effectiveDuration * timelineZoom);

  // Initialize and track container width on resize
  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  // Throttled RAF scroll handler (Zero lag, drops duplicate frame scrolls)
  const handleContainerScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (scrollContainerRef.current) {
        setScrollLeft(scrollContainerRef.current.scrollLeft);
      }
    });
  }, []);

  // Scrub time calculation
  const getTimeFromMouseEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!scrollContainerRef.current) return 0;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const curScroll = scrollContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + curScroll;
    const calculatedTime = Math.max(0, Math.min(effectiveDuration, clickX / timelineZoom));
    return Number(calculatedTime.toFixed(2));
  }, [effectiveDuration, timelineZoom]);

  // Unified Scrub Start Handler for Ruler and Playhead Handle
  const handleScrubStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    setIsScrubbing(true);
    const newTime = getTimeFromMouseEvent(e);
    setCurrentTime(newTime);
  }, [getTimeFromMouseEvent, setCurrentTime, setIsPlaying, setIsScrubbing]);

  // Window-level dragging effect with 60 FPS RAF throttling
  useEffect(() => {
    if (!isScrubbing && !resizingWordId) return;

    if (isScrubbing) {
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    let scrubRaf: number | null = null;
    let targetTime: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (isScrubbing) {
        const newTime = getTimeFromMouseEvent(e);
        targetTime = newTime;

        // Decouple mouse event spam from React renders via RAF (smooth 60fps)
        if (scrubRaf === null) {
          scrubRaf = requestAnimationFrame(() => {
            if (targetTime !== null) {
              setCurrentTime(targetTime);
            }
            scrubRaf = null;
          });
        }
      } else if (resizingWordId && resizeEdge) {
        const newTime = getTimeFromMouseEvent(e);
        const currentTranscript = useVideoStore.getState().transcript;
        const idx = currentTranscript.findIndex(w => w.id === resizingWordId);
        if (idx !== -1) {
          const w = currentTranscript[idx];
          if (resizeEdge === 'start') {
            const clampedStart = Math.max(0, Math.min(w.end - 0.1, newTime));
            updateWord(idx, { start: Number(clampedStart.toFixed(2)) });
          } else {
            const clampedEnd = Math.max(w.start + 0.1, newTime);
            updateWord(idx, { end: Number(clampedEnd.toFixed(2)) });
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (scrubRaf !== null) {
        cancelAnimationFrame(scrubRaf);
        scrubRaf = null;
      }
      if (isScrubbing && targetTime !== null) {
        setCurrentTime(targetTime);
      }
      setIsScrubbing(false);
      setResizingWordId(null);
      setResizeEdge(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (scrubRaf !== null) cancelAnimationFrame(scrubRaf);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isScrubbing, resizingWordId, resizeEdge, getTimeFromMouseEvent, updateWord, setCurrentTime, setIsScrubbing]);

  // Handle video segment click (Blade split or selection)
  const handleSegmentClick = useCallback((seg: VideoSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBladeActive) {
      const clickTime = getTimeFromMouseEvent(e);
      splitSegmentAtTime(clickTime, 'video');
      setCurrentTime(clickTime);
    } else {
      setSelectedTimelineItem(seg.id, 'video');
      setCurrentTime(seg.start);
    }
  }, [isBladeActive, getTimeFromMouseEvent, splitSegmentAtTime, setSelectedTimelineItem, setCurrentTime]);

  // Handle subtitle block click (Blade split or selection)
  const handleBlockClick = useCallback((block: SubtitlePhraseBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBladeActive) {
      const clickTime = getTimeFromMouseEvent(e);
      splitSegmentAtTime(clickTime, 'subtitle');
      setCurrentTime(clickTime);
    } else {
      setSelectedTimelineItem(block.id, 'subtitle');
      setCurrentTime(block.start);
    }
  }, [isBladeActive, getTimeFromMouseEvent, splitSegmentAtTime, setSelectedTimelineItem, setCurrentTime]);

  const handleResizeStart = useCallback((blockId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
    setResizingWordId(blockId);
    setResizeEdge(edge);
  }, []);

  return (
    <div
      className={`${
        isMinimized ? 'h-10' : 'h-[270px]'
      } flex flex-col bg-[#121214] border-t border-[#27272a] select-none text-zinc-200 flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden`}
    >
      {/* Top Timeline Toolbar */}
      <div
        onDoubleClick={() => setIsMinimized(!isMinimized)}
        className="h-10 border-b border-[#27272a] px-3 flex items-center justify-between bg-[#18181b]"
        title="Double click to minimize/expand timeline"
      >
        {/* Left Toolbar Tools */}
        <div className="flex items-center space-x-1.5">
          {/* Select Tool (V) */}
          <button
            onClick={() => setIsBladeActive(false)}
            className={`p-1.5 rounded-md transition-colors ${
              !isBladeActive
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Selection Tool (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          {/* Razor Blade Tool (B) */}
          <button
            onClick={() => setIsBladeActive(!isBladeActive)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors text-xs font-semibold ${
              isBladeActive
                ? 'bg-cyan-500 text-black shadow-sm font-bold ring-1 ring-cyan-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Razor Blade Tool (B) - Click anywhere on timeline to cut"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Razor (B)</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Instant Split at Playhead Button (Ctrl+B) */}
          <button
            onClick={splitAtPlayhead}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-cyan-500 hover:text-black text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-all group active:scale-95 shadow-xs"
            title="Split Clip & Caption at Playhead (Ctrl+B)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black transition-colors" />
            <span className="font-semibold">Split</span>
            <span className="text-[10px] text-zinc-400 group-hover:text-black/70 font-mono">Ctrl+B</span>
          </button>

          {/* Delete Tool (Del) */}
          <button
            onClick={deleteSelectedTimelineItem}
            disabled={!selectedTimelineItemId}
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:hover:text-zinc-400"
            title="Delete Selected Clip (Del / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-800" />

          {/* Magnet / Snap Toggle (N) */}
          <button
            onClick={() => setIsSnapEnabled(!isSnapEnabled)}
            className={`p-1.5 rounded-md transition-all ${
              isSnapEnabled
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Snapping (N)"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-800" />

          {/* Smart Silence & Dead-Air Remover Button */}
          {removedSilenceDuration > 0 ? (
            <div className="flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded-md">
              <span className="text-[11px] font-bold text-emerald-400">
                ✂️ Cut {removedSilenceDuration}s Silence
              </span>
              <button
                onClick={undoSilenceRemoval}
                className="text-[10px] text-zinc-400 hover:text-white underline"
                title="Undo Silence Jump Cut"
              >
                Undo
              </button>
            </div>
          ) : (
            <button
              onClick={detectAndRemoveSilence}
              disabled={isDetectingSilence || transcript.length === 0}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all active:scale-95 disabled:opacity-40"
              title="Automatically detect pauses & silence (>0.5s) and jump-cut dead air for maximum retention"
            >
              <Zap className={`w-3.5 h-3.5 text-cyan-400 ${isDetectingSilence ? 'animate-spin' : ''}`} />
              <span>{isDetectingSilence ? 'Analyzing Silence...' : 'Remove Dead Air'}</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-zinc-800" />

          {/* Isolated Timecode Reader (Never causes timeline re-renders) */}
          <TimecodeDisplay />
        </div>

        {/* Right Zoom & View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimelineZoom(timelineZoom - 10)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="20"
            max="160"
            step="5"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(parseInt(e.target.value))}
            className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <button
            onClick={() => setTimelineZoom(timelineZoom + 10)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setTimelineZoom(60)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono"
            title="Reset Zoom"
          >
            1x
          </button>

          <div className="h-4 w-[1px] bg-zinc-800" />

          {/* Minimize / Expand Timeline Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              isMinimized
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isMinimized ? "Restore / Expand Timeline" : "Minimize Timeline (Maximize video canvas)"}
          >
            {isMinimized ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">Expand</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Minimize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tracks Workspace (Smooth 60 FPS Virtualized Canvas) */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Track Headers Column */}
          <div className="w-28 border-r border-[#27272a] bg-[#141416] flex flex-col flex-shrink-0 z-20">
            {/* Ruler Corner Spacer */}
            <div className="h-6 border-b border-[#27272a] bg-[#18181b] flex items-center px-2 text-[10px] text-zinc-500 font-mono">
              Tracks
            </div>

            {/* Track 1: Subtitle / Captions Track Header */}
            <div className="h-16 border-b border-[#27272a] px-2.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <Type className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold text-zinc-300">Captions</span>
              </div>
              <button
                onClick={() => setTrack1Locked(!track1Locked)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {track1Locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
              </button>
            </div>

            {/* Track 2: Video Track Header */}
            <div className="h-16 border-b border-[#27272a] px-2.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-1.5 text-blue-400">
                <Video className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold text-zinc-300">Video 1</span>
              </div>
              <button
                onClick={() => setTrack2Locked(!track2Locked)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {track2Locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
              </button>
            </div>

            {/* Track 3: Audio Track Header */}
            <div className="h-14 border-b border-[#27272a] px-2.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Music className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold text-zinc-300">Audio 1</span>
              </div>
              <button
                onClick={() => setTrack3Locked(!track3Locked)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {track3Locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Right Scrollable Timeline Canvas */}
          <div
            ref={scrollContainerRef}
            onScroll={handleContainerScroll}
            onMouseMove={(e) => {
              if (isBladeActive && scrollContainerRef.current) {
                const rect = scrollContainerRef.current.getBoundingClientRect();
                const curScroll = scrollContainerRef.current.scrollLeft;
                const clickX = e.clientX - rect.left + curScroll;
                const t = Math.max(0, Math.min(effectiveDuration, clickX / timelineZoom));
                setBladeHoverX(clickX);
                setBladeHoverTime(Number(t.toFixed(2)));
              }
            }}
            onMouseLeave={() => {
              if (bladeHoverX !== null) {
                setBladeHoverX(null);
                setBladeHoverTime(null);
              }
            }}
            className={`flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0f0f11] ${
              isBladeActive ? 'cursor-crosshair' : 'cursor-default'
            }`}
            onClick={(e) => {
              if (isBladeActive) {
                const clickTime = getTimeFromMouseEvent(e);
                splitSegmentAtTime(clickTime, 'video');
                setCurrentTime(clickTime);
              } else {
                setSelectedTimelineItem(null, null);
              }
            }}
          >
            <div
              style={{ width: `${timelineWidth}px` }}
              className="h-full relative flex flex-col"
            >
              {/* Interactive Razor / Scissors Guide Line */}
              {isBladeActive && bladeHoverX !== null && (
                <div
                  style={{ left: `${bladeHoverX}px` }}
                  className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-40 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                >
                  <div className="absolute top-0 -left-6 bg-cyan-500 text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-lg pointer-events-none">
                    <Scissors className="w-2.5 h-2.5" />
                    <span>{bladeHoverTime?.toFixed(2)}s</span>
                  </div>
                </div>
              )}
              {/* 1. Timecode Ruler Track (Virtualized, ~20 ticks in DOM) */}
              <RulerTrack
                effectiveDuration={effectiveDuration}
                timelineZoom={timelineZoom}
                scrollLeft={scrollLeft}
                containerWidth={containerWidth}
                onMouseDown={handleScrubStart}
              />

              {/* 2. Subtitle Phrase Track (CapCut Desktop Style, Virtualized ~8 blocks in DOM) */}
              <VirtualizedSubtitleTrack
                transcript={transcript}
                timelineZoom={timelineZoom}
                scrollLeft={scrollLeft}
                containerWidth={containerWidth}
                selectedTimelineItemId={selectedTimelineItemId}
                selectedTimelineItemType={selectedTimelineItemType}
                onBlockClick={handleBlockClick}
                onResizeStart={handleResizeStart}
              />

              {/* 3. Video Filmstrip Track (Multi-segment Split & Ripple Support) */}
              <VideoTrack
                segments={videoSegments}
                timelineZoom={timelineZoom}
                selectedTimelineItemId={selectedTimelineItemId}
                selectedTimelineItemType={selectedTimelineItemType}
                isBladeActive={isBladeActive}
                onSegmentClick={handleSegmentClick}
              />

              {/* 4. GPU HTML5 Audio Waveform Canvas (1 DOM node, zero overhead) */}
              <AudioWaveformCanvas
                duration={duration}
                timelineZoom={timelineZoom}
              />

              {/* 5. GPU Hardware-Accelerated Playhead (Drag Handle & Line) */}
              <TimelinePlayhead
                timelineZoom={timelineZoom}
                scrollContainerRef={scrollContainerRef}
                containerWidth={containerWidth}
                onPlayheadMouseDown={handleScrubStart}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
