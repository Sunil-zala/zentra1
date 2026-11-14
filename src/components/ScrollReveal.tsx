import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  once?: boolean;
}

const directionMap = {
  up: { y: 60, x: 0 },
  down: { y: -60, x: 0 },
  left: { y: 0, x: 60 },
  right: { y: 0, x: -60 },
};

const ScrollReveal = ({ children, direction = 'up', delay = 0, className = '', once = true }: ScrollRevealProps) => {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ once });
  const offset = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
