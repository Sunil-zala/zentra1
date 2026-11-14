import { Play, Pause, Heart } from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { UserPlaylist } from '@/hooks/useUserPlaylists';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import TrackContextMenu from './TrackContextMenu';
import { useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SongCardProps {
  track: MusicTrack;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: (track: MusicTrack) => void;
  onAddToQueue: (track: MusicTrack) => void;
  onPlayNext: (track: MusicTrack) => void;
  onToggleFavorite?: (trackId: string, track?: MusicTrack) => void;
  isFavorite?: boolean;
  index: number;
  playlists?: UserPlaylist[];
  onAddToPlaylist?: (playlistId: string, track: MusicTrack) => Promise<void>;
  onCreatePlaylist?: (name: string) => Promise<any>;
}

const SongCard = ({
  track, isPlaying, isCurrent, onPlay, onAddToQueue, onPlayNext,
  onToggleFavorite, isFavorite, index,
  playlists, onAddToPlaylist, onCreatePlaylist,
}: SongCardProps) => {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [x, y, isMobile]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <TrackContextMenu
      track={track}
      onAddToQueue={onAddToQueue}
      onPlayNext={onPlayNext}
      playlists={playlists}
      onAddToPlaylist={onAddToPlaylist}
      onCreatePlaylist={onCreatePlaylist}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={!isMobile ? { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 } : {}}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onPlay(track)}
        className={`group glass rounded-xl p-3 cursor-pointer transition-shadow duration-300 ${!isMobile ? 'shimmer glow-ring' : ''} ${
          isCurrent ? 'border-primary/50 glow-primary' : ''
        }`}
      >
        <div className="relative overflow-hidden rounded-lg mb-3">
          <img
            src={track.image}
            alt={track.album}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
          <div
            className={`absolute inset-0 bg-background/50 flex items-center justify-center transition-opacity ${
              isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <div className="gradient-primary p-3 rounded-full">
              {isCurrent && isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </div>
          </div>
          {isCurrent && isPlaying && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-1 items-end h-4">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-sm text-foreground truncate">
              {track.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {track.artist}
            </p>
          </div>
          {onToggleFavorite && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(track.id, track); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              className="ml-1 flex-shrink-0"
            >
              <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'}`} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </TrackContextMenu>
  );
};

export default SongCard;
