import { Pressable, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { showWorkspaceMenu } from "../../state/workspaces/menu";
import { ContextMenuArea, useTheme } from "../ui";
import { MAX_WORKSPACES } from "../../state/workspaces/model";
import { WORKSPACE_DOTS } from "./tokens";

export function WorkspaceSwitcher() {
  const windowId = useWindowId();
  const theme = useTheme();
  const list = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  return <View style={{ flexDirection: "row", alignItems: "center", gap: WORKSPACE_DOTS.gap }}>
    {list.slice(0, MAX_WORKSPACES).map((workspace) => <ContextMenuArea key={workspace.id} onContextMenu={() => void showWorkspaceMenu(windowId, workspace.id)}>
      <Pressable accessibilityRole="button" accessibilityLabel={workspace.name} accessibilityState={{ selected: workspace.id === selected }} onPress={() => switchWorkspace(windowId, workspace.id)} style={{ width: WORKSPACE_DOTS.size, height: WORKSPACE_DOTS.hitHeight, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: WORKSPACE_DOTS.size, height: WORKSPACE_DOTS.size, borderRadius: WORKSPACE_DOTS.radius, opacity: workspace.id === selected ? 1 : WORKSPACE_DOTS.inactive, backgroundColor: theme.dark ? WORKSPACE_DOTS.dark : WORKSPACE_DOTS.light }} />
      </Pressable>
    </ContextMenuArea>)}
  </View>;
}
