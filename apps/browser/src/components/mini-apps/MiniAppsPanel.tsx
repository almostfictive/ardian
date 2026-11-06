import { useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { WebView, Button, Text, type WebViewHandle } from "../ui";
import { useTheme } from "../ui/theme";
import { useSettings, useWindow, useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { openFromPage, pageProfileId } from "../../state/tabs/openFromPage";
import { closeMiniApp, miniAppDefinition, miniAppProfile, useMiniApps, type MiniAppId } from "../../state/mini-apps/store";
import { space, radius } from "../ui";
import { useFavicon } from "../../state/favicons/favicons";

const NONE: MiniAppId[] = [];
export function MiniAppsPanel() {
  const windowId = useWindowId();
  const profileId = useWindowProfileId();
  const active = useMiniApps((state) => state.active[windowId]);
  const visited = useMiniApps((state) => state.visited[`${windowId}|${profileId}`] ?? NONE);
  const enabled = useSettings((state) => state.sidebarMiniApps);
  const privateWindow = useWindow(windowId, (window) => window?.kind === "private");
  const expanded = useWindow(windowId, (window) => window?.sidebarOpen);
  if (privateWindow || !visited.length) return null;
  return <View pointerEvents={active ? "auto" : "none"} style={StyleSheet.absoluteFill}>
    {active && <Pressable accessibilityLabel="Close mini-app" style={StyleSheet.absoluteFill} onPress={() => closeMiniApp(windowId)} />}
    {visited.filter((app) => enabled.includes(app)).map((app) => <View key={`${profileId}|${app}`} pointerEvents={active === app ? "auto" : "none"} style={{ position: "absolute", left: active === app ? expanded ? 260 : 72 : -20000, top: 64, bottom: 64, right: 28, maxWidth: 960 }}><MiniAppCard windowId={windowId} app={app} visible={active === app} /></View>)}
  </View>;
}
function MiniAppCard({ windowId, app, visible }: { windowId: string; app: MiniAppId; visible: boolean }) {
  const theme = useTheme();
  const profileId = useWindowProfileId();
  const profile = miniAppProfile(profileId);
  const definition = miniAppDefinition(app);
  const favicon = useFavicon(definition.url, `${new URL(definition.url).origin}/favicon.ico`, profileId);
  const web = useRef<WebViewHandle>(null);
  const keys = useRef<View>(null);
  useEffect(() => { if (visible) keys.current?.focus(); }, [visible]);
  return <View ref={keys} focusable enableFocusRing={false} keyDownEvents={[{ key: "Escape" }]} onKeyDown={(event) => { if (visible && event.nativeEvent.key === "Escape") closeMiniApp(windowId); }} style={{ flex: 1, borderRadius: radius.panel, overflow: "hidden", borderWidth: 1, borderColor: theme.popoverBorder, backgroundColor: theme.panel }}>
    <View style={{ height: 40, flexDirection: "row", gap: space.s, alignItems: "center", paddingLeft: space.m, paddingRight: space.xs }}>{favicon ? <Image source={{ uri: favicon.uri }} style={{ width: 18, height: 18, borderRadius: radius.hair }} /> : <View style={{ width: 18, height: 18 }} />}<Text numberOfLines={1} weight="medium" style={{ flex: 1 }}>{definition.title}</Text><Button variant="icon" icon="arrow.clockwise" tooltip="Reload App" onPress={() => void web.current?.reload()} /><Button variant="icon" icon="xmark" tooltip="Close App" onPress={() => closeMiniApp(windowId)} /></View>
    <View style={{ flex: 1 }}><WebView ref={web} style={StyleSheet.absoluteFill} url={definition.url} profile={profile} visible={visible} standalone pageBackgroundColor={theme.panel} contentsBackgroundColor={theme.panel} onCommand={({ command }) => { if (visible && command === "escape") closeMiniApp(windowId); }} onWindowClose={() => closeMiniApp(windowId)} onOpenWindow={(request) => openFromPage(request, { windowId, profileId: pageProfileId(windowId, profile) })} /></View>
  </View>;
}
