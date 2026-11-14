import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc3, Music2, Pause, Play, SkipBack, SkipForward,
  Rewind, FastForward, Heart, Shuffle, Repeat, Repeat1, ListMusic, X,
} from 'lucide-react';
import { useRef } from 'react';
import type { MusicTrack } from '@/hooks/useMusic';

interface NowPlayingSideProps {
  track: MusicTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queueLength: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  isFavorite: boolean;
  open: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onSkipBy: (seconds: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onOpenQueue: () => void;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const NowPlayingSide = ({
  track, isPlaying, progress, duration, queueLength,
  shuffle, repeat, isFavorite, open, onClose,
  onTogglePlay, onNext, onPrevious, onSeek, onSkipBy,
  onToggleShuffle, onToggleRepeat, onToggleFavorite, onOpenQueue,
}: NowPlayingSideProps) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    onSeek(ratio * duration);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {open && track && (
        <aside className="fixed right-6 top-24 bottom-32 w-[min(22rem,calc(100vw-3rem))] z-40 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-5 w-full h-full flex flex-col gap-4 pointer-events-auto border border-border/40 overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Disc3
                  className="w-3.5 h-3.5 text-primary"
                  style={isPlaying ? { animation: 'spin 3s linear infinite' } : undefined}
                />
                Now Playing
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenQueue}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                  title="Open queue"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  {queueLength}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  title="Close"
                  aria-label="Close now playing"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-4"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img
                  src={track.imageBig || track.image}
                  alt={track.title}
                  className="w-full h-full object-cover scale-[1.3]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground truncate text-base">
                  {track.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {typeof track.artist === 'string' ? track.artist : 'Unknown'}
                </p>
                {typeof track.album === 'string' && track.album && (
                  <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
                )}
              </div>

              {/* Seek bar (click to scrub) */}
              <div className="space-y-1.5">
                <div
                  ref={barRef}
                  onClick={handleBarClick}
                  className="group relative h-1.5 rounded-full bg-secondary/60 cursor-pointer overflow-hidden"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-200"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${pct}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{fmt(progress)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onToggleShuffle}
                  className={`p-2 rounded-full transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSkipBy(-5)}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  title="Back 5s"
                >
                  <Rewind className="w-4 h-4" />
                </button>
                <button
                  onClick={onPrevious}
                  className="p-2 rounded-full text-foreground hover:scale-110 transition-transform"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={onNext}
                  disabled={queueLength === 0}
                  className="p-2 rounded-full text-foreground hover:scale-110 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSkipBy(5)}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  title="Forward 5s"
                >
                  <FastForward className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleRepeat}
                  className={`p-2 rounded-full transition-colors ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title={`Repeat: ${repeat}`}
                >
                  {repeat === 'one'
                    ? <Repeat1 className="w-4 h-4" />
                    : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Extras */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-2 text-xs transition-colors ${isFavorite ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={onOpenQueue}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ListMusic className="w-4 h-4" />
                  Queue
                </button>
              </div>
            </motion.div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};

export default NowPlayingSide;
