import { useState, useCallback } from 'react';
import { MusicTrack } from './useMusic';
import { useAuth } from './useAuth';

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  trackCount: number;
  tracks: MusicTrack[];
}

// In-memory store (persisted to localStorage per user)
function getStorageKey(userId: string) {
  return `zentra-playlists-${userId}`;
}

function loadPlaylists(userId: string): UserPlaylist[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? (JSON.parse(raw) as UserPlaylist[]) : [];
  } catch {
    return [];
  }
}

function savePlaylists(userId: string, playlists: UserPlaylist[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(playlists));
  } catch {
    // ignore storage errors
  }
}

export const useUserPlaylists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>(() =>
    user ? loadPlaylists(user.id) : [],
  );
  const [loading] = useState(false);

  const persist = useCallback(
    (updated: UserPlaylist[]) => {
      if (user) savePlaylists(user.id, updated);
      setPlaylists(updated);
    },
    [user],
  );

  const createPlaylist = useCallback(
    async (name: string, description = '') => {
      if (!user) return null;
      const newPlaylist: UserPlaylist = {
        id: 'playlist-' + Math.random().toString(36).substr(2, 9),
        name,
        description,
        image_url: '',
        created_at: new Date().toISOString(),
        trackCount: 0,
        tracks: [],
      };
      const updated = [newPlaylist, ...loadPlaylists(user.id)];
      persist(updated);
      return newPlaylist;
    },
    [user, persist],
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      if (!user) return;
      const updated = loadPlaylists(user.id).filter((p) => p.id !== playlistId);
      persist(updated);
    },
    [user, persist],
  );

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: MusicTrack) => {
      if (!user) return;
      const all = loadPlaylists(user.id);
      const updated = all.map((p) => {
        if (p.id !== playlistId) return p;
        const alreadyAdded = p.tracks.some((t) => t.id === track.id);
        if (alreadyAdded) return p;
        const newTracks = [...p.tracks, track];
        return { ...p, tracks: newTracks, trackCount: newTracks.length };
      });
      persist(updated);
    },
    [user, persist],
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      if (!user) return;
      const all = loadPlaylists(user.id);
      const updated = all.map((p) => {
        if (p.id !== playlistId) return p;
        const newTracks = p.tracks.filter((t) => t.id !== trackId);
        return { ...p, tracks: newTracks, trackCount: newTracks.length };
      });
      persist(updated);
    },
    [user, persist],
  );

  const getPlaylistTracks = useCallback(
    async (playlistId: string): Promise<MusicTrack[]> => {
      if (!user) return [];
      const all = loadPlaylists(user.id);
      return all.find((p) => p.id === playlistId)?.tracks ?? [];
    },
    [user],
  );

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    setPlaylists(loadPlaylists(user.id));
  }, [user]);

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylistTracks,
    fetchPlaylists,
  };
};
