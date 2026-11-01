import { chooseFromMenu } from "../app/menuChoice";
import { createWorkspace } from "./actions";

export async function showWorkspaceMenu(windowId: string, _id: string) {
  const choice = await chooseFromMenu([{ id: "new", title: "New Workspace", symbol: "plus" }]);
  if (choice === "new") void createWorkspace(windowId);
}
