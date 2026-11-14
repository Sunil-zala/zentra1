import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "../pages/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password — Zentra" }, { name: "description", content: "Choose a new password for your Zentra account." }, { property: "og:title", content: "Choose a new password — Zentra" }, { property: "og:description", content: "Choose a new password for your Zentra account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ResetPassword,
});