import { createFileRoute } from "@tanstack/react-router";
import Search from "../pages/Search";

export const Route = createFileRoute("/_protected/search")({
  head: () => ({ meta: [{ title: "Search music — Zentra" }, { name: "description", content: "Find songs, artists, and playlists on Zentra." }, { property: "og:title", content: "Search music — Zentra" }, { property: "og:description", content: "Find songs, artists, and playlists on Zentra." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Search,
});