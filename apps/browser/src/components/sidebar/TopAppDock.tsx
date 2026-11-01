import { space } from "../ui/tokens";
import { Favicon } from "../favicon/Favicon";
import { useWindowProfileId } from "../../state/browser/hooks";
import { useHover } from "../ui/useHover";
import { GlassFill, useGlass } from "../ui/Glass";
import { Pressable, ScrollView, View } from "react-native";
import { useSettings, useWindow, useWindowId } from "../../state/browser/hooks";
import { closeMiniApp, MINI_APPS, openMiniApp, useMiniApps, type MiniAppId } from "../../state/sidebar/miniApps";
import { closeSidePanel } from "../../state/extensions/sidePanels";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export const appDockRows = (count: number) => Array.from({ length: Math.ceil(count / 3) }, (_, row) => Array.from({ length: Math.min(3, count - row * 3) }, (_, i) => row * 3 + i));
export function TopAppDock({ collapsed = false }: { collapsed?: boolean }) {
  const windowId = useWindowId();
  const enabled = useSettings((s) => s.sidebarMiniApps);
  const privateWindow = useWindow(windowId, (w) => w?.kind === "private");
  const active = useMiniApps((s) => s.active[windowId]);
  const apps = enabled.filter((id): id is MiniAppId => Object.hasOwn(MINI_APPS, id));
  if (privateWindow || !apps.length) return null;
  const rows = collapsed ? apps.map((_, i) => [i]) : appDockRows(apps.length);
  return <ScrollView style={{ flexGrow: 0, maxHeight: collapsed ? 150 : 152 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.l, gap: PAGE3.dockGap, paddingVertical: space.m }}>
    {rows.map((row, index) => <View key={index} style={{ flexDirection: "row", gap: PAGE3.dockGap }}>
      {row.map((at) => <AppTile key={apps[at]} id={apps[at]!} selected={active === apps[at]} windowId={windowId} />)}
    </View>)}
  </ScrollView>;
}

function AppTile({ id, selected, windowId }: { id: MiniAppId; selected: boolean; windowId: string }) {
  const theme = useTheme();
  const profileId = useWindowProfileId();
  const glass = useGlass();
  const { hovered, hoverProps } = useHover();
  const app = MINI_APPS[id];
  const favicon = `${new URL(app.url).origin}/favicon.ico`;
  return <View {...hoverProps} tooltip={app.title}><Pressable accessibilityRole="button" accessibilityLabel={app.title} accessibilityState={{ selected }} onPress={() => { if (selected) closeMiniApp(windowId); else { closeSidePanel(windowId); openMiniApp(windowId, id); } }}>
    {({ pressed }) => <View style={{ width: PAGE3.dockHeight, height: PAGE3.dockHeight, borderRadius: PAGE3.dockRadius, alignItems: "center", justifyContent: "center", backgroundColor: glass ? undefined : pressed ? theme.toolbarPressed : selected ? theme.rowSelected : hovered ? theme.rowHover : theme.pinnedResting }}>
      {glass && <GlassFill radius={PAGE3.dockRadius} state={pressed ? "pressed" : selected ? "active" : hovered ? "lit" : "rest"} />}
      <Favicon url={app.url} favicon={favicon} profileId={profileId} size={18} />
    </View>}
  </Pressable></View>;
}
