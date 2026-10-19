/**
 * Isolated product photo on a backdrop that matches the store's palette.
 *  studio — lavender cyclorama with a purple glow, halo ring and lit floor
 *  mini   — flat lavender chip for small thumbnails
 *  none   — transparent, for products placed on a dark section
 */
type Stage = "studio" | "mini" | "none";

const STUDIO_BG = "radial-gradient(118% 96% at 50% 4%, #ffffff 0%, #f4f3fd 42%, #e6e6f9 100%)";
const GLOW_BG = "radial-gradient(56% 50% at 50% 40%, rgba(72,0,129,0.17), rgba(72,0,129,0) 72%)";
const FLOOR_BG = "linear-gradient(to top, rgba(138,79,209,0.20), rgba(216,200,255,0.05) 55%, rgba(216,200,255,0) 100%)";

export default function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
  stage = "studio",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  stage?: Stage;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={800}
      height={800}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="relative h-full w-full object-contain object-center"
      draggable={false}
    />
  );

  if (stage === "none") return <div className={className}>{img}</div>;

  if (stage === "mini")
    return (
      <div className={`overflow-hidden rounded-xl bg-soft ${className}`}>{img}</div>
    );

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ background: STUDIO_BG }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: GLOW_BG }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-[54%] rounded-full border border-[#c9b3f0]/60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[52%] -translate-x-1/2 -translate-y-[54%] rounded-full border border-[#c9b3f0]/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]" style={{ background: FLOOR_BG }} />
      {img}
    </div>
  );
}
