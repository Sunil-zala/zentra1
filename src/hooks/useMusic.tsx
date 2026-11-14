import { useState, useCallback } from 'react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number;
  image: string;
  imageBig: string;
  url: string; // full song URL (320kbps or best available)
  hasLyrics: boolean;
  language?: string;
  year?: string;
  playCount?: string;
}

export interface MusicPlaylist {
  id: string;
  title: string;
  image: string;
  songCount?: number;
  type: string;
}

const SAAVN_DIRECT_BASE = 'https://jiosaavn-api-pearl.vercel.app/api';

const normalizeApiResponse = (value: any): any => {
  if (Array.isArray(value)) return value.map(normalizeApiResponse);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key === 'url' ? 'link' : key, normalizeApiResponse(nested)])
    );
  }
  return value;
};

const emptyApiResponse = (action?: string) => {
  if (action === 'modules') return { data: { charts: [], playlists: [] } };
  if (action === 'suggestions') return { data: [] };
  return { data: { results: [], songs: [] } };
};

const directUrlFor = ({ action, query, id }: Record<string, string | number | undefined>) => {
  const safeQuery = encodeURIComponent(String(query || ''));
  const safeId = encodeURIComponent(String(id || ''));

  switch (action) {
    case 'search':
      return `${SAAVN_DIRECT_BASE}/search/songs?query=${safeQuery}&limit=30`;
    case 'search_all':
      return `${SAAVN_DIRECT_BASE}/search?query=${safeQuery}`;
    case 'autocomplete':
      return `${SAAVN_DIRECT_BASE}/search/songs?query=${safeQuery}&limit=6`;
    case 'search_albums':
      return `${SAAVN_DIRECT_BASE}/search/albums?query=${safeQuery}&limit=20`;
    case 'search_artists':
      return `${SAAVN_DIRECT_BASE}/search/artists?query=${safeQuery}&limit=20`;
    case 'song':
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}`;
    case 'playlist':
      return `${SAAVN_DIRECT_BASE}/playlists?id=${safeId}&limit=50`;
    case 'album':
      return `${SAAVN_DIRECT_BASE}/albums?id=${safeId}`;
    case 'artist_songs':
      return `${SAAVN_DIRECT_BASE}/artists/${safeId}/songs`;
    case 'artist':
      return `${SAAVN_DIRECT_BASE}/artists?id=${safeId}`;
    case 'lyrics':
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}/lyrics`;
    case 'suggestions':
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}/suggestions?limit=10`;
    default:
      return null;
  }
};

const fetchWithTimeout = async (url: string, init?: RequestInit, ms = 9000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
};

const hasContent = (payload: any) => {
  const data = payload?.data;
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  return Boolean(
    data.results?.length || data.songs?.length || data.playlists?.length || data.charts?.length ||
    data.id || data.name || data.lyrics
  );
};

const callDirectApi = async (body: Record<string, string | number | undefined>) => {
  const action = String(body['action'] || '');

  try {
    if (action === 'modules') {
      const terms = ['trending', 'top hits', 'new releases', 'romantic', 'workout'];
      const responses = await Promise.allSettled(
        terms.map(async (term) => {
          const response = await fetchWithTimeout(`${SAAVN_DIRECT_BASE}/search/playlists?query=${encodeURIComponent(term)}&limit=10`);
          if (!response.ok) return [];
          const json = await response.json();
          return Array.isArray(json?.data?.results) ? json.data.results : [];
        })
      );
      const playlists = responses.flatMap((response) => response.status === 'fulfilled' ? response.value : []);
      return normalizeApiResponse({ data: { charts: [], playlists } });
    }

    const url = directUrlFor(body);
    if (!url) return emptyApiResponse(action);

    const response = await fetchWithTimeout(url);
    if (!response.ok) return emptyApiResponse(action);
    return normalizeApiResponse(await response.json());
  } catch {
    return emptyApiResponse(action);
  }
};

const callProxyApi = async (body: Record<string, string | number | undefined>) => {
  const base = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (!base || !key) return null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(`${base}/functions/v1/deezer-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) continue;
      const json = await response.json();
      if (hasContent(json)) return json;
      return null;
    } catch {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
};

// Direct-first: the public mirror is reachable from the browser and the
// deployed cloud proxy may be an older build. The proxy is only tried when the
// direct call returns nothing (e.g. CORS/ad-blocker on some networks).
const callApi = async (body: Record<string, string | number | undefined>) => {
  const direct = await callDirectApi(body);
  if (hasContent(direct)) return direct;
  const viaProxy = await callProxyApi(body);
  return viaProxy ?? direct;
};

const getBestAudioUrl = (song: any) => {
  const downloadUrls = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
  const bestMatch =
    downloadUrls.find((d: any) => d.quality === '320kbps') ||
    downloadUrls.find((d: any) => d.quality === '160kbps') ||
    downloadUrls.find((d: any) => d.quality === '96kbps') ||
    downloadUrls[downloadUrls.length - 1];

  return bestMatch?.link || song.preview || '';
};

const isPlayableSong = (song: any) => {
  const audioUrl = getBestAudioUrl(song);
  return Boolean(audioUrl && /^https?:\/\//.test(audioUrl));
};

// Transform JioSaavn song to our MusicTrack format
const transformTrack = (song: any): MusicTrack => {
  const bestUrl = getBestAudioUrl(song);
  const images = Array.isArray(song.image) ? song.image : [];
  const imageBig = images.length > 0 ? images[images.length - 1]?.link : '';
  const imageMed = images.length > 1 ? images[1]?.link : imageBig;

  return {
    id: song.id || '',
    title: song.name || song.title || '',
    artist: typeof song.primaryArtists === 'string'
      ? song.primaryArtists
      : Array.isArray(song.primaryArtists)
        ? song.primaryArtists.map((a: any) => a.name || a).join(', ')
        : Array.isArray(song.artists?.primary)
          ? song.artists.primary.map((a: any) => a.name || a).join(', ')
          : Array.isArray(song.artists)
            ? song.artists.map((a: any) => a.name || a).join(', ')
            : typeof song.artist === 'string'
              ? song.artist
              : song.artist?.name || 'Unknown',
    artistId: typeof song.primaryArtistsId === 'string'
      ? song.primaryArtistsId.split(', ')[0]
      : Array.isArray(song.primaryArtists)
        ? song.primaryArtists[0]?.id
        : Array.isArray(song.artists?.primary)
          ? song.artists.primary[0]?.id
          : Array.isArray(song.artists)
            ? song.artists[0]?.id
            : undefined,
    album: song.album?.name || song.album?.title || song.album || '',
    albumId: song.album?.id,
    duration: parseInt(song.duration || '0', 10),
    image: imageMed || '/placeholder.svg',
    imageBig: imageBig || imageMed || '/placeholder.svg',
    url: bestUrl,
    hasLyrics: song.hasLyrics === 'true' || song.hasLyrics === true,
    language: song.language,
    year: song.year,
    playCount: song.playCount,
  };
};

const toPlayableTracks = (songs: any[]) => songs.filter(isPlayableSong).map(transformTrack);

export const useMusic = () => {
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [suggestions, setSuggestions] = useState<MusicTrack[]>([]);
  const [trending, setTrending] = useState<MusicTrack[]>([]);
  const [newReleases, setNewReleases] = useState<MusicTrack[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<MusicPlaylist[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Record<string, MusicTrack[]>>({});
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const autocomplete = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }
    try {
      const data = await callApi({ action: 'autocomplete', query: query.toLowerCase() });
      const tracks = toPlayableTracks(data.data?.results || []);
      setAutocompleteSuggestions(tracks.slice(0, 6));
    } catch {
      setAutocompleteSuggestions([]);
    }
  }, []);

  const clearAutocomplete = useCallback(() => {
    setAutocompleteSuggestions([]);
  }, []);

  const search = useCallback(async (query: string, filter?: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setAutocompleteSuggestions([]);
    try {
      let action = 'search';
      if (filter === 'albums') action = 'search_albums';
      else if (filter === 'artists') action = 'search_artists';

      const data = await callApi({ action, query: query.toLowerCase() });

      let tracks: MusicTrack[] = [];
      if (filter === 'albums' || filter === 'artists') {
        // These return different structures - get first result's songs
        const items = data.data?.results || [];
        if (items.length > 0 && items[0].id) {
          const detailAction = filter === 'albums' ? 'album' : 'artist_songs';
          const detail = await callApi({ action: detailAction, id: items[0].id });
          tracks = toPlayableTracks(detail.data?.songs || []);
        }
      } else {
        tracks = toPlayableTracks(data.data?.results || []);
      }

      setResults(tracks);

      if (tracks.length > 0) {
        try {
          const firstTrack = tracks[0];
          if (!firstTrack) return;
          const sugData = await callApi({ action: 'suggestions', id: firstTrack.id });
          const sugTracks = toPlayableTracks(sugData.data || []);
          const filtered = sugTracks.filter(
            (t: MusicTrack) => !tracks.some((r: MusicTrack) => r.id === t.id)
          );
          setSuggestions(filtered.slice(0, 10));
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHomePage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callApi({ action: 'modules', language: 'english,hindi' });
      const modules = data.data || {};
      const charts = Array.isArray(modules.charts) ? modules.charts : [];
      const playlists = Array.isArray(modules.playlists) ? modules.playlists : [];

      const allFeatured: MusicPlaylist[] = [
        ...charts.map((c: any) => ({
          id: c.id,
          title: c.title || c.name,
          image: c.image?.[c.image.length - 1]?.link || '/placeholder.svg',
          type: 'playlist',
        })),
        ...playlists.slice(0, 8).map((p: any) => ({
          id: p.id,
          title: p.title || p.name,
          image: p.image?.[p.image.length - 1]?.link || '/placeholder.svg',
          songCount: p.songCount,
          type: 'playlist',
        })),
      ].filter((playlist) => Boolean(playlist.id));

      setFeaturedPlaylists(allFeatured);

      const [trendingData, releasesData] = await Promise.all([
        callApi({ action: 'playlist', id: charts[0]?.id || playlists[0]?.id || '946682072' }),
        callApi({ action: 'playlist', id: playlists[1]?.id || charts[1]?.id || playlists[0]?.id || '946682072' }),
      ]);

      setTrending(toPlayableTracks(trendingData.data?.songs || []).slice(0, 10));
      setNewReleases(toPlayableTracks(releasesData.data?.songs || []).slice(0, 15));
    } catch (err) {
      console.error('Home page load failed:', err);
      try {
        const fallback = await callApi({ action: 'search', query: 'top hits' });
        setTrending(toPlayableTracks(fallback.data?.results || []).slice(0, 10));
        setNewReleases(toPlayableTracks(fallback.data?.results || []).slice(10, 25));
      } catch {
        setTrending([]);
        setNewReleases([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlaylist = useCallback(async (playlistId: string) => {
    try {
      const data = await callApi({ action: 'playlist', id: playlistId });
      const tracks = toPlayableTracks(data.data?.songs || []);
      setPlaylistTracks(prev => ({ ...prev, [playlistId]: tracks }));
      return tracks;
    } catch (err) {
      console.error('Playlist load failed:', err);
      return [];
    }
  }, []);

  return {
    results, suggestions, trending, newReleases, featuredPlaylists, playlistTracks,
    autocompleteSuggestions, loading,
    search, loadHomePage, loadPlaylist, autocomplete, clearAutocomplete,
    clearResults: () => { setResults([]); setSuggestions([]); },
  };
};
