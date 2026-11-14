import { MusicPlaylist } from '@/hooks/useMusic';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCallback } from 'react';
import { Music } from 'lucide-react';

interface PlaylistCardProps {
  playlist: MusicPlaylist;
  onClick: (playlist: MusicPlaylist) => void;
  index: number;
}

const PlaylistCard = ({ playlist, onClick, index }: PlaylistCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [6, -6]);
  const rotateY = useTransform(x, [-100, 100], [-6, 6]);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(playlist)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square glow-ring shimmer"
    >
      {/* Image zoomed in to crop out corner logos */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={playlist.image || '/placeholder.svg'}
          alt={playlist.title}
          className="w-[130%] h-[130%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {/* Full overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
      {/* Icon badge */}
      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-background/60 backdrop-blur-sm">
        <Music className="w-3 h-3 text-primary" />
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4"
        initial={{ y: 10, opacity: 0.8 }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        <h3 className="font-display font-bold text-sm text-foreground leading-tight">{playlist.title}</h3>
        {playlist.songCount && (
          <p className="text-xs text-muted-foreground mt-1">{playlist.songCount} songs</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PlaylistCard;
