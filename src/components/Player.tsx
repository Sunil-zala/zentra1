import {
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack,
  ListMusic, Shuffle, Repeat, Repeat1, Heart, Maximize2,
} from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface PlayerProps {
  track: MusicTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queueCount: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  isFavorite: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (v: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleQueue: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onOpenNowPlaying?: () => void;
}

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const Player = ({
  track, isPlaying, progress, duration, volume, queueCount,
  shuffle, repeat, isFavorite,
  onTogglePlay, onSeek, onVolumeChange, onNext, onPrevious, onToggleQueue,
  onToggleShuffle, onToggleRepeat, onToggleFavorite, onOpenNowPlaying,
}: PlayerProps) => {
  const [scrubbing, setScrubbing] = useState(false);

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="bg-card/95 backdrop-blur-xl border-t border-border/60"
        >
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-3 items-center gap-3 px-3 md:px-6 py-2.5">
            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={onOpenNowPlaying} className="flex-shrink-0" aria-label="Open now playing">
                <motion.img
                  key={track.id}
                  src={track.image}
                  alt={track.album || track.title}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                />
              </button>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <button
                onClick={onToggleFavorite}
                className="ml-1 flex-shrink-0 p-1"
                aria-label="Toggle favorite"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                />
              </button>
            </div>

            {/* Controls + progress */}
            <div className="flex flex-col items-center gap-1.5 md:w-full">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={onToggleShuffle}
                  className={`hidden sm:block p-1.5 transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={onPrevious}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <motion.button
                  onClick={onTogglePlay}
                  className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </motion.button>
                <button
                  onClick={onNext}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Next track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button
                  onClick={onToggleRepeat}
                  className={`hidden sm:block p-1.5 transition-colors ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Repeat"
                >
                  {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 w-full max-w-[520px]">
                <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">{formatTime(progress)}</span>
                <div
                  className="relative flex-1 h-4 flex items-center cursor-pointer group"
                  onMouseEnter={() => setScrubbing(true)}
                  onMouseLeave={() => setScrubbing(false)}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onSeek(((e.clientX - rect.left) / rect.width) * duration);
                  }}
                >
                  <div className="absolute inset-x-0 h-1 rounded-full bg-secondary" />
                  <div
                    className="absolute h-1 rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                  {scrubbing && (
                    <div
                      className="absolute w-3 h-3 rounded-full bg-primary shadow"
                      style={{ left: `${pct}%`, marginLeft: -6 }}
                    />
                  )}
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground w-9">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Queue + volume */}
            <div className="hidden md:flex items-center gap-3 justify-end">
              <button
                onClick={onToggleQueue}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Queue"
              >
                <ListMusic className="w-4 h-4" />
                {queueCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {queueCount > 9 ? '9+' : queueCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenNowPlaying}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Expand now playing"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)} aria-label="Mute">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-primary"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Mobile progress line */}
          <div
            className="md:hidden h-1 bg-secondary cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onSeek(((e.clientX - rect.left) / rect.width) * duration);
            }}
          >
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Player;
