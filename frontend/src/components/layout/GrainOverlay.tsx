/**
 * Fixed, non-interactive film-grain layer that gives the whole app a subtle "paper"
 * texture (docs/00 §6). It sits on a fixed pointer-events-none element so it never
 * touches scroll performance (per the design-skill performance guardrails).
 */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-multiply"
      style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: '140px 140px' }}
    />
  );
}
