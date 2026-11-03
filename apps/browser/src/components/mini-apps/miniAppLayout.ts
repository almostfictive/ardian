export const miniAppRows = (count: number) => Array.from({ length: Math.ceil(count / 4) }, (_, row) => Array.from({ length: Math.min(4, count - row * 4) }, (_, column) => row * 4 + column));
export const miniAppBoxWidth = (availableWidth: number, count: number, gap = 0) => (availableWidth - gap * (Math.min(count, 4) - 1)) / Math.min(count, 4);
export const miniAppBoxHeight = (height: number) => Math.min(height, 32);
