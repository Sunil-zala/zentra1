import { useState } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SongCard from '@/components/SongCard';
import { useMusicLibrary } from '@/hooks/useMusicContext';
import { usePlayer } from '@/hooks/usePlayerContext';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import { MusicTrack } from '@/hooks/useMusic';

const Search = () => {
  const {
    results, suggestions, loading, autocompleteSuggestions,
    search, autocomplete, clearAutocomplete,
  } = useMusicLibrary();
  const {
    currentTrack, isPlaying, play, playAll,
    addToQueue, addToQueueNext, toggleFavorite, isFavorite,
  } = usePlayer();
  const { playlists: userPlaylists, createPlaylist, addTrackToPlaylist } = useUserPlaylists();
  const [searched, setSearched] = useState(false);

  const playlistProps = {
    playlists: userPlaylists,
    onAddToPlaylist: (playlistId: string, track: MusicTrack) => addTrackToPlaylist(playlistId, track),
    onCreatePlaylist: (name: string) => createPlaylist(name),
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold">Search</h1>
        <p className="text-muted-foreground text-sm">Find songs, artists and albums across millions of tracks.</p>
      </div>

      <SearchBar
        onSearch={(query, filter) => { search(query, filter); setSearched(true); }}
        loading={loading}
        autocompleteSuggestions={autocompleteSuggestions}
        onAutocomplete={autocomplete}
        onClearAutocomplete={clearAutocomplete}
        onPlayTrack={(track) => play(track)}
      />

      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Results</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((track, i) => (
              <SongCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => playAll(results, i)}
                onAddToQueue={addToQueue}
                onPlayNext={addToQueueNext}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(track.id)}
                index={i}
                {...playlistProps}
              />
            ))}
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold">You might also like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {suggestions.map((track, i) => (
              <SongCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => playAll(suggestions, i)}
                onAddToQueue={addToQueue}
                onPlayNext={addToQueueNext}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(track.id)}
                index={i}
                {...playlistProps}
              />
            ))}
          </div>
        </section>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="surface-panel rounded-2xl p-12 text-center text-muted-foreground">
          No results found. Try a different spelling or artist name.
        </div>
      )}
    </div>
  );
};

export default Search;
