import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, ContextMenuArea, WindowDragRegion } from "../ui";
import { SIDEBAR_FOOTER } from "./tokens";
import { SidebarSlot } from "./SidebarSlots";
import { useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { useNoTiles } from "../../state/sidebar/hooks";
import { openSettings } from "../../state/settings/settingsWindows";
import { usePagerPages } from "../../state/windows/profilePager";
import { SidebarHeaderTools } from "./AddressBar";
import { DragGhost } from "./DragGhost";
import { DragProvider } from "./DragProvider";
import type { DragController } from "./dragController";
import type { Ghost } from "./dragModel";
import { SidebarDropArea } from "./SidebarDropArea";
import { FolderPanel } from "./FolderPanel";
import { dismissHover, dismissHoverIn } from "../../state/sidebar/hover";
import { PinSlotZone } from "./PinnedGrid";
import { ResizeHandle } from "./ResizeHandle";
import { closeFolderPanel } from "../../state/sidebar/tileFolderUi";
import { openSidebarMenu } from "../../state/sidebar/menus";
import { GLOW_ROOM, ROW_PITCH, type SidebarGeometry } from "./pageLayout";
import { SidebarPage } from "./SidebarPage";
import { SidebarRowLookContext, useSidebarRowLookSource } from "./rowLook";
import { useRevealTabs } from "./useRevealTabs";

import { WorkspaceSwitcher } from "../workspaces/WorkspaceSwitcher";

const FOOTER_HEIGHT = SIDEBAR_FOOTER.height;

export function Sidebar({ width }: { width: number }) {
  const windowId = useWindowId();
  const current = useWindowProfileId();
  const { pages, paging } = usePagerPages(windowId);
  const [available, setAvailable] = useState(0);
  const dockAbove = available <= 0 ? Infinity : available - ROW_PITCH - 12;
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const geometry = useRef<SidebarGeometry>({ viewport: 0, regions: { pinnedGroups: 0, list: 0 }, newTabAtTop: false, tilesFixed: true });
  const header = 45;
  const footer = FOOTER_HEIGHT;
  const nothingPinned = useNoTiles(windowId, current);
  const rowLook = useSidebarRowLookSource();

  const drag = useRef<DragController | null>(null);
  const onScrollView = useCallback((v: ScrollView | null) => {
    scroll.current = v;
    if (drag.current) drag.current.scroll = v;
  }, []);
  const onScrollY = useCallback((y: number) => {
    scrollY.current = y;
    if (drag.current) drag.current.scrollY = y;
    dismissHover();
    closeFolderPanel();
  }, []);

  useRevealTabs(windowId, scroll, scrollY, geometry);
  useLayoutEffect(() => dismissHoverIn(windowId), [windowId, current, paging]);

  return (
    <DragProvider>
      {(ghost: Ghost | null, controller) => {
        drag.current = controller;
        return (
          <SidebarDropArea
            ref={(v) => {
              controller.root = v;
            }}
            style={{ width, height: "100%" }}
          >
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: header - GLOW_ROOM,
                bottom: footer + SIDEBAR_FOOTER.bottom,
                overflow: paging ? "hidden" : "visible",
              }}
              onLayout={(e) => setAvailable(e.nativeEvent.layout.height)}
            >
              <SidebarRowLookContext.Provider value={rowLook}>
                {pages.map((page) => (
                  <SidebarPage
                    key={page.id}
                    profileId={page.id}
                    slot={page.slot}
                    width={width}
                    current={page.id === current}
                    resting={!!page.resting}
                    dockAbove={dockAbove}
                    height={Math.max(0, available - GLOW_ROOM)}
                    rows={page.id === current ? undefined : Math.ceil(available / ROW_PITCH) + 1}
                    geometry={page.id === current ? geometry : undefined}
                    onScrollView={onScrollView}
                    onScrollY={onScrollY}
                  />
                ))}
              </SidebarRowLookContext.Provider>
            </View>

            <View style={{ position: "absolute", left: SIDEBAR_FOOTER.inset, right: SIDEBAR_FOOTER.inset, bottom: SIDEBAR_FOOTER.bottom, height: footer, paddingLeft: SIDEBAR_FOOTER.paddingLeft, paddingRight: SIDEBAR_FOOTER.paddingRight, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <ContextMenuArea style={StyleSheet.absoluteFill} onContextMenu={() => void openSidebarMenu(windowId)} />
              <SidebarSlot name="profile"><View style={{ width: SIDEBAR_FOOTER.profileBox, height: SIDEBAR_FOOTER.profileBox }} /></SidebarSlot>
              <SidebarSlot name="workspaces"><WorkspaceSwitcher /></SidebarSlot>
              <Button variant="icon" icon="gearshape" size="s" box={SIDEBAR_FOOTER.gearBox} glyph={SIDEBAR_FOOTER.gearGlyph} radius={SIDEBAR_FOOTER.gearRadius} style={{ width: SIDEBAR_FOOTER.gearBox, height: SIDEBAR_FOOTER.gearBox }} onPress={() => openSettings()} tooltip="Settings" />
            </View>

            <View style={{ height: header }}>
              <SidebarSlot name="trafficLights"><ContextMenuArea style={{ height: header }} onContextMenu={() => void openSidebarMenu(windowId)}>
                <WindowDragRegion style={StyleSheet.absoluteFill} />
              </ContextMenuArea></SidebarSlot>
              <SidebarHeaderTools width={width} />
            </View>

            <ResizeHandle windowId={windowId} />
            {ghost && !ghost.landing && nothingPinned ? (
              <PinSlotZone />
            ) : null}
            <FolderPanel windowId={windowId} />
            {ghost ? <DragGhost ghost={ghost} /> : null}
          </SidebarDropArea>
        );
      }}
    </DragProvider>
  );
}
