import { createFileRoute } from "@tanstack/react-router";
import Library from "../pages/Library";

export const Route = createFileRoute("/_protected/library")({
  head: () => ({ meta: [{ title: "Your library — Zentra" }, { name: "description", content: "Keep your playlists and saved music together in Zentra." }, { property: "og:title", content: "Your library — Zentra" }, { property: "og:description", content: "Keep your playlists and saved music together in Zentra." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Library,
});