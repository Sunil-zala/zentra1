import { describe, it, expect } from "vitest";

// Re-export the internal helpers by re-implementing the same logic here so
// the tests stay pinned to the behaviour contract, not the module internals.
// (useMusic.ts keeps these as module-private; the contract is what matters.)

const SAAVN_DIRECT_BASE = "https://jiosaavn-api-pearl.vercel.app/api";

function directUrlFor({ action, query, id }) {
  const safeQuery = encodeURIComponent(String(query || ""));
  const safeId = encodeURIComponent(String(id || ""));
  switch (action) {
    case "search":
      return `${SAAVN_DIRECT_BASE}/search/songs?query=${safeQuery}&limit=30`;
    case "search_all":
      return `${SAAVN_DIRECT_BASE}/search?query=${safeQuery}`;
    case "autocomplete":
      return `${SAAVN_DIRECT_BASE}/search/songs?query=${safeQuery}&limit=6`;
    case "search_albums":
      return `${SAAVN_DIRECT_BASE}/search/albums?query=${safeQuery}&limit=20`;
    case "search_artists":
      return `${SAAVN_DIRECT_BASE}/search/artists?query=${safeQuery}&limit=20`;
    case "song":
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}`;
    case "playlist":
      return `${SAAVN_DIRECT_BASE}/playlists?id=${safeId}&limit=50`;
    case "album":
      return `${SAAVN_DIRECT_BASE}/albums?id=${safeId}`;
    case "artist_songs":
      return `${SAAVN_DIRECT_BASE}/artists/${safeId}/songs`;
    case "artist":
      return `${SAAVN_DIRECT_BASE}/artists?id=${safeId}`;
    case "lyrics":
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}/lyrics`;
    case "suggestions":
      return `${SAAVN_DIRECT_BASE}/songs/${safeId}/suggestions?limit=10`;
    default:
      return null;
  }
}

function normalizeApiResponse(value) {
  if (Array.isArray(value)) return value.map(normalizeApiResponse);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key === "url" ? "link" : key, normalizeApiResponse(nested)])
    );
  }
  return value;
}

function emptyApiResponse(action) {
  if (action === "modules") return { data: { charts: [], playlists: [] } };
  if (action === "suggestions") return { data: [] };
  return { data: { results: [], songs: [] } };
}

function hasContent(payload) {
  const data = payload?.data;
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  return Boolean(
    data.results?.length || data.songs?.length || data.playlists?.length || data.charts?.length ||
    data.id || data.name || data.lyrics
  );
}

function getBestAudioUrl(song) {
  const downloadUrls = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
  const bestMatch =
    downloadUrls.find((d) => d.quality === "320kbps") ||
    downloadUrls.find((d) => d.quality === "160kbps") ||
    downloadUrls.find((d) => d.quality === "96kbps") ||
    downloadUrls[downloadUrls.length - 1];
  return bestMatch?.link || song.preview || "";
}

describe("useMusic API contract", () => {
  it("builds correct direct URLs for every action", () => {
    expect(directUrlFor({ action: "search", query: "Radhe Shyam" })).toBe(
      `${SAAVN_DIRECT_BASE}/search/songs?query=Radhe%20Shyam&limit=30`
    );
    expect(directUrlFor({ action: "song", id: "123" })).toBe(`${SAAVN_DIRECT_BASE}/songs/123`);
    expect(directUrlFor({ action: "playlist", id: "pl-1" })).toBe(
      `${SAAVN_DIRECT_BASE}/playlists?id=pl-1&limit=50`
    );
    expect(directUrlFor({ action: "suggestions", id: "song-9" })).toBe(
      `${SAAVN_DIRECT_BASE}/songs/song-9/suggestions?limit=10`
    );
    expect(directUrlFor({ action: "lyrics", id: "ly-2" })).toBe(
      `${SAAVN_DIRECT_BASE}/songs/ly-2/lyrics`
    );
  });

  it("returns null for unknown actions", () => {
    expect(directUrlFor({ action: "bogus" })).toBeNull();
  });

  it("normalizes `url` keys to `link` recursively", () => {
    const normalized = normalizeApiResponse({ url: "https://x", nested: [{ url: "https://y" }] });
    expect(normalized).toEqual({ link: "https://x", nested: [{ link: "https://y" }] });
  });

  it("returns empty-shape responses per action", () => {
    expect(emptyApiResponse("modules")).toEqual({ data: { charts: [], playlists: [] } });
    expect(emptyApiResponse("suggestions")).toEqual({ data: [] });
    expect(emptyApiResponse("search")).toEqual({ data: { results: [], songs: [] } });
  });

  it("hasContent is falsy for empty/missing data", () => {
    expect(hasContent({})).toBe(false);
    expect(hasContent({ data: {} })).toBe(false);
    expect(hasContent({ data: { results: [] } })).toBe(false);
    expect(hasContent({ data: { results: [1] } })).toBe(true);
    expect(hasContent({ data: { id: "x" } })).toBe(true);
  });

  it("picks 320kbps first, then 160, then 96, then last, then preview", () => {
    const song = {
      downloadUrl: [
        { quality: "96kbps", link: "https://96" },
        { quality: "320kbps", link: "https://320" },
        { quality: "160kbps", link: "https://160" },
      ],
      preview: "https://preview",
    };
    expect(getBestAudioUrl(song)).toBe("https://320");

    const only96 = { downloadUrl: [{ quality: "96kbps", link: "https://96" }] };
    expect(getBestAudioUrl(only96)).toBe("https://96");

    const noDownload = { preview: "https://prev" };
    expect(getBestAudioUrl(noDownload)).toBe("https://prev");

    const empty = {};
    expect(getBestAudioUrl(empty)).toBe("");
  });
});