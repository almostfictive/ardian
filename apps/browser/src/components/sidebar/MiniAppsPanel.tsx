import { space } from "../ui/tokens";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { WebView, Box, Button, Symbol, Text, type WebViewHandle } from "../ui";
import { useTheme } from "../ui/theme";
import { PAGE3 } from "../ui/tokens";
import { useSettings, useWindow, useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { openFromPage, pageProfileId } from "../../state/tabs/openFromPage";
import { closeMiniApp, MINI_APPS, useMiniAppProfile, useMiniApps, type MiniAppId } from "../../state/sidebar/miniApps";
const NO_APPS: MiniAppId[] = [];

export function MiniAppsPanel() {
  const windowId = useWindowId();
  const profileId = useWindowProfileId();
  const active = useMiniApps((s) => s.active[windowId]);
  const visited = useMiniApps((s) => s.visited[`${windowId}|${profileId}`] ?? NO_APPS);
  const enabled = useSettings((s) => s.sidebarMiniApps);
  const privateWindow = useWindow(windowId, (w) => w?.kind === "private");
  const expanded = useWindow(windowId, (w) => w?.sidebarOpen);
  if (privateWindow || !visited.length) return null;
  const left = expanded ? PAGE3.expanded : PAGE3.collapsed;
  return <View pointerEvents={active ? "auto" : "none"} style={StyleSheet.absoluteFill}>
    {active && <Pressable accessibilityLabel="Close mini-app" style={StyleSheet.absoluteFill} onPress={() => closeMiniApp(windowId)} />}
    {visited.filter((app) => enabled.includes(app)).map((app) => <View key={`${profileId}|${app}`} pointerEvents={active === app ? "auto" : "none"} style={{ position: "absolute", left: active === app ? left + 28 : -20000, top: 64, bottom: 64, right: 28, maxWidth: 960 }}>
      <MiniAppCard windowId={windowId} app={app} visible={active === app} />
    </View>)}
  </View>;
}
function MiniAppCard({ windowId, app, visible }: { windowId: string; app: MiniAppId; visible: boolean }) {
  const theme = useTheme();
  const profileId = useWindowProfileId();
  const profile = useMiniAppProfile(profileId);
  const definition = MINI_APPS[app];
  const web = useRef<WebViewHandle>(null);
  const keys = useRef<View>(null);
    useEffect(() => { if (visible) keys.current?.focus(); }, [visible]);
  return <View ref={keys} focusable enableFocusRing={false} keyDownEvents={[{ key: "Escape" }]} onKeyDown={(e) => { if (visible && e.nativeEvent.key === "Escape") closeMiniApp(windowId); }} style={{ flex: 1, borderRadius: PAGE3.pageRadius, overflow: "hidden", borderWidth: 1, borderColor: theme.popoverBorder, backgroundColor: theme.panel }}>
    <Box row gap="m" style={{ height: 40, alignItems: "center", paddingLeft: space.xl, paddingRight: space.m }}>
      <Symbol name={definition.icon} size={15} color={theme.textPrimary} style={{ width: 18, height: 18 }} />
      <Text numberOfLines={1} weight="medium" style={{ flex: 1 }}>{definition.title}</Text>
      <Button variant="icon" icon="arrow.clockwise" tooltip="Reload App" onPress={() => void web.current?.reload()} />
      <Button variant="icon" icon="xmark" tooltip="Close App" onPress={() => closeMiniApp(windowId)} />
    </Box>
    <View style={{ flex: 1 }}><WebView ref={web} style={StyleSheet.absoluteFill} url={definition.url} profile={profile} visible={visible} standalone pageBackgroundColor={theme.panel} contentsBackgroundColor={theme.panel}
      onCommand={({ command }) => { if (visible && command === "escape") closeMiniApp(windowId); }}
      onWindowClose={() => closeMiniApp(windowId)}
      onOpenWindow={(request) => openFromPage(request, { windowId, profileId: pageProfileId(windowId, profile) })} />
    </View>
  </View>;
}
