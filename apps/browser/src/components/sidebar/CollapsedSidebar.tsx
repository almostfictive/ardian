import { ScrollView, View } from "react-native";
import { useIsActiveTab, useTab, useWindow, useWindowId } from "../../state/browser/hooks";
import { useRailTabs } from "../../state/sidebar/hooks";
import { toggleSidebar, openPanel } from "../../state/windows/actions";
import { toggleProfilePopover } from "../../state/sidebar/profilePopover";
import { Button, GlassFill, radius, space, useGlass, useHover, useTheme } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { TopAppDock } from "./TopAppDock";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { TabIcon } from "./TabIcon";
import { TabPressArea } from "./TabPressArea";

export function CollapsedSidebar() {
  const windowId = useWindowId();
  const fullscreen = useWindow(windowId, (w) => !!w?.fullScreen);
  const tabs = useRailTabs(windowId);
  return <View style={{ flex: 1, paddingTop: fullscreen ? space.m : PAGE3.rowHeight * 2, alignItems: "center" }}>
    <TopAppDock collapsed />
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, alignSelf: "stretch" }} contentContainerStyle={{ alignItems: "center", gap: space.s, paddingVertical: space.m }}>
      {tabs.map((id) => <RailTab key={id} tabId={id} windowId={windowId} />)}
      <Button variant="icon" icon="plus" box={PAGE3.dockHeight} tooltip="New Tab" onPress={() => openPanel(windowId, "", { kind: "list" })} />
    </ScrollView>
    <Button variant="icon" icon="person.crop.circle" box={PAGE3.dockHeight} tooltip="Profile" onPress={() => toggleProfilePopover(windowId)} />
    <WorkspaceSwitcher collapsed />
    <Button variant="icon" icon="sidebar.left" box={PAGE3.dockHeight} tooltip="Expand Sidebar" onPress={() => toggleSidebar(windowId)} />
  </View>;
}

function RailTab({ tabId, windowId }: { tabId: string; windowId: string }) {
  const tab = useTab(tabId);
  const active = useIsActiveTab(tabId);
  const theme = useTheme();
  const glass = useGlass();
  const { hovered, hoverProps } = useHover();
  if (!tab) return null;
  return <View {...hoverProps}><TabPressArea tab={tab} windowId={windowId} tooltip={tab.customTitle || tab.title || tab.url || "New Tab"}>
    {({ pressed }) => <View style={{ width: PAGE3.dockHeight, height: PAGE3.dockHeight, borderRadius: radius.tile, alignItems: "center", justifyContent: "center", backgroundColor: glass ? undefined : pressed ? theme.tabPressed : active ? theme.rowSelected : hovered ? theme.rowHover : undefined }}>
      {glass && (active || hovered || pressed) && <GlassFill radius={radius.tile} state={pressed ? "pressed" : active ? "active" : "lit"} />}
      <TabIcon tabId={tab.id} url={tab.url} favicon={tab.favicon} profileId={tab.profileId} />
    </View>}
  </TabPressArea></View>;
}
