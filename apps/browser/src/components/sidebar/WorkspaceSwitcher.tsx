import { font, radius, space } from "../ui/tokens";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { createWorkspace, switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { showWorkspaceMenu } from "../../state/workspaces/menu";
import { Button, ContextMenuArea } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";
export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const windowId = useWindowId();
  const theme = useTheme();
  const list = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  return <View style={{ flexShrink: 0 }}>
    <ScrollView horizontal={!collapsed} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ maxHeight: collapsed ? 240 : 42 }} contentContainerStyle={{ gap: space.xs, paddingHorizontal: collapsed ? space.l : space.m, paddingVertical: space.xs }}>
      {list.map((w) => <ContextMenuArea key={w.id} onContextMenu={() => void showWorkspaceMenu(windowId, w.id)}><Pressable accessibilityRole="button" accessibilityLabel={w.name} accessibilityState={{ selected: w.id === selected }} tooltip={w.name} onPress={() => switchWorkspace(windowId, w.id)} style={{ minWidth: 32, height: 32, paddingHorizontal: w.display === "name" && !collapsed ? space.m : 0, alignItems: "center", justifyContent: "center", borderRadius: radius.chrome, backgroundColor: w.id === selected ? PAGE3.selected : undefined }}>
        {w.display === "name" && !collapsed ? <Text style={{ ...PAGE3.type.caption, color: w.id === selected || collapsed ? PAGE3.railText : theme.textPrimary }}>{w.name}</Text> : w.display === "picture" && w.icon ? <Image source={{ uri: w.icon }} style={{ width: 20, height: 20, borderRadius: radius.tile }} /> : w.display === "emoji" && w.icon ? <Text style={{ fontSize: font.large.fontSize }}>{w.icon}</Text> : w.display === "none" ? null : <WorkspaceIcon name={w.display === "icon" ? w.icon || "house" : "house"} color={collapsed || w.id === selected ? PAGE3.railText : theme.textPrimary} />}
      </Pressable></ContextMenuArea>)}
      {<Button variant="icon" icon="plus" size="m" box={28} tooltip="New Workspace" onPress={() => void createWorkspace(windowId)} />}
    </ScrollView>
  </View>;
}
