import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Music, Star, Clock, Play } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { useMusicLibrary } from '@/hooks/useMusicContext';
import { usePlayer } from '@/hooks/usePlayerContext';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import { MusicTrack, MusicPlaylist } from '@/hooks/useMusic';
import SongCard from '@/components/SongCard';
import TrackRow from '@/components/TrackRow';
import PlaylistCard from '@/components/PlaylistCard';
import { useNavigate } from '@/lib/navigation';

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

const Index = () => {
  const navigate = useNavigate();
  const { trending, newReleases, featuredPlaylists, loading, loadHomePage } = useMusicLibrary();
  const {
    currentTrack, isPlaying, recentlyPlayed, play, playAll,
    addToQueue, addToQueueNext, toggleFavorite, isFavorite,
  } = usePlayer();
  const { playlists: userPlaylists, createPlaylist, addTrackToPlaylist } = useUserPlaylists();

  useEffect(() => {
    loadHomePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playlistProps = {
    playlists: userPlaylists,
    onAddToPlaylist: (playlistId: string, track: MusicTrack) => addTrackToPlaylist(playlistId, track),
    onCreatePlaylist: (name: string) => createPlaylist(name),
  };

  const hero = trending[0];

  const openPlaylist = (playlist: MusicPlaylist) =>
    navigate(`/library?playlist=${encodeURIComponent(playlist.id)}`);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl surface-panel p-7 md:p-10"
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: 'radial-gradient(120% 120% at 85% 10%, hsl(var(--primary) / 0.35), transparent 60%)' }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Featured today</p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
              {hero ? hero.title : 'Welcome to Zentra'}
            </h1>
            <p className="text-muted-foreground max-w-lg">
              {hero ? hero.artist : 'Your music. Your way. Stream, discover, and create.'}
            </p>
            <LiquidButton
              size="lg"
              className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm"
              onClick={() => (trending.length ? playAll(trending, 0) : navigate('/search'))}
            >
              <Play className="w-4 h-4 fill-current" />
              {trending.length ? 'Play trending' : 'Start listening'}
            </LiquidButton>
          </div>
          {hero && (
            <img
              src={hero.imageBig || hero.image}
              alt={hero.title}
              className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl"
            />
          )}
        </div>
      </motion.div>

      {recentlyPlayed.length > 0 && (
        <Section title="Recently played" icon={Clock}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentlyPlayed.map((track, i) => (
              <SongCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => playAll(recentlyPlayed, i)}
                onAddToQueue={addToQueue}
                onPlayNext={addToQueueNext}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(track.id)}
                index={i}
                {...playlistProps}
              />
            ))}
          </div>
        </Section>
      )}

      {trending.length > 0 && (
        <Section title="Trending now" icon={TrendingUp}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {trending.slice(0, 12).map((track, i) => (
              <SongCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => playAll(trending.slice(0, 12), i)}
                onAddToQueue={addToQueue}
                onPlayNext={addToQueueNext}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(track.id)}
                index={i}
                {...playlistProps}
              />
            ))}
          </div>
        </Section>
      )}

      {featuredPlaylists.length > 0 && (
        <Section title="Featured playlists" icon={Music}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredPlaylists.slice(0, 12).map((playlist, i) => (
              <PlaylistCard key={playlist.id} playlist={playlist} onClick={openPlaylist} index={i} />
            ))}
          </div>
        </Section>
      )}

      {newReleases.length > 0 && (
        <Section title="Top charts" icon={Star}>
          <div className="surface-panel rounded-2xl p-2 divide-y divide-border/40">
            {newReleases.slice(0, 15).map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => playAll(newReleases.slice(0, 15), i)}
                onAddToQueue={addToQueue}
                onPlayNext={addToQueueNext}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(track.id)}
                index={i}
                {...playlistProps}
              />
            ))}
          </div>
        </Section>
      )}

      {loading && trending.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl surface-panel p-3 animate-pulse">
              <div className="aspect-square rounded-lg bg-secondary/60 mb-3" />
              <div className="h-3 rounded bg-secondary/60 mb-2" />
              <div className="h-3 w-2/3 rounded bg-secondary/40" />
            </div>
          ))}
        </div>
      )}

      {!loading && trending.length === 0 && newReleases.length === 0 && (
        <div className="surface-panel rounded-2xl p-12 text-center text-muted-foreground">
          <Music className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Music catalog is temporarily unavailable. Try a search or refresh in a moment.</p>
        </div>
      )}

      {/* keep `play` referenced for single-track playback API parity */}
      <span className="hidden" aria-hidden onClick={() => currentTrack && play(currentTrack)} />
    </div>
  );
};

export default Index;
