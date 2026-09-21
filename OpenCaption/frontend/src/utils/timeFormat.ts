export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeWithMs(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const cs = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export function formatTimecode(seconds: number, fps: number = 30): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds - Math.floor(seconds)) * fps);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

export interface MinimalSegment {
  start: number;
  end: number;
  sourceStart: number;
  sourceEnd: number;
}

/**
 * Maps a timeline timestamp to the underlying video file source timestamp.
 */
export function timelineToSourceTime(timelineTime: number, segments?: MinimalSegment[]): number {
  if (!segments || segments.length === 0) return timelineTime;
  for (const seg of segments) {
    if (timelineTime >= seg.start - 0.001 && timelineTime <= seg.end + 0.001) {
      const offset = Math.max(0, timelineTime - seg.start);
      return Math.min(seg.sourceEnd, seg.sourceStart + offset);
    }
  }
  if (segments.length > 0 && timelineTime >= segments[segments.length - 1].end) {
    return segments[segments.length - 1].sourceEnd;
  }
  if (segments.length > 0 && timelineTime < segments[0].start) {
    return segments[0].sourceStart;
  }
  return timelineTime;
}

/**
 * Maps an underlying video file timestamp back to the timeline timestamp.
 */
export function sourceToTimelineTime(sourceTime: number, segments?: MinimalSegment[]): number {
  if (!segments || segments.length === 0) return sourceTime;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (sourceTime >= seg.sourceStart - 0.001 && sourceTime <= seg.sourceEnd + 0.001) {
      const offset = Math.max(0, sourceTime - seg.sourceStart);
      return Math.min(seg.end, seg.start + offset);
    }
    // If sourceTime falls into a deleted cut gap between this segment and the next
    if (i < segments.length - 1) {
      const nextSeg = segments[i + 1];
      if (sourceTime > seg.sourceEnd && sourceTime < nextSeg.sourceStart) {
        return nextSeg.start;
      }
    }
  }
  if (segments.length > 0 && sourceTime < segments[0].sourceStart) {
    return segments[0].start;
  }
  if (segments.length > 0 && sourceTime > segments[segments.length - 1].sourceEnd) {
    return segments[segments.length - 1].end;
  }
  return sourceTime;
}

