import { nativeModule } from "@ardia/shell";
import type { ScreenshotStroke, ScreenshotImage } from "@ardia/shell";
const app = nativeModule("ArdiaApp");
export type { ScreenshotStroke, ScreenshotImage };
export const renderScreenshot = (data: string, crop: number[] | null = null, strokes: ScreenshotStroke[] = []) => app.renderScreenshot(data, crop, strokes);
export const stitchScreenshots = (tiles: { data: string; y: number }[], width: number, height: number) => app.stitchScreenshots(tiles, width, height);
export const exportScreenshot = (data: string, strokes: ScreenshotStroke[], output: "png" | "pdf" | "clipboard", windowId: string) => app.exportScreenshot(data, strokes, output, windowId);
