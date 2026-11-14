import { createFileRoute } from "@tanstack/react-router";
import Profile from "../pages/Profile";

export const Route = createFileRoute("/_protected/profile")({
  head: () => ({ meta: [{ title: "Profile — Zentra" }, { name: "description", content: "Manage your Zentra account." }, { property: "og:title", content: "Profile — Zentra" }, { property: "og:description", content: "Manage your Zentra account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Profile,
});