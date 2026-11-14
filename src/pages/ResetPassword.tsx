import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    // Mock: simulate updating the password
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Password updated! You can now sign in.');
    setLoading(false);
    navigate('/login');
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
            <h1 className="text-3xl font-black tracking-tight text-foreground">Set new password</h1>
            <p className="text-muted-foreground mt-2 text-sm">Choose a new password for your account</p>
          </div>

          <form onSubmit={handleUpdate} className="surface-panel rounded-2xl p-8 space-y-5">
            <div>
              <label htmlFor="reset-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="reset-confirm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Confirm password
              </label>
              <input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-3 rounded-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
