import { useState, useRef, useEffect, ReactNode } from 'react';
import { ListMusic, ListStart, Plus } from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { UserPlaylist } from '@/hooks/useUserPlaylists';
import { motion, AnimatePresence } from 'framer-motion';
import AddToPlaylistMenu from './AddToPlaylistMenu';

interface TrackContextMenuProps {
  track: MusicTrack;
  onAddToQueue: (track: MusicTrack) => void;
  onPlayNext: (track: MusicTrack) => void;
  playlists?: UserPlaylist[] | undefined;
  onAddToPlaylist?: ((playlistId: string, track: MusicTrack) => Promise<void>) | undefined;
  onCreatePlaylist?: ((name: string) => Promise<any>) | undefined;
  children: ReactNode;
}

const TrackContextMenu = ({
  track, onAddToQueue, onPlayNext,
  playlists, onAddToPlaylist, onCreatePlaylist,
  children,
}: TrackContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 180);
    setPosition({ x, y });
    setIsOpen(true);
    setShowPlaylistMenu(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = () => { setIsOpen(false); setShowPlaylistMenu(false); };
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}
      <AnimatePresence>
        {isOpen && !showPlaylistMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{ left: position.x, top: position.y }}
            className="fixed z-[100] min-w-[180px] glass rounded-xl border border-border/40 shadow-xl p-1.5 overflow-hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayNext(track);
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary/60 transition-colors text-left"
            >
              <ListStart className="w-4 h-4 text-primary" />
              Play Next
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue(track);
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary/60 transition-colors text-left"
            >
              <ListMusic className="w-4 h-4 text-primary" />
              Add to Queue
            </button>
            {playlists && onAddToPlaylist && onCreatePlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(true);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary/60 transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-primary" />
                Add to Playlist
              </button>
            )}
          </motion.div>
        )}

        {isOpen && showPlaylistMenu && playlists && onAddToPlaylist && onCreatePlaylist && (
          <AddToPlaylistMenu
            track={track}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onCreatePlaylist={onCreatePlaylist}
            position={position}
            onClose={() => { setIsOpen(false); setShowPlaylistMenu(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackContextMenu;
