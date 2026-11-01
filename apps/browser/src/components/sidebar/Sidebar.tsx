import { PAGE3, space } from "../ui/tokens";
import { TopAppDock } from "./TopAppDock";
import { Page3History } from "./Page3History";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { WindowDragRegion } from "../ui";
import { useSettings, useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { useNoTiles } from "../../state/sidebar/hooks";
import { useAddressBarInSidebar } from "../../state/windows/layout";
import { usePagerPages } from "../../state/windows/profilePager";
import { DragGhost } from "./DragGhost";
import { DragProvider } from "./DragProvider";
import type { DragController } from "./dragController";
import type { Ghost } from "./dragModel";
import { SidebarDropArea } from "./SidebarDropArea";
import { FolderPanel } from "./FolderPanel";
import { dismissHover, dismissHoverIn } from "../../state/sidebar/hover";
import { PinFieldZone, PinSlotZone } from "./PinnedGrid";
import { SIDEBAR_FIELD } from "./geometry";
import { closeFolderPanel } from "../../state/sidebar/tileFolderUi";
import { GLOW_ROOM, ROW_PITCH, type SidebarGeometry } from "./pageLayout";
import { SidebarPage } from "./SidebarPage";
import { SidebarRowLookContext, useSidebarRowLookSource } from "./rowLook";
import { SidebarFooter } from "./SidebarFooter";
import { FOOTER_HEIGHT } from "../../state/sidebar/footer";
import { useRevealTabs } from "./useRevealTabs";

export function Sidebar({ width }: { width: number }) {
  const windowId = useWindowId();
  const current = useWindowProfileId();
  const { pages, paging } = usePagerPages(windowId);
  const [available, setAvailable] = useState(0);
  const newTabAtTop = useSettings((s) => s.newTabButtonPosition === "top");
  const dockAbove = newTabAtTop || available <= 0 ? Infinity : available - ROW_PITCH - 12;
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const geometry = useRef<SidebarGeometry>({ viewport: 0, regions: { pinnedGroups: 0, list: 0 }, newTabAtTop: false, tilesFixed: true });
  const addressBar = useAddressBarInSidebar();
  const [header, setHeader] = useState(142);
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
                bottom: footer,
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
                    height={Math.max(0, available - (addressBar ? GLOW_ROOM : 0))}
                    rows={page.id === current ? undefined : Math.ceil(available / ROW_PITCH) + 1}
                    geometry={page.id === current ? geometry : undefined}
                    onScrollView={onScrollView}
                    onScrollY={onScrollY}
                  />
                ))}
              </SidebarRowLookContext.Provider>
            </View>

            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><SidebarFooter /></View>
            <View onLayout={(e) => setHeader(e.nativeEvent.layout.height)} style={{ paddingTop: PAGE3.dockHeight + space.l }}>
              <WindowDragRegion style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44 }} />
              <Page3History />
              <TopAppDock />
            </View>


            {ghost && !ghost.landing && nothingPinned ? (
              addressBar ? (
                <PinFieldZone top={SIDEBAR_FIELD.top} height={SIDEBAR_FIELD.height} />
              ) : (
                <PinSlotZone />
              )
            ) : null}
            <FolderPanel windowId={windowId} />
            {ghost ? <DragGhost ghost={ghost} /> : null}
          </SidebarDropArea>
        );
      }}
    </DragProvider>
  );
}
