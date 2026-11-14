import { createFileRoute } from "@tanstack/react-router";
import Index from "../pages/Index";

export const Route = createFileRoute("/_protected/")({
  head: () => ({
    meta: [
      { title: "Home — Zentra" },
      { name: "description", content: "Welcome to Zentra, your music discovery platform." },
    ],
  }),
  component: Index,
});
