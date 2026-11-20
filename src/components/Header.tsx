import { Headphones, LogOut, Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 glass border-b border-border/30"
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <span className="font-black text-xl tracking-[0.08em] text-foreground">
            ZENTRA
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/favorites')}
                className="text-muted-foreground hover:text-primary"
              >
                <Heart className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Favorites</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-muted-foreground hover:text-primary"
              >
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline max-w-[140px] truncate">{user.email}</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
