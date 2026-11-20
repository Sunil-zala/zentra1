import { createFileRoute } from "@tanstack/react-router";
import Landing from "../pages/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zentra — Your Music Universe" },
      { name: "description", content: "Discover, stream, and feel every beat. Your music universe awaits." },
      { property: "og:title", content: "Zentra — Your Music Universe" },
      { property: "og:description", content: "Discover, stream, and feel every beat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});
