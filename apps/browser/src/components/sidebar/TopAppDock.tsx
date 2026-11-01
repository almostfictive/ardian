import { WorkspaceIcon } from "./WorkspaceIcon";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSettings, useWindow, useWindowId } from "../../state/browser/hooks";
import { closeMiniApp, MINI_APPS, openMiniApp, useMiniApps, type MiniAppId } from "../../state/sidebar/miniApps";
import { closeSidePanel } from "../../state/extensions/sidePanels";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export const appDockRows = (count: number) => count === 3 ? [[0], [1, 2]] : count < 4 ? [Array.from({ length: count }, (_, i) => i)] : Array.from({ length: Math.ceil(count / 4) }, (_, row) => Array.from({ length: Math.min(4, count - row * 4) }, (_, i) => row * 4 + i));
export function TopAppDock({ collapsed = false }: { collapsed?: boolean }) {
  const windowId = useWindowId();
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const enabled = useSettings((s) => s.sidebarMiniApps);
  const privateWindow = useWindow(windowId, (w) => w?.kind === "private");
  const active = useMiniApps((s) => s.active[windowId]);
  const apps = enabled.filter((id): id is MiniAppId => Object.hasOwn(MINI_APPS, id));
  if (privateWindow || !apps.length) return null;
  const rows = collapsed ? apps.map((_, i) => [i]) : appDockRows(apps.length);
  return <ScrollView style={{ flexGrow: 0, maxHeight: collapsed ? 150 : 152 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: collapsed ? 16 : 12, gap: PAGE3.dockGap, paddingVertical: 8 }}>
    {rows.map((row, index) => <View key={index} style={{ flexDirection: "row", gap: PAGE3.dockGap }}>
      {row.map((at) => {
        const id = apps[at]!;
        const app = MINI_APPS[id];
        return <Pressable key={id} accessibilityRole="button" accessibilityLabel={app.title} accessibilityState={{ selected: active === id }} tooltip={app.title} onPress={() => { if (active === id) closeMiniApp(windowId); else { closeSidePanel(windowId); openMiniApp(windowId, id); } }} style={{ flex: collapsed || apps.length >= 4 ? undefined : 1, width: collapsed || apps.length >= 4 ? PAGE3.dockHeight : undefined, height: PAGE3.dockHeight, borderRadius: PAGE3.dockRadius, backgroundColor: active === id ? theme.toolbarPressed : colors.subtle, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <WorkspaceIcon name={id} size={PAGE3.dockIcon} color={collapsed ? PAGE3.railText : colors.primary} />
          {!collapsed && apps.length === 1 && <Text numberOfLines={1} style={{ ...PAGE3.type.label, color: colors.primary }}>{app.title}</Text>}
        </Pressable>;
      })}
    </View>)}
  </ScrollView>;
}
