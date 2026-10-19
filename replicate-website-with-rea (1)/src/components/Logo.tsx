export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span dir="ltr" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke={light ? "#d8c8ff" : "#480081"} strokeWidth="5" strokeDasharray="64 18" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4.5" fill={light ? "#ffffff" : "#8a4fd1"} />
      </svg>
      <span className={light ? "text-white" : "text-ink"}>
        loopt<span className={light ? "text-lime" : "text-brand"}>.</span>
      </span>
    </span>
  );
}
