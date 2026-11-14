import { createFileRoute } from "@tanstack/react-router";
import Favorites from "../pages/Favorites";

export const Route = createFileRoute("/_protected/favorites")({
  head: () => ({ meta: [{ title: "Liked songs — Zentra" }, { name: "description", content: "Revisit the music you love in Zentra." }, { property: "og:title", content: "Liked songs — Zentra" }, { property: "og:description", content: "Revisit the music you love in Zentra." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Favorites,
});