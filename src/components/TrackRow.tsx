import { Play, Pause, Heart } from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { UserPlaylist } from '@/hooks/useUserPlaylists';
import { motion } from 'framer-motion';
import TrackContextMenu from './TrackContextMenu';

interface TrackRowProps {
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

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const TrackRow = ({
  track, isPlaying, isCurrent, onPlay, onAddToQueue, onPlayNext,
  onToggleFavorite, isFavorite, index,
  playlists, onAddToPlaylist, onCreatePlaylist,
}: TrackRowProps) => {
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
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ x: 4, backgroundColor: 'hsl(220 15% 14% / 0.5)' }}
        onClick={() => onPlay(track)}
        className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
          isCurrent ? 'bg-secondary/70 border border-primary/20' : ''
        }`}
      >
        <span className="w-6 text-center text-sm text-muted-foreground font-mono">
          {isCurrent && isPlaying ? (
            <div className="flex gap-0.5 items-end h-4 justify-center">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary rounded-full"
                  animate={{ height: ['6px', '14px', '8px', '12px', '6px'] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                />
              ))}
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          {!(isCurrent && isPlaying) && (
            <Play className="w-3 h-3 text-primary hidden group-hover:block mx-auto" />
          )}
        </span>

        <motion.img
          src={track.image}
          alt={track.album}
          className="w-10 h-10 rounded-lg object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        />

        <div className="flex-1 min-w-0">
          <p className={`font-display text-sm font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
            {track.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>

        <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">{track.album}</span>

        <div className="flex items-center gap-3">
          {onToggleFavorite && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(track.id, track); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
            >
              <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'}`} />
            </motion.button>
          )}
          <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gradient-primary"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-primary-foreground" />
            ) : (
              <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
            )}
          </motion.div>
        </div>
      </motion.div>
    </TrackContextMenu>
  );
};

export default TrackRow;
