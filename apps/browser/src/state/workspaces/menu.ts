import { chooseFromMenu } from "../app/menuChoice";
import { useBrowser } from "../browser/store";
import { prompt, pickFiles } from "../../platform/dialogs";
import { workspacesOf } from "./model";
import { createWorkspace, updateWorkspace } from "./actions";

export async function showWorkspaceMenu(windowId: string, id: string) {
  const window = useBrowser.getState().windows[windowId];
  const workspace = window && workspacesOf(window).find((w) => w.id === id);
  if (!workspace) return;
  const choice = await chooseFromMenu([
    { id: "rename", title: "Rename Workspace…", symbol: "pencil" },
    { id: "name", title: "Show Name", checked: workspace.display === "name" },
    { id: "icon", title: "Choose Icon…", symbol: "square.grid.2x2" },
    { id: "emoji", title: "Choose Emoji…", symbol: "face.smiling" },
    { id: "picture", title: "Choose Picture…", symbol: "photo" },
    { id: "none", title: "Show Nothing", checked: workspace.display === "none" },
    { separator: true },
    { id: "new", title: "New Workspace…", symbol: "plus" },
  ]);
  if (choice === "new") return void createWorkspace(windowId);
  if (choice === "none" || choice === "name") return updateWorkspace(windowId, id, { display: choice });
  if (choice === "rename") {
    const name = await prompt({ title: "Rename Workspace", value: workspace.name, confirmTitle: "Rename", windowId });
    if (name?.trim()) updateWorkspace(windowId, id, { name });
  } else if (choice === "picture") {
    const paths = await pickFiles();
    const path = paths[0];
    if (path && /\.(png|jpe?g|gif|webp|heic)$/i.test(path)) updateWorkspace(windowId, id, { icon: path.startsWith("file:") ? path : `file://${path}`, display: "picture" });
  } else if (choice === "emoji") {
    const icon = await prompt({ title: "Workspace Emoji", placeholder: "✈️", value: workspace.display === "emoji" ? workspace.icon ?? "" : "", confirmTitle: "Use Emoji", windowId });
    if (icon?.trim()) updateWorkspace(windowId, id, { icon: icon.trim(), display: "emoji" });
  } else if (choice === "icon") {
    const icon = await chooseFromMenu(["house", "airplane", "hourglass", "briefcase", "star", "book", "heart", "globe", "music.note", "gamecontroller"].map((symbol) => ({ id: symbol, title: symbol.replaceAll(".", " "), symbol })));
    if (icon) updateWorkspace(windowId, id, { icon, display: "icon" });
  }
}
