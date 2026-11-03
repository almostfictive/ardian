import { duration } from "../ui/motion";

export const GLYPH = 13;

export const CHROME_BUTTON = { box: 28, glyph: 16, radius: 8 } as const;
export const TOOLBAR_FADE = { inputRange: [0, 1] as [number, number], outputRange: [1, 0] as [number, number] } as const;

export const ADDRESS_BAR = {
  height: 40,
  radius: 8,
  inset: 2,
  button: 28,
  buttonOffset: 14,
  utilityRight: 6,
  utilityGap: 2,
  utilityTextRoom: 158,
  lockInset: 8,
  lockSize: 11,
  pathGap: 6,
  fill: { dark: "rgba(255,255,255,0.03)", light: "rgba(0,0,0,0.025)" },
  border: { dark: "rgba(255,255,255,0.2)", light: "rgba(0,0,0,0.16)" },
  shadow: { color: "#3B2F25", opacity: 0.08, radius: 20, offset: [0, 6] as [number, number] },
};

export const TOOLBAR_MOTION = { dim: duration.base, progress: duration.base, hide: 200, show: 200, settle: 0 } as const;

export const ADDRESS_BAR_PALETTE = { background: null, text: "#3A342E", secondary: "rgba(58,52,46,0.72)", icon: "rgba(58,52,46,0.85)", iconDisabled: "rgba(58,52,46,0.35)", hover: "rgba(58,52,46,0.06)", pressed: "rgba(58,52,46,0.14)", pill: "rgba(58,52,46,0.04)", divider: "rgba(58,52,46,0.08)" } as const;
