/** Initials + a deterministic colour for a name — the person-avatar look used
 * by entity cells, cards and the avatar select. */

const SWATCHES = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
  { bg: "#5B4A3A", fg: "#F5E3CF" },
  { bg: "#3A5B4A", fg: "#CFF5E3" },
] as const;

export interface AvatarSwatch {
  bg: string;
  fg: string;
}

/** Up to two uppercase initials from a name. */
export function initialsOf(name: string) {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** A stable swatch for a seed string, so the same name always gets one colour. */
export function avatarSwatch(seed: string): AvatarSwatch {
  let hash = 0;
  for (const char of seed ?? "") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SWATCHES[hash % SWATCHES.length] ?? SWATCHES[0];
}
