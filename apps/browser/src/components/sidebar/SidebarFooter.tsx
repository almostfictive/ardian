import { space } from "../ui/tokens";
import { View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { toggleSidebar } from "../../state/windows/actions";
import { toggleProfilePopover } from "../../state/sidebar/profilePopover";
import { Button } from "../ui";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function SidebarFooter() {
  const windowId = useWindowId();
  return <View style={{ height: 42, flexDirection: "row", alignItems: "center", paddingHorizontal: space.m }}>
    <Button variant="icon" toolbar icon="person.crop.circle" box={28} tooltip="Profile" onPress={() => toggleProfilePopover(windowId)} />
    <View style={{ flex: 1, alignItems: "center" }}><WorkspaceSwitcher /></View>
    <Button variant="icon" toolbar icon="sidebar.left" box={28} tooltip="Collapse Sidebar" onPress={() => toggleSidebar(windowId)} />
  </View>;
}
