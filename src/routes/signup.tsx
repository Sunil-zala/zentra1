import { createFileRoute } from "@tanstack/react-router";
import Signup from "../pages/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your Zentra account" }, { name: "description", content: "Create a Zentra account and start listening." }, { property: "og:title", content: "Create your Zentra account" }, { property: "og:description", content: "Create a Zentra account and start listening." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Signup,
});