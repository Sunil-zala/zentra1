import { Headphones } from 'lucide-react';

interface LogoProps {
  className?: string;
  /** show only the Z mark */
  markOnly?: boolean;
}

const Logo = ({ className = '', markOnly = false }: LogoProps) => (
  <span className={`inline-flex items-center gap-2 text-foreground ${className}`}>
    <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.25)]">
      <Headphones className="size-4" aria-hidden="true" />
    </span>
    {!markOnly && <span className="font-display text-xl font-black tracking-tight">Zentra</span>}
  </span>
);

export default Logo;
