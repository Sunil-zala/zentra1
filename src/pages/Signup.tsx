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

const signupSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signIn, isEmailRegistered } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    if (submitted) return;
    setSubmitted(true);
    setLoading(true);

    try {
      // Check if email already registered
      if (isEmailRegistered(data.email)) {
        setError('email', { type: 'manual', message: 'Email already registered.' });
        toast.error('Email already registered.');
        setLoading(false);
        setSubmitted(false);
        return;
      }

      if (!data.email.trim() || !data.password.trim()) {
        throw new Error('Please enter both email and password');
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create mock user and session objects
      const mockUser = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: data.email.trim(),
      };
      const mockSession = { user: mockUser };

      // Update auth context state immediately AND persist to sessionStorage
      signIn(mockUser, mockSession, false);

      toast.success('Account created! Welcome to Zentra');
      // Auto-login: go straight to home instead of making user log in again
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Can't reach the server. Check your connection and try again.";
      console.error('Signup failed:', err);
      toast.error(message);
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 text-foreground overflow-hidden"
      style={{ backgroundColor: '#0A0A0A', fontFamily: 'Montserrat, system-ui, sans-serif' }}
    >
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
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join Zentra and start listening</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl p-8 space-y-5 surface-panel"
          aria-label="Sign up form"
          noValidate
        >
          <div>
            <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Email
            </Label>
            <div className="relative">
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className="w-full rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border focus:border-primary/60 bg-[#121212] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
              />
              {errors.email && (
                <p id="signup-email-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                className="w-full rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border focus:border-primary/60 bg-[#121212] disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                disabled={loading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'signup-password-error' : undefined}
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
                <p id="signup-password-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="signup-confirm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="w-full rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border focus:border-primary/60 bg-[#121212] disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                disabled={loading}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 w-4" />}
              </button>
              {errors.confirmPassword && (
                <p id="signup-confirm-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || submitted}
            id="signup-submit-btn"
            className="w-full h-11 font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Global styles for autofill */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #121212 inset !important;
          box-shadow: 0 0 0 1000px #121212 inset !important;
          -webkit-text-fill-color: #e8e8e8 !important;
          caret-color: #e8e8e8 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input:-webkit-autofill::placeholder {
          color: #717171 !important;
        }
      `}</style>
    </div>
  );
}