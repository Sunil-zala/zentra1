import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    // Mock: simulate sending a password reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSent(true);
    toast.success('Password reset link sent! Check your email.');
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <span className="text-2xl font-black tracking-[0.08em] text-foreground block mb-3">
              ZENTRA
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Reset password</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {sent ? (
            <div className="surface-panel rounded-2xl p-8 text-center space-y-4">
              <p className="text-foreground">
                Check your inbox at <span className="font-medium">{email}</span> for a password reset link.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="surface-panel rounded-2xl p-8 space-y-5">
              <div>
                <label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 rounded-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
