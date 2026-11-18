/**
 * Placeholder unit conversion — the real units system (AMO/ASTM conventions,
 * rig-aware physical deflection) lands in Phase 1 T2 per
 * runsheets/02-units-conventions.md. Exactly one trivial conversion, no more.
 */

/** Convert inches to millimetres (1 in = 25.4 mm, exact by definition). */
export function inToMm(inches: number): number {
  return inches * 25.4;
}
