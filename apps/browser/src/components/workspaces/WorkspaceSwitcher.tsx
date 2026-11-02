import { Pressable, ScrollView, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { createWorkspace, switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { showWorkspaceMenu } from "../../state/workspaces/menu";
import { Button, capsule, ContextMenuArea, layout, space, useTheme } from "../ui";
import { MAX_WORKSPACES } from "../../state/workspaces/model";

export function WorkspaceSwitcher() {
  const windowId = useWindowId();
  const theme = useTheme();
  const list = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  return <View style={{ flexShrink: 0, paddingLeft: space.s, paddingRight: space.s }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: space.xs }}>
      {list.slice(0, MAX_WORKSPACES).map((workspace) => <ContextMenuArea key={workspace.id} onContextMenu={() => void showWorkspaceMenu(windowId, workspace.id)}><Pressable accessibilityRole="button" accessibilityLabel={workspace.name} accessibilityState={{ selected: workspace.id === selected }} onPress={() => switchWorkspace(windowId, workspace.id)} style={{ width: 16, height: layout.rowHeight, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 8, height: 8, borderRadius: capsule(8), backgroundColor: workspace.id === selected ? theme.textPrimary : theme.textTertiary }} />
      </Pressable></ContextMenuArea>)}
      {list.length < MAX_WORKSPACES ? <Button variant="icon" icon="plus" size="s" box={28} tooltip="New Workspace" onPress={() => void createWorkspace(windowId)} /> : null}
    </ScrollView>
  </View>;
}
