import { Pressable, ScrollView, Text, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { createWorkspace, switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { showWorkspaceMenu } from "../../state/workspaces/menu";
import { Button, ContextMenuArea, Symbol, layout, space, radius, useTheme } from "../ui";

export function WorkspaceSwitcher() {
  const windowId = useWindowId();
  const theme = useTheme();
  const list = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  return <View style={{ flexShrink: 0, paddingLeft: space.s, paddingRight: space.s }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: space.xs }}>
      {list.map((workspace) => <ContextMenuArea key={workspace.id} onContextMenu={() => void showWorkspaceMenu(windowId, workspace.id)}><Pressable accessibilityRole="button" accessibilityLabel={workspace.name} accessibilityState={{ selected: workspace.id === selected }} onPress={() => switchWorkspace(windowId, workspace.id)} style={{ minWidth: layout.rowHeight, height: layout.rowHeight, paddingHorizontal: space.s, alignItems: "center", justifyContent: "center", borderRadius: radius.chrome, backgroundColor: workspace.id === selected ? theme.rowHover : undefined }}>
        {workspace.display === "emoji" && workspace.icon ? <Text>{workspace.icon}</Text> : <Symbol name={workspace.display === "icon" ? workspace.icon || "house" : "square.grid.2x2"} size={14} color={theme.textPrimary} />}
      </Pressable></ContextMenuArea>)}
      <Button variant="icon" icon="plus" size="s" box={28} tooltip="New Workspace" onPress={() => void createWorkspace(windowId)} />
    </ScrollView>
  </View>;
}
