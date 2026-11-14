import { useState } from 'react';
import { Plus, ListMusic } from 'lucide-react';
import { MusicTrack } from '@/hooks/useMusic';
import { UserPlaylist } from '@/hooks/useUserPlaylists';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AddToPlaylistMenuProps {
  track: MusicTrack;
  playlists: UserPlaylist[];
  onAddToPlaylist: (playlistId: string, track: MusicTrack) => Promise<void>;
  onCreatePlaylist: (name: string) => Promise<any>;
  position: { x: number; y: number };
  onClose: () => void;
}

const AddToPlaylistMenu = ({
  track, playlists, onAddToPlaylist, onCreatePlaylist, position, onClose,
}: AddToPlaylistMenuProps) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async (playlistId: string, playlistName: string) => {
    await onAddToPlaylist(playlistId, track);
    toast.success(`Added to "${playlistName}"`);
    onClose();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const pl = await onCreatePlaylist(newName.trim());
    if (pl) {
      await onAddToPlaylist(pl.id, track);
      toast.success(`Created "${newName.trim()}" and added track`);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      style={{ left: position.x, top: position.y }}
      className="fixed z-[110] min-w-[220px] max-h-[300px] glass rounded-xl border border-border/40 shadow-xl p-1.5 overflow-auto"
    >
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Add to Playlist
      </div>

      {playlists.map((pl) => (
        <button
          key={pl.id}
          onClick={() => handleAdd(pl.id, pl.name)}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground rounded-lg hover:bg-secondary/60 transition-colors text-left"
        >
          <ListMusic className="w-4 h-4 text-primary" />
          <span className="truncate">{pl.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{pl.trackCount}</span>
        </button>
      ))}

      {creating ? (
        <div className="flex items-center gap-2 px-3 py-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Playlist name..."
            className="flex-1 bg-secondary/50 rounded-lg px-2 py-1.5 text-sm text-foreground outline-none border border-border/30 focus:border-primary/50"
          />
          <button onClick={handleCreate} className="text-primary text-sm font-medium">Add</button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-primary rounded-lg hover:bg-secondary/60 transition-colors text-left"
        >
          <Plus className="w-4 h-4" />
          New Playlist
        </button>
      )}
    </motion.div>
  );
};

export default AddToPlaylistMenu;
