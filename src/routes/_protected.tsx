import { createFileRoute } from "@tanstack/react-router";
import ProtectedLayout from "../components/ProtectedLayout";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});