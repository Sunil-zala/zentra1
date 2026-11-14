import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from '@/lib/navigation';
import { Home, Search, Library, Heart, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import Player from '@/components/Player';
import QueuePanel from '@/components/QueuePanel';
import NowPlayingSide from '@/components/NowPlayingSide';
import DynamicBackground from '@/components/DynamicBackground';
import { usePlayer } from '@/hooks/usePlayerContext';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/library', label: 'Your Library', icon: Library, end: false },
];

const AppLayout = ({ page }: { page?: ReactNode }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    currentTrack, isPlaying, progress, duration, volume, queue,
    togglePlay, seek, changeVolume, playNext, playPrevious, skipBy,
    removeFromQueue, reorderQueue, clearQueue, playFromQueue,
    shuffle, repeat, toggleShuffle, toggleRepeat, toggleFavorite, isFavorite,
  } = usePlayer();

  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  };

  const initial = (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground track={currentTrack} />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[260px] flex-col bg-sidebar border-r border-sidebar-border z-40">
        <div className="px-6 py-7">
          <button onClick={() => navigate('/')} className="flex items-center" aria-label="Zentra home">
            <Logo className="h-8 w-auto" />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 pb-6">
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60'
              }`
            }
          >
            <Heart className="w-5 h-5" />
            Liked Songs
          </NavLink>
        </div>
      </aside>

      {/* Content column */}
      <div className="md:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 h-16 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <button onClick={() => navigate('/')} className="md:hidden flex items-center" aria-label="Zentra home">
            <Logo className="h-7 w-auto" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Notifications"
              onClick={() => toast('You are all caught up.')}
            >
              <Bell className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-9 h-9 rounded-full gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center"
                  aria-label="Account menu"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/favorites')}>
                  <Heart className="w-4 h-4 mr-2" /> Liked Songs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative z-10 px-4 md:px-8 pt-6 pb-44 md:pb-32 max-w-[1500px]">
          {page ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border h-16">
        {[...navItems, { to: '/favorites', label: 'Liked', icon: Heart, end: false }].map(
          ({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${
                  isActive ? 'text-primary' : 'text-sidebar-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          )
        )}
      </nav>

      {/* Persistent player */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40">
        <Player
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          queueCount={queue.length}
          shuffle={shuffle}
          repeat={repeat}
          isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onVolumeChange={changeVolume}
          onNext={playNext}
          onPrevious={playPrevious}
          onToggleQueue={() => setQueueOpen((o) => !o)}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id, currentTrack)}
          onOpenNowPlaying={() => setNowPlayingOpen(true)}
        />
      </div>

      <NowPlayingSide
        track={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        queueLength={queue.length}
        shuffle={shuffle}
        repeat={repeat}
        isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
        open={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        onTogglePlay={togglePlay}
        onNext={playNext}
        onPrevious={playPrevious}
        onSeek={seek}
        onSkipBy={skipBy}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id, currentTrack)}
        onOpenQueue={() => setQueueOpen(true)}
      />

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
    </div>
  );
};

export default AppLayout;
