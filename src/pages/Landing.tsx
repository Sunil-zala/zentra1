import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from '@/lib/navigation';
import ZentraHero from '@/components/ZentraHero';

/**
 * Public landing page.
 * - Authenticated users are redirected straight to /home (the dashboard).
 * - Guests see the immersive 3-D hero; clicking a cover or "Sign in" opens
 *   the login page, and "Start listening" opens sign-up.
 */
export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // While auth is initialising, render nothing (avoids a flash of the hero
  // for users who are already signed in).
  if (loading) return null;

  // Already signed in → go to the app dashboard.
  if (user) return <Navigate to="/home" replace />;

  return (
    <ZentraHero
      onSignIn={() => navigate('/login')}
      onSignUp={() => navigate('/signup')}
    />
  );
}
