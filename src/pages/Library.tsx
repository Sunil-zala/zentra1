import { useState } from 'react';
import { ListMusic, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TrackRow from '@/components/TrackRow';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import { usePlayer } from '@/hooks/usePlayerContext';
import { MusicTrack } from '@/hooks/useMusic';

const Library = () => {
  const {
    playlists, createPlaylist, deletePlaylist, addTrackToPlaylist, getPlaylistTracks,
  } = useUserPlaylists();
  const {
    currentTrack, isPlaying, playAll, addToQueue, addToQueueNext, toggleFavorite, isFavorite,
  } = usePlayer();

  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  const openPlaylist = async (id: string) => {
    setSelected(id);
    setTracks(await getPlaylistTracks(id));
  };

  const playlistProps = {
    playlists,
    onAddToPlaylist: (playlistId: string, track: MusicTrack) => addTrackToPlaylist(playlistId, track),
    onCreatePlaylist: (n: string) => createPlaylist(n),
  };

  const current = playlists.find((p) => p.id === selected);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Your Library</h1>
          <p className="text-muted-foreground text-sm mt-1">{playlists.length} playlists</p>
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && name.trim()) {
                await createPlaylist(name.trim());
                setName('');
                toast.success('Playlist created');
              }
            }}
            placeholder="New playlist name"
            className="bg-input border border-border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={async () => {
              if (!name.trim()) return;
              await createPlaylist(name.trim());
              setName('');
              toast.success('Playlist created');
            }}
            className="inline-flex items-center gap-1.5 gradient-primary text-primary-foreground font-semibold text-sm px-4 py-2 rounded-full"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="surface-panel rounded-2xl p-12 text-center text-muted-foreground">
          <ListMusic className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No playlists yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => openPlaylist(pl.id)}
              className={`group surface-panel rounded-xl p-4 cursor-pointer transition-colors ${
                selected === pl.id ? 'border-primary/50' : 'hover:border-primary/30'
              }`}
            >
              <div className="w-full aspect-square rounded-lg bg-secondary/50 flex items-center justify-center mb-3">
                <ListMusic className="w-10 h-10 text-primary/50" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-sm truncate">{pl.name}</h3>
                  <p className="text-xs text-muted-foreground">{pl.trackCount} songs</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(pl.id);
                    if (selected === pl.id) { setSelected(null); setTracks([]); }
                    toast.success('Playlist deleted');
                  }}
                  aria-label="Delete playlist"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {current && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">{current.name}</h2>
          {tracks.length > 0 ? (
            <div className="surface-panel rounded-2xl p-2 divide-y divide-border/40">
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  onPlay={() => playAll(tracks, i)}
                  onAddToQueue={addToQueue}
                  onPlayNext={addToQueueNext}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isFavorite(track.id)}
                  index={i}
                  {...playlistProps}
                />
              ))}
            </div>
          ) : (
            <div className="surface-panel rounded-2xl p-10 text-center text-muted-foreground">
              No songs yet — add tracks from Search or Home.
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Library;
