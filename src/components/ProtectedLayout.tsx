import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useLocation } from "../lib/navigation";
import { MusicProvider } from "../hooks/useMusicContext";
import { PlayerProvider } from "../hooks/usePlayerContext";
import AppLayout from "./layout/AppLayout";

const ProtectedLayout = ({ page }: { page?: ReactNode }) => {
  const { user, loading, setReturnTo } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setReturnTo(location.pathname + (location.search || ''));
    }
  }, [loading, user, location.pathname, location.search, setReturnTo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MusicProvider>
      <PlayerProvider>
        <AppLayout page={page} />
      </PlayerProvider>
    </MusicProvider>
  );
};

export default ProtectedLayout;