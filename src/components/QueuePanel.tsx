import { X, GripVertical, Trash2, Play, ListMusic } from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from 'react';

interface QueuePanelProps {
  queue: MusicTrack[];
  currentTrack: MusicTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayFromQueue: (index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onReorderQueue: (from: number, to: number) => void;
  onClearQueue: () => void;
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const QueuePanel = ({
  queue, currentTrack, isOpen, onClose,
  onPlayFromQueue, onRemoveFromQueue, onReorderQueue, onClearQueue,
}: QueuePanelProps) => {

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) onReorderQueue(index, index - 1);
  }, [onReorderQueue]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < queue.length - 1) onReorderQueue(index, index + 1);
  }, [onReorderQueue, queue.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm glass border-l border-border/30 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Queue</h2>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {queue.length} songs
                </span>
              </div>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={onClearQueue}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Now Playing */}
            {currentTrack && (
              <div className="p-4 border-b border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Now Playing</p>
                <div className="flex items-center gap-3">
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-sm text-primary truncate">{currentTrack.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                  </div>
                  <div className="flex gap-0.5 items-end h-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-primary rounded-full animate-pulse"
                        style={{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
                  <ListMusic className="w-12 h-12 opacity-30" />
                  <p className="text-sm text-center">Queue is empty. Play a song or playlist to fill it up!</p>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-2 font-medium">Up Next</p>
                  {queue.map((track, index) => (
                    <motion.div
                      key={`${track.id}-${index}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className="group flex items-center gap-2 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:text-primary disabled:opacity-20 text-muted-foreground"
                        >
                          <GripVertical className="w-3 h-3 rotate-90" />
                        </button>
                      </div>

                      {/* Track info */}
                      <button
                        onClick={() => onPlayFromQueue(index)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                      </button>

                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDuration(track.duration)}
                      </span>

                      {/* Play / Remove */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => onPlayFromQueue(index)}
                          className="p-1.5 rounded-full hover:bg-primary/20 text-primary transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveFromQueue(index)}
                          className="p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QueuePanel;
