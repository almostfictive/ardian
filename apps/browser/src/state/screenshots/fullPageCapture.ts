import { stitchScreenshots, type ScreenshotImage } from "../../platform/screenshots";
import type { WebViewHandle } from "../../platform/tabs";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
async function bounded<T>(promise: Promise<T>, milliseconds = 5000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("The page didn't respond. Try capturing the visible area.")), milliseconds); })]); }
  finally { clearTimeout(timer); }
}
const pageValue = <T,>(web: WebViewHandle, expression: string) => web.evaluate<T>(`post("result",JSON.stringify((${expression}) ?? null))`);
type Metrics = { width: number; height: number; viewport: number; x: number; y: number; href: string };
export async function fullPageCapture(web: WebViewHandle, progress: (text: string) => void, current: () => boolean): Promise<ScreenshotImage> {
  const metrics = await bounded(pageValue<Metrics>(web, "({width:innerWidth,height:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0),viewport:innerHeight,x:scrollX,y:scrollY,href:location.href})"));
  if (!metrics || ![metrics.width, metrics.height, metrics.viewport, metrics.x, metrics.y].every(Number.isFinite) || metrics.viewport <= 0 || metrics.width <= 0 || metrics.height <= 0) throw new Error("This page can't be captured in full. Capture the visible area instead.");
  const { width, height, viewport, x, y, href } = metrics;
  if (width > 20000 || height > 20000 || width * height > 50_000_000 || Math.ceil(height / viewport) > 40) throw new Error("This page exceeds the 20,000 px or 50 megapixel capture limit. Choose a selected area instead.");
  const tiles: { data: string; y: number }[] = [];
  const originalStyle = await bounded(pageValue<{ value: string; priority: string }>(web, "({value:document.documentElement.style.getPropertyValue('scroll-behavior'),priority:document.documentElement.style.getPropertyPriority('scroll-behavior')})"));
  const key = JSON.stringify(`__ardiaCapture${Date.now()}`);
  try {
    await bounded(pageValue(web, `(()=>{const state=globalThis[${key}]={changes:[],fixed:[],style:document.createElement('style')};state.style.textContent='*{animation-play-state:paused!important;transition:none!important;scroll-behavior:auto!important;scroll-snap-type:none!important}';document.documentElement.appendChild(state.style);for(const el of [...document.querySelectorAll('*')].slice(0,50000)){const position=getComputedStyle(el).position;if(position==='fixed')state.fixed.push(el);if(position==='sticky'){state.changes.push([el,'position',el.style.getPropertyValue('position'),el.style.getPropertyPriority('position')]);el.style.setProperty('position','relative','important')}}return true})()`));
    let position = 0;
    while (position < height) {
      if (!current()) throw new Error("Capture cancelled.");
      if (tiles.length === 1) await bounded(pageValue(web, `(()=>{const state=globalThis[${key}];if(!state)return;for(const el of state.fixed){state.changes.push([el,'visibility',el.style.getPropertyValue('visibility'),el.style.getPropertyPriority('visibility')]);el.style.setProperty('visibility','hidden','important')}})()`));
      const target = Math.min(position, Math.max(0, height - viewport));
      const actual = await bounded(pageValue<{ y: number; href: string }>(web, `(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo({left:0,top:${target},behavior:'instant'});return {y:scrollY,href:location.href}})()`));
      if (!actual || actual.href !== href || !Number.isFinite(actual.y) || Math.abs(actual.y - target) > 2) throw new Error("The page changed during capture. Try again.");
      await wait(120);
      if (!current()) throw new Error("Capture cancelled.");
      const picture = await bounded(web.capturePicture(1));
      if (!picture) throw new Error("Couldn't capture a section of the page. Try capturing the visible area.");
      tiles.push({ data: picture.data, y: actual.y });
      progress(`Capturing page… ${Math.min(100, Math.round((actual.y + viewport) / height * 100))}%`);
      if (actual.y + viewport >= height) break;
      position += viewport;
    }
    if (!current()) throw new Error("Capture cancelled.");
    progress("Stitching screenshot…");
    return await bounded(stitchScreenshots(tiles, width, height), 10000);
  } finally {
    await bounded(pageValue(web, `(()=>{if(location.href!==${JSON.stringify(href)})return;document.documentElement.style.scrollBehavior='auto';scrollTo({left:${x},top:${y},behavior:'instant'});document.documentElement.style.setProperty('scroll-behavior',${JSON.stringify(originalStyle?.value ?? "")},${JSON.stringify(originalStyle?.priority ?? "")});const state=globalThis[${key}];if(state){for(const [el,property,value,priority] of state.changes)el.style.setProperty(property,value,priority);state.style.remove();delete globalThis[${key}]}})()`)).catch(() => {});
  }
}
