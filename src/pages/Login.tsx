import { useState } from 'react';
import { Link, useNavigate } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Music-themed Unsplash images for the hero band
const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&h=506&fit=crop',
    alt: 'Concert stage with colorful lights',
  },
  {
    src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&h=506&fit=crop',
    alt: 'DJ performing at a festival',
  },
  {
    src: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&h=506&fit=crop',
    alt: 'Vinyl record close-up',
  },
  {
    src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&h=506&fit=crop',
    alt: 'Live music performance with crowd',
  },
  {
    src: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&h=506&fit=crop',
    alt: 'Electric guitar under neon lights',
  },
  {
    src: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=900&h=506&fit=crop',
    alt: 'Musician playing piano on stage',
  },
  {
    src: 'https://images.unsplash.com/photo-1501386761578-eaa54b04b658?w=900&h=506&fit=crop',
    alt: 'Festival crowd raising hands',
  },
  {
    src: 'https://images.unsplash.com/photo-1486591038970-fb2b93e3e5fd?w=900&h=506&fit=crop',
    alt: 'Headphones on a wooden surface',
  },
  {
    src: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900&h=506&fit=crop',
    alt: 'Music equalizer sound waves',
  },
  {
    src: 'https://images.unsplash.com/photo-1468164016595-6108e4c60c8b?w=900&h=506&fit=crop',
    alt: 'Drummer performing on stage',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, verifyCredentials, getReturnTo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    if (submitted) return;
    setSubmitted(true);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { user, error } = verifyCredentials(data.email, data.password);

      if (error || !user) {
        setError('password', { type: 'manual', message: error || 'Wrong email or password.' });
        toast.error(error || 'Wrong email or password.');
        setLoading(false);
        setSubmitted(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSession = { user } as any;
      signIn(user, mockSession, data.rememberMe ?? false);

      toast.success('Signed in successfully!');

      const returnTo = getReturnTo();
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Can't reach the server. Check your connection.";
      toast.error(message);
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex text-foreground overflow-hidden"
      style={{ backgroundColor: '#0A0A0A', fontFamily: 'Montserrat, system-ui, sans-serif' }}
    >
      {/* ── LEFT PANEL: Hero band ───────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative">
        <TiltedGridHero
          images={HERO_IMAGES}
          speed={5}
          tileHeight={28}
          aspectRatio={16 / 9}
          gap={5}
          axis={52}
          curve={72}
          fade={14}
          className="absolute inset-0 w-full h-full"
        >
          {/* Overlay gradient so text is readable */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, transparent 60%, #0A0A0A 100%), radial-gradient(ellipse 100% 100% at 40% 50%, hsl(142 95% 42% / 0.08) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          {/* Brand overlay */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative z-20 flex flex-col justify-end h-full pb-16 pl-14 pr-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">
              Welcome to
            </p>
            <h2 className="text-5xl xl:text-6xl font-black tracking-tight text-foreground leading-none mb-4">
              ZENTRA
            </h2>
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Discover, stream, and feel every beat. Your music universe awaits.
            </p>
          </motion.div>
        </TiltedGridHero>
      </div>

      {/* ── RIGHT PANEL: Login form ─────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center w-full lg:w-[460px] xl:w-[520px] flex-shrink-0 px-6 py-12">
        {/* Subtle vignette overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 85% 65% at 50% 40%, transparent 25%, hsl(0 0% 4% / 0.6) 70%, hsl(0 0% 4%) 100%)',
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-2xl font-black tracking-[0.08em] text-foreground block mb-3">
              ZENTRA
            </span>
            <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to access your music</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl p-8 space-y-5 surface-panel"
            aria-label="Sign in form"
            noValidate
          >
            <div>
              <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border focus:border-primary/60 bg-[#121212] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border focus:border-primary/60 bg-[#121212] disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                  disabled={loading}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  {...register('rememberMe')}
                  className="accent-primary w-3.5 h-3.5 rounded border-border focus:ring-primary focus:ring-offset-0 focus:ring-offset-background"
                  disabled={loading}
                />
                Remember me
              </Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading || submitted}
              id="login-submit-btn"
              className="w-full h-11 font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
