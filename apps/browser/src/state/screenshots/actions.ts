import { create } from "zustand";
import { webviews } from "../../platform/webviews";
import { renderScreenshot, exportScreenshot, type ScreenshotImage, type ScreenshotStroke } from "../../platform/screenshots";
import { useBrowser } from "../browser/store";
import { fullPageCapture } from "./fullPageCapture";
import { showToast } from "../app/toasts";

export type CaptureMode = "visible" | "selected" | "fullPage";
type Capture = { id: number; tabId: string; windowId: string; phase: "menu" | "capturing" | "flash" | "selection" | "editor"; image?: ScreenshotImage; progress?: string; error?: string; strokes: ScreenshotStroke[] };
export const useScreenshot = create<{ capture: Capture | null }>()(() => ({ capture: null }));
let sequence = 0;
let inFlight = false;
let stopWatching: (() => void) | undefined;
export const closeScreenshot = () => { stopWatching?.(); stopWatching = undefined; useScreenshot.setState({ capture: null }); };
export const screenshotCurrent = (id: number) => useScreenshot.getState().capture?.id === id;
export const updateCapture = (id: number, patch: Partial<Capture>) => useScreenshot.setState((s) => s.capture?.id === id ? { capture: { ...s.capture, ...patch } } : {});
export async function captureScreenshot(tabId: string): Promise<void> {
  if (inFlight) return;
  const tab = useBrowser.getState().tabs[tabId];
  if (!tab?.url || !webviews.has(tabId)) return;
  closeScreenshot();
  stopWatching = useBrowser.subscribe(watchCapture);
  useScreenshot.setState({ capture: { id: ++sequence, tabId, windowId: tab.windowId, phase: "menu", strokes: [] } });
}
export async function chooseCapture(mode: CaptureMode) {
  const capture = useScreenshot.getState().capture;
  if (!capture || capture.phase !== "menu" || inFlight) return;
  const { id, tabId } = capture;
  const web = webviews.get(tabId);
  if (!web) return closeScreenshot();
  inFlight = true;
  updateCapture(id, { phase: "capturing", progress: "Preparing capture…" });
  try {
    const image = mode === "fullPage" ? await fullPageCapture(web, (progress) => updateCapture(id, { progress }), () => screenshotCurrent(id)) : await web.capturePicture(1).then((picture) => {
      if (!picture) throw new Error("Couldn't capture this page. Make it visible and try again.");
      return renderScreenshot(picture.data);
    });
    if (screenshotCurrent(id)) {
      updateCapture(id, { image, phase: mode === "selected" ? "selection" : mode === "visible" ? "flash" : "editor", progress: undefined });
      if (mode === "visible") {
        await new Promise<void>((resolve) => setTimeout(resolve, 160));
        updateCapture(id, { phase: "editor" });
      }
    }
  } catch (error) {
    updateCapture(id, { phase: "menu", error: (error as Error).message, progress: undefined });
  } finally { inFlight = false; }
}
export async function captureSelection(crop: number[]) {
  const capture = useScreenshot.getState().capture;
  if (!capture?.image || capture.phase !== "selection") return;
  const { id, image } = capture;
  updateCapture(id, { phase: "capturing", progress: "Capturing selected area…" });
  try { updateCapture(id, { image: await renderScreenshot(image.data, crop), phase: "editor", progress: undefined }); }
  catch (error) { updateCapture(id, { phase: "selection", error: (error as Error).message }); }
}
export function setScreenshotStrokes(strokes: ScreenshotStroke[]) {
  const capture = useScreenshot.getState().capture;
  if (capture) updateCapture(capture.id, { strokes: strokes.slice(0, 1000) });
}
export async function outputScreenshot(output: "png" | "pdf" | "clipboard") {
  const capture = useScreenshot.getState().capture;
  if (!capture?.image) return;
  try {
    const result = await exportScreenshot(capture.image.data, capture.strokes, output, capture.windowId);
    if (result) {
      if (screenshotCurrent(capture.id)) closeScreenshot();
      showToast(capture.windowId, output === "clipboard" ? "Screenshot Copied" : "Screenshot Saved", output === "clipboard" ? undefined : result, { icon: output === "clipboard" ? "doc.on.clipboard" : "checkmark" });
    }
  } catch (error) { updateCapture(capture.id, { error: (error as Error).message }); }
}
function watchCapture(s: ReturnType<typeof useBrowser.getState>, prev: ReturnType<typeof useBrowser.getState>) {
  const capture = useScreenshot.getState().capture;
  if (!capture) return;
  const tab = s.tabs[capture.tabId];
  const window = s.windows[capture.windowId];
  const previous = prev.tabs[capture.tabId];
  const navigation = tab?.page.kind === "loaded" ? tab.page.nav.seq : null;
  const previousNavigation = previous?.page.kind === "loaded" ? previous.page.nav.seq : null;
  if (!tab || !window || window.activeTabIds[window.profileId] !== tab.id || tab.url !== previous?.url || navigation !== previousNavigation) closeScreenshot();
}
