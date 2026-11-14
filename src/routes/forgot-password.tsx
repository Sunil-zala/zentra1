import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "../pages/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password — Zentra" }, { name: "description", content: "Request a password reset for your Zentra account." }, { property: "og:title", content: "Reset your password — Zentra" }, { property: "og:description", content: "Request a password reset for your Zentra account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ForgotPassword,
});