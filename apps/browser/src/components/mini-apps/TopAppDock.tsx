import { Pressable, View } from "react-native";
import { useWindow, useWindowId } from "../../state/browser/hooks";
import { closeMiniApp, MINI_APPS, openMiniApp, useMiniApps, type MiniAppId } from "../../state/mini-apps/store";
import { radius, space, Symbol, useTheme } from "../ui";

const apps = Object.keys(MINI_APPS) as MiniAppId[];
export function TopAppDock() {
  const windowId = useWindowId();
  const theme = useTheme();
  const privateWindow = useWindow(windowId, (window) => window?.kind === "private");
  const active = useMiniApps((state) => state.active[windowId]);
  if (privateWindow) return null;
  return <View style={{ flexDirection: "row", gap: space.xs, paddingHorizontal: space.s, paddingTop: space.xs }}>
    {apps.map((id) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={MINI_APPS[id].title} accessibilityState={{ selected: active === id }} tooltip={MINI_APPS[id].title} onPress={() => active === id ? closeMiniApp(windowId) : openMiniApp(windowId, id)} style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: radius.chrome, backgroundColor: active === id ? theme.rowHover : undefined }}><Symbol name={MINI_APPS[id].icon} size={14} color={theme.textPrimary} /></Pressable>)}
  </View>;
}
