import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";

const CDN = "https://images.unsplash.com";

const IMAGES = [
  {
    src: `${CDN}/photo-1511671782779-c97d3d27a1d4?w=900&h=506&fit=crop`,
    alt: "Concert stage with colorful lights",
  },
  {
    src: `${CDN}/photo-1493225457124-a3eb161ffa5f?w=900&h=506&fit=crop`,
    alt: "DJ performing at a festival",
  },
  {
    src: `${CDN}/photo-1459749411175-04bf5292ceea?w=900&h=506&fit=crop`,
    alt: "Vinyl record close-up",
  },
  {
    src: `${CDN}/photo-1470225620780-dba8ba36b745?w=900&h=506&fit=crop`,
    alt: "Live music performance with crowd",
  },
  {
    src: `${CDN}/photo-1540039155733-5bb30b53aa14?w=900&h=506&fit=crop`,
    alt: "Electric guitar under neon lights",
  },
];

export default function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero
      images={IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Your Music,
            <br />
            your universe.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          Discover, stream, and feel every beat. Images curve in from one edge,
          flatten out at the centre, then fade away round the other.
        </p>
      </div>
    </TiltedGridHero>
  );
}
