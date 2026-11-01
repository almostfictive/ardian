import { duration } from "../ui/motion";

export const GLYPH = 13;

export const TOOLBAR_MOTION = { dim: duration.base, progress: duration.base, hide: duration.base, show: duration.base, settle: 0 } as const;

import { radius, space } from "../ui/tokens";

export const TOOLBAR_PILL = { top: space.xs, side: space.ml, bottom: space.xs, radius: radius.chrome } as const;
