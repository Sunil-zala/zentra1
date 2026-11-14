import { useState, useRef, useEffect, useCallback } from 'react';
import { MusicTrack } from './useMusic';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [favorites, setFavorites] = useState<Map<string, MusicTrack>>(() => {
    if (typeof window === 'undefined') return new Map();
    try {
      const saved = localStorage.getItem('zentra-favorites-v2');
      if (saved) {
        const entries: [string, MusicTrack][] = JSON.parse(saved);
        return new Map(entries);
      }
      // Migrate from old format (Set of IDs) — keep IDs but no track data
      const oldSaved = localStorage.getItem('zentra-favorites');
      if (oldSaved) {
        const ids: string[] = JSON.parse(oldSaved);
        return new Map(ids.map(id => [id, { id, title: 'Unknown', artist: 'Unknown', album: '', duration: 0, image: '/placeholder.svg', imageBig: '/placeholder.svg', url: '', hasLyrics: false } as MusicTrack]));
      }
      return new Map();
    } catch { return new Map(); }
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicTrack[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('zentra-recently-played') || '[]');
    } catch { return []; }
  });
  const allTracksRef = useRef<MusicTrack[]>([]);

  const playTrackInternal = useCallback((track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.url;
    audio.play().catch(console.error);
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);

    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const next = [track, ...filtered].slice(0, 10);
      localStorage.setItem('zentra-recently-played', JSON.stringify(next));
      return next;
    });

    // Media Session API for background/lock-screen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: typeof track.artist === 'string' ? track.artist : 'Unknown',
        album: typeof track.album === 'string' ? track.album : '',
        artwork: [
          { src: track.image, sizes: '150x150', type: 'image/jpeg' },
          { src: track.imageBig, sizes: '500x500', type: 'image/jpeg' },
        ],
      });
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
      // Update position state for media session
      if ('mediaSession' in navigator && !isNaN(audio.duration)) {
        navigator.mediaSession.setPositionState?.({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('ended', () => {
      // Repeat one: replay same track
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      setQueue(prev => {
        if (prev.length > 0) {
          const idx = shuffle ? Math.floor(Math.random() * prev.length) : 0;
          const track = prev[idx];
          if (!track) return prev;
          const newQueue = prev.filter((_, i) => i !== idx);
          playTrackInternal(track);
          return newQueue;
        }
        // Repeat all: refill queue from allTracksRef
        if (repeat === 'all' && allTracksRef.current.length > 0) {
          const tracks = shuffle
            ? [...allTracksRef.current].sort(() => Math.random() - 0.5)
            : allTracksRef.current;
          const [next, ...rest] = tracks;
          if (!next) return prev;
          playTrackInternal(next);
          return rest;
        }
        setIsPlaying(false);
        setProgress(0);
        return prev;
      });
    });
    audio.addEventListener('pause', () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });
    audio.addEventListener('play', () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    // Media Session action handlers for background control
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        audio.play().catch(console.error);
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          audio.currentTime = details.seekTime;
          setProgress(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        setQueue(prev => {
          if (prev.length > 0) {
            const [next, ...rest] = prev;
            if (!next) return prev;
            playTrackInternal(next);
            return rest;
          }
          return prev;
        });
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    playTrackInternal(track);
  }, [currentTrack, isPlaying, playTrackInternal]);

  const playAll = useCallback((tracks: MusicTrack[], startIndex = 0) => {
    if (tracks.length === 0) return;
    // Keep reference for repeat-all, but DO NOT auto-fill the queue.
    // The queue should only contain tracks the user explicitly added.
    allTracksRef.current = tracks;
    const startTrack = tracks[startIndex];
    if (startTrack) playTrackInternal(startTrack);
  }, [playTrackInternal]);

  const addToQueue = useCallback((track: MusicTrack) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const addToQueueNext = useCallback((track: MusicTrack) => {
    setQueue(prev => [track, ...prev]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      if (!moved) return prev;
      newQueue.splice(toIndex, 0, moved);
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      if (index >= 0 && index < prev.length) {
        const track = prev[index];
        if (!track) return prev;
        const newQueue = prev.filter((_, i) => i !== index);
        playTrackInternal(track);
        return newQueue;
      }
      return prev;
    });
  }, [playTrackInternal]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
  }, []);

  const playNext = useCallback(() => {
    setQueue(prev => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        if (!next) return prev;
        playTrackInternal(next);
        return rest;
      }
      return prev;
    });
  }, [playTrackInternal]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // If more than 3s in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }
    // Otherwise play previous from recently played (index 1, since 0 is current)
    if (recentlyPlayed.length > 1) {
      const previousTrack = recentlyPlayed[1];
      if (previousTrack) playTrackInternal(previousTrack);
    } else {
      audio.currentTime = 0;
      setProgress(0);
    }
  }, [recentlyPlayed, playTrackInternal]);

  const skipBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    const next = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
    audio.currentTime = next;
    setProgress(next);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const toggleRepeat = useCallback(() => {
    setRepeat(p => p === 'off' ? 'all' : p === 'all' ? 'one' : 'off');
  }, []);

  const toggleFavorite = useCallback((trackId: string, track?: MusicTrack) => {
    setFavorites(prev => {
      const next = new Map(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        // Try to use provided track, or currentTrack, or a stub
        const trackData = track || (currentTrack?.id === trackId ? currentTrack : null) || { id: trackId, title: 'Unknown', artist: 'Unknown', album: '', duration: 0, image: '/placeholder.svg', imageBig: '/placeholder.svg', url: '', hasLyrics: false } as MusicTrack;
        next.set(trackId, trackData);
      }
      localStorage.setItem('zentra-favorites-v2', JSON.stringify([...next.entries()]));
      return next;
    });
  }, [currentTrack]);

  const isFavorite = useCallback((trackId: string) => favorites.has(trackId), [favorites]);

  const getFavoriteTracks = useCallback(() => Array.from(favorites.values()), [favorites]);

  return {
    currentTrack, isPlaying, progress, duration, volume, queue,
    shuffle, repeat, favorites, recentlyPlayed,
    play, playAll, togglePlay, seek, changeVolume, playNext, playPrevious, skipBy,
    addToQueue, addToQueueNext, removeFromQueue, reorderQueue, clearQueue, playFromQueue,
    toggleShuffle, toggleRepeat, toggleFavorite, isFavorite, getFavoriteTracks,
  };
};
