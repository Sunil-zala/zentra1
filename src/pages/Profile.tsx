import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { LogOut, Mail, Calendar, Shield, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { toast } from 'sonner';

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '—';

  const initial = (user.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      <main className="container max-w-2xl px-4 py-10">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-8 glow-ring"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-display font-bold text-primary-foreground">
              {initial}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground text-sm">Manage your account</p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email ?? '—'} />
            <InfoRow icon={<UserIcon className="w-4 h-4" />} label="User ID" value={user.id} mono />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Member since" value={createdAt} />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Provider"
              value={user.app_metadata?.provider ?? 'email'}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/forgot-password')}
              className="flex-1"
            >
              Change password
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const InfoRow = ({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-border/30 last:border-0">
    <div className="flex items-center gap-2 text-muted-foreground text-sm shrink-0">
      {icon}
      {label}
    </div>
    <div className={`text-foreground text-sm text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
      {value}
    </div>
  </div>
);

export default Profile;
