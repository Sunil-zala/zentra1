import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { MusicTrack } from '@/hooks/useMusic';
import Header from '@/components/Header';
import Player from '@/components/Player';
import TrackRow from '@/components/TrackRow';
import QueuePanel from '@/components/QueuePanel';
import ScrollReveal from '@/components/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    currentTrack, isPlaying, progress, duration, volume, queue,
    play, playAll, togglePlay, seek, changeVolume, playNext,
    addToQueue, addToQueueNext, removeFromQueue, reorderQueue, clearQueue, playFromQueue,
    shuffle, repeat, toggleShuffle, toggleRepeat, toggleFavorite, isFavorite,
    getFavoriteTracks,
  } = useAudioPlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  const favTracks = getFavoriteTracks();

  return (
    <>
      <div className="min-h-screen bg-background pb-28 noise">
        <Header />

        <main className="container px-4 pt-6 space-y-8">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div
                className="gradient-primary p-3 rounded-xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Your Favorites</h1>
                <p className="text-sm text-muted-foreground">{favTracks.length} liked songs</p>
              </div>
            </div>
          </div>

          {favTracks.length > 0 ? (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => playAll(favTracks, 0)}
                  className="gradient-primary text-primary-foreground font-semibold px-6"
                >
                  <Music className="w-4 h-4 mr-2" /> Play All
                </Button>
              </motion.div>

              <ScrollReveal>
                <div className="space-y-1">
                  {favTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying}
                      isCurrent={currentTrack?.id === track.id}
                      onPlay={(t) => playAll(favTracks, i)}
                      onAddToQueue={addToQueue}
                      onPlayNext={addToQueueNext}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite(track.id)}
                      index={i}
                    />
                  ))}
                </div>
              </ScrollReveal>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="font-display text-xl font-semibold text-muted-foreground">No favorites yet</h2>
              <p className="text-sm text-muted-foreground/70 mt-1">Heart songs to add them here</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
                <Button variant="outline" onClick={() => navigate('/home')}>
                  Discover Music
                </Button>
              </motion.div>
            </motion.div>
          )}
        </main>

        <AnimatePresence>
          {queueOpen && (
            <QueuePanel
              queue={queue}
              onClose={() => setQueueOpen(false)}
              onRemoveFromQueue={removeFromQueue}
              onReorderQueue={reorderQueue}
              onClearQueue={clearQueue}
              onPlayFromQueue={playFromQueue}
              currentTrack={currentTrack}
              isOpen={queueOpen}
            />
          )}
        </AnimatePresence>

        {currentTrack && (
          <Player
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            volume={volume}
            onTogglePlay={togglePlay}
            onSeek={seek}
            onVolumeChange={changeVolume}
            onNext={playNext}
            onToggleQueue={() => setQueueOpen(!queueOpen)}
            queueCount={queue.length}
            shuffle={shuffle}
            repeat={repeat}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
            onToggleFavorite={() => toggleFavorite(currentTrack.id)}
            isFavorite={isFavorite(currentTrack.id)}
          />
        )}
      </div>
    </>
  );
};

export default Favorites;
