import { useEffect, useState } from 'react';
import { MusicTrack } from '@/hooks/useMusic';
import { useIsMobile } from '@/hooks/use-mobile';

const extractColor = (img: HTMLImageElement): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'hsl(141, 73%, 42%)';

  canvas.width = 8;
  canvas.height = 8;
  ctx.drawImage(img, 0, 0, 8, 8);

  const data = ctx.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0, count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i] ?? 0;
    const green = data[i + 1] ?? 0;
    const blue = data[i + 2] ?? 0;
    const brightness = (red + green + blue) / 3;
    if (brightness > 30 && brightness < 230) {
      r += red;
      g += green;
      b += blue;
      count++;
    }
  }

  if (count === 0) return 'hsl(141, 73%, 42%)';
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `rgb(${r}, ${g}, ${b})`;
};

interface DynamicBackgroundProps {
  track: MusicTrack | null;
}

const DynamicBackground = ({ track }: DynamicBackgroundProps) => {
  const [color, setColor] = useState('hsl(141, 73%, 42%)');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!track?.image || isMobile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        setColor(extractColor(img));
      } catch {
        // CORS or other error
      }
    };
    img.src = track.image;
  }, [track?.image, isMobile]);

  // Skip entirely on mobile for performance
  if (isMobile || !track) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${color}, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default DynamicBackground;
