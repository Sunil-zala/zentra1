import { createFileRoute } from "@tanstack/react-router";
import NotFound from "../pages/NotFound";

export const Route = createFileRoute("/not-found")({
  head: () => ({ meta: [{ title: "Page not found — Zentra" }, { name: "description", content: "The requested Zentra page could not be found." }, { property: "og:title", content: "Page not found — Zentra" }, { property: "og:description", content: "The requested Zentra page could not be found." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: NotFound,
});