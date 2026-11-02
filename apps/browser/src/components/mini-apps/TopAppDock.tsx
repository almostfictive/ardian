import { Image, Pressable, View } from "react-native";
import { useSettings, useWindow, useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { closeMiniApp, MINI_APPS, openMiniApp, useMiniApps, type MiniAppId } from "../../state/mini-apps/store";
import { useFavicon } from "../../state/favicons/favicons";
import { capsule, radius, space, useTheme } from "../ui";
import { closeSidePanel } from "../../state/extensions/sidePanels";
import { miniAppBoxHeight, miniAppRows } from "./miniAppLayout";

export function TopAppDock() {
  const windowId = useWindowId();
  const profileId = useWindowProfileId();
  const enabled = useSettings((state) => state.sidebarMiniApps);
  const theme = useTheme();
  const privateWindow = useWindow(windowId, (window) => window?.kind === "private");
  const active = useMiniApps((state) => state.active[windowId]);
  if (privateWindow) return null;
  const visible = enabled.filter((id): id is MiniAppId => Object.hasOwn(MINI_APPS, id));
  if (!visible.length) return null;
  const rows = miniAppRows(visible.length);
  return <View style={{ paddingHorizontal: space.s, paddingTop: space.xs, gap: space.xs }}>
    {rows.map((row, rowIndex) => <View key={rowIndex} style={{ flexDirection: "row", gap: space.xs }}>
      {row.map((index) => { const id = visible[index]!; return <MiniAppDockButton key={id} id={id} profileId={profileId} selected={active === id} onPress={() => { if (active === id) closeMiniApp(windowId); else { closeSidePanel(windowId); openMiniApp(windowId, id); } }} />; })}
    </View>)}
  </View>;
}

function MiniAppDockButton({ id, profileId, selected, onPress }: { id: MiniAppId; profileId: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  const definition = MINI_APPS[id];
  const faviconUrl = `${new URL(definition.url).origin}/favicon.ico`;
  const favicon = useFavicon(definition.url, faviconUrl, profileId);
  return <Pressable accessibilityRole="button" accessibilityLabel={definition.title} accessibilityState={{ selected }} tooltip={definition.title} onPress={onPress} style={{ flex: 1, height: miniAppBoxHeight(32), maxHeight: 32, alignItems: "center", justifyContent: "center", borderRadius: radius.chrome, backgroundColor: selected ? theme.rowHover : undefined }}>
    {favicon ? <Image source={{ uri: favicon.uri }} style={{ width: 16, height: 16, borderRadius: radius.hair }} /> : <View style={{ width: 12, height: 12, borderRadius: capsule(12), backgroundColor: theme.textTertiary }} />}
  </Pressable>;
}
