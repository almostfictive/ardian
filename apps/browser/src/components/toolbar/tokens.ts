export const GLYPH = 13;

export const TOOLBAR_MOTION = { dim: 160, progress: 200, hide: 150, show: 200, settle: 0 } as const;

// Floating toolbar pill, glass only. Side gap matches CARD_INSET (9) and
// radius matches cardRadius (10); top/bottom gap is 3 so the 22px compact
// field (top 3, bottom 25 in a 28px row) still fits inside the pill.
export const TOOLBAR_PILL = { top: 3, side: 9, bottom: 3, radius: 10 } as const;
