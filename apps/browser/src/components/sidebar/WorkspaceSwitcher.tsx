import { Pressable, ScrollView, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { showWorkspaceMenu } from "../../state/workspaces/menu";
import { ContextMenuArea, radius, space, useHover, useTheme } from "../ui";

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const windowId = useWindowId();
  const list = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  return <ScrollView horizontal={!collapsed} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ flexGrow: 0, maxHeight: collapsed ? 120 : 28 }} contentContainerStyle={{ alignItems: "center", justifyContent: "center", gap: space.xs }}>
    {list.map((workspace, index) => <WorkspaceDot key={workspace.id} index={index} selected={workspace.id === selected} onPress={() => switchWorkspace(windowId, workspace.id)} onContextMenu={() => void showWorkspaceMenu(windowId, workspace.id)} />)}
  </ScrollView>;
}

function WorkspaceDot({ index, selected, onPress, onContextMenu }: { index: number; selected: boolean; onPress: () => void; onContextMenu: () => void }) {
  const theme = useTheme();
  const { hovered, hoverProps } = useHover();
  const label = `Workspace ${index + 1}`;
  return <View {...hoverProps} tooltip={label}><ContextMenuArea onContextMenu={onContextMenu}><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={{ width: 18, height: 28, alignItems: "center", justifyContent: "center", borderRadius: radius.control, backgroundColor: hovered ? theme.rowHover : undefined }}>
    <View style={{ width: 5, height: 5, borderRadius: radius.control, backgroundColor: selected ? theme.textPrimary : theme.textTertiary }} />
  </Pressable></ContextMenuArea></View>;
}
