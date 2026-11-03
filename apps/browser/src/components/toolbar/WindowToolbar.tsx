import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Animated, View } from "react-native";
import { AutoHideToolbar } from "./AutoHideToolbar";
import type { ToolbarGeometry } from "../window/geometry";
import type { ToolbarMode } from "../../state/windows/toolbarAutoHide";
import { Toolbar } from "./Toolbar";
import { useToolbarRow } from "./useToolbarRow";
import { Panel } from "../ui";
import { ADDRESS_BAR } from "./tokens";
import { useTheme } from "../ui/theme";

type PaneChrome = { tabId: string; mode: ToolbarMode; bar: Animated.Value; fade: Animated.Value };

const chromes = new Map<string, PaneChrome>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export function publishPaneChrome(windowId: string, chrome: PaneChrome) {
  const was = chromes.get(windowId);
  if (was && was.tabId === chrome.tabId && was.mode === chrome.mode && was.bar === chrome.bar && was.fade === chrome.fade) return;
  chromes.set(windowId, chrome);
  for (const listener of listeners) listener();
}

export function WindowToolbar({ windowId, tabId, geometry, autoHide }: { windowId: string; tabId: string; geometry: ToolbarGeometry; autoHide: boolean }) {
  const theme = useTheme();
  const chrome = useSyncExternalStore(subscribe, () => chromes.get(windowId));
  useEffect(() => () => void chromes.delete(windowId), [windowId]);
  const height = useToolbarRow().height;
  const frame = useMemo(() => ({ position: "absolute" as const, left: 0, top: 0, right: 0, height }), [height]);
  if (!autoHide) {
    return (
      <View pointerEvents="box-none" style={frame}>
        <Panel pointerEvents="none" fill={theme.dark ? ADDRESS_BAR.fill.dark : ADDRESS_BAR.fill.light} radius={ADDRESS_BAR.radius} material="hudWindow" materialAppearance="light" border={theme.dark ? ADDRESS_BAR.border.dark : ADDRESS_BAR.border.light} borderWidth={0.5} shadow={ADDRESS_BAR.shadow} style={{ position: "absolute", top: 2, left: 2, right: 2, height: ADDRESS_BAR.height }} />
        <Toolbar tabId={tabId} geometry={geometry} windowId={windowId} inSplit={false} focused bare />
      </View>
    );
  }
  if (!chrome) return null;
  return (
    <AutoHideToolbar
      tabId={tabId}
      geometry={geometry}
      windowId={windowId}
      inSplit={false}
      focused
      mode={chrome.tabId === tabId ? chrome.mode : "shown"}
      motion={chrome}
    />
  );
}
