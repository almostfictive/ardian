import { useLayoutEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { setTrafficLightsCenter } from "../../state/windows/nativeWindow";
import { useWindow, useWindowId } from "../../state/browser/hooks";
import { Sidebar } from "../sidebar/Sidebar";
import { CollapsedSidebar } from "../sidebar/CollapsedSidebar";
import { WindowDragRegion } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { layout } from "../ui/theme";

type Inset = { top: number; right: number; bottom: number; left: number };
export function DockedLayout({ fullscreen, inset, children }: { fullscreen: boolean; topTabs: boolean; inset: Inset; topStrip?: { strip: ReactNode; peek: ReactNode }; children: ReactNode }) {
  const windowId = useWindowId();
  const open = useWindow(windowId, (window) => window?.sidebarOpen ?? true);
  const width = open ? PAGE3.expanded : PAGE3.collapsed;
  useLayoutEffect(() => {
    void setTrafficLightsCenter(windowId, fullscreen ? null : [32, 24]);
    return () => { void setTrafficLightsCenter(windowId, null); };
  }, [windowId, fullscreen]);
  return <>
    <View style={fullscreen ? { flex: 1 } : { flex: 1, paddingLeft: width + layout.sidebarCardGap, paddingTop: inset.top, paddingRight: inset.right, paddingBottom: inset.bottom }}>
      {!fullscreen && <WindowDragRegion style={StyleSheet.absoluteFill} />}
      {children}
    </View>
    {!fullscreen && <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, width }}>{open ? <Sidebar width={width} /> : <CollapsedSidebar />}</View>}
  </>;
}
