import { showMenu } from "../../platform/menus";
import { webviews } from "../../platform/webviews";
import { useBrowser } from "../browser/store";
import { showToast } from "../app/toasts";

type CaptureMode = "visible" | "crop" | "fullPage";

export async function captureScreenshot(tabId: string): Promise<void> {
  const tab = useBrowser.getState().tabs[tabId];
  if (!tab?.url) return;
  const choice = await showMenu([
    { id: "visible", title: "Capture Visible Area", symbol: "rectangle.dashed" },
    { id: "crop", title: "Capture Part of Page", symbol: "crop" },
    { id: "fullPage", title: "Capture Entire Page", symbol: "doc.text.viewfinder" },
  ]);
  if (choice !== "visible" && choice !== "crop" && choice !== "fullPage") return;
  try {
    const picture = await webviews.get(tabId)?.capturePicture(1, choice === "fullPage");
    if (!picture) {
      showToast(tab.windowId, "Couldn't Take Screenshot", "Make the page visible and try again.", { icon: "camera" });
      return;
    }
    const settings = useBrowser.getState().settings;
    const editor = screenshotEditor(picture.data, choice as CaptureMode, settings.screenshotMarkerColor, settings.screenshotHighlighterColor);
    useBrowser.getState().newTab(tab.windowId, { url: `data:text/html;charset=utf-8,${encodeURIComponent(editor)}` });
  } catch (error) {
    showToast(tab.windowId, "Couldn't Open Screenshot", (error as Error).message, { icon: "exclamationmark.triangle" });
  }
}

function screenshotEditor(image: string, mode: CaptureMode, markerColor: string, highlighterColor: string): string {
  const source = `data:image/jpeg;base64,${image}`;
  const title = mode === "crop" ? "Crop screenshot" : mode === "fullPage" ? "Entire page screenshot" : "Screenshot";
  const crop = mode === "crop" ? "crop" : "marker";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box}body{margin:0;background:black;color:white;font:13px -apple-system,BlinkMacSystemFont,sans-serif}.bar{height:54px;display:flex;align-items:center;gap:8px;padding:0 18px;background:darkslategray;position:sticky;top:0;z-index:2;border-bottom:1px solid gray}.bar strong{font-size:14px;margin-right:auto}button{font:inherit;color:inherit;background:dimgray;border:1px solid gray;border-radius:7px;padding:7px 11px;cursor:pointer}button.active{background:slategray;border-color:gray}input[type=color]{width:30px;height:30px;padding:2px;border:1px solid gray;border-radius:6px;background:dimgray}main{min-height:calc(100vh - 54px);display:flex;align-items:center;justify-content:center;padding:28px;overflow:auto}canvas{max-width:100%;height:auto;box-shadow:0 8px 40px black;touch-action:none;background:white}</style></head><body><header class="bar"><strong>Screenshot</strong><button id="crop" class="${crop === "crop" ? "active" : ""}">Crop</button><button id="marker" class="${crop === "marker" ? "active" : ""}">Marker</button><button id="highlighter">Highlighter</button><button id="undo">Undo</button><button id="save">Save Image</button></header><main><canvas></canvas></main><script>const image=new Image();image.src=${JSON.stringify(source)};const canvas=document.querySelector('canvas');const context=canvas.getContext('2d');const marker=${JSON.stringify(markerColor)},highlighter=${JSON.stringify(highlighterColor)};let mode=${JSON.stringify(crop)},drawing=false,start=null,previous=null,history=[];image.onload=()=>{canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;context.drawImage(image,0,0)};function remember(){history.push(context.getImageData(0,0,canvas.width,canvas.height));if(history.length>20)history.shift()}function choose(next){mode=next;document.querySelectorAll('.bar button').forEach(b=>b.classList.toggle('active',b.id===next))}for(const id of ['crop','marker','highlighter'])document.getElementById(id).onclick=()=>choose(id);canvas.onpointerdown=e=>{if(!canvas.width)return;const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;drawing=true;start={x,y};previous={x,y};canvas.setPointerCapture(e.pointerId);remember()};canvas.onpointermove=e=>{if(!drawing)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;if(mode==='crop'){context.putImageData(history[history.length-1],0,0);context.strokeStyle='dodgerblue';context.lineWidth=Math.max(2,canvas.width/600);context.setLineDash([8,5]);context.strokeRect(start.x,start.y,x-start.x,y-start.y);context.setLineDash([])}else{context.beginPath();context.moveTo(previous.x,previous.y);context.lineTo(x,y);context.lineCap='round';context.lineJoin='round';context.lineWidth=mode==='highlighter'?Math.max(18,canvas.width/45):Math.max(3,canvas.width/180);context.strokeStyle=mode==='highlighter'?highlighter:marker;context.globalAlpha=mode==='highlighter'?.28:1;context.stroke();context.globalAlpha=1;previous={x,y}}};canvas.onpointerup=e=>{if(!drawing)return;drawing=false;if(mode==='crop'&&start){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height,left=Math.max(0,Math.min(start.x,x)),top=Math.max(0,Math.min(start.y,y)),width=Math.min(canvas.width-left,Math.abs(x-start.x)),height=Math.min(canvas.height-top,Math.abs(y-start.y));if(width>4&&height>4){const cropped=document.createElement('canvas');cropped.width=width;cropped.height=height;cropped.getContext('2d').drawImage(canvas,left,top,width,height,0,0,width,height);canvas.width=width;canvas.height=height;context.drawImage(cropped,0,0);history=[]}choose('marker')}};document.getElementById('undo').onclick=()=>{const last=history.pop();if(last)context.putImageData(last,0,0)};document.getElementById('save').onclick=()=>{const link=document.createElement('a');link.download='Ardia Screenshot.png';link.href=canvas.toDataURL('image/png');link.click()};</script></body></html>`;
}
