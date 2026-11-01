import { space } from "../ui/tokens";
import { View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { toggleSidebar } from "../../state/windows/actions";
import { openPanel } from "../../state/windows/actions";
import { openInternalPage } from "../../state/pages/urls";
import { toggleProfilePopover } from "../../state/sidebar/profilePopover";
import { Button } from "../ui";
import { ThemeContext, themeFor } from "../ui/theme";
import { PAGE3 } from "../ui/tokens";
import { TopAppDock } from "./TopAppDock";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
export function CollapsedSidebar() {
  const windowId = useWindowId();
  return <ThemeContext.Provider value={themeFor("neutral:dark")}><View style={{ flex: 1, backgroundColor: PAGE3.rail, paddingTop: PAGE3.rowHeight + space.xs, alignItems: "center" }}>
    <Button variant="icon" icon="house" size="toolbar" box={40} tooltip="New Tab" onPress={() => openPanel(windowId, "", { kind: "list" })} />
    <Button variant="icon" icon="star" size="toolbar" box={40} tooltip="Favorites" onPress={() => openInternalPage("bookmarks", windowId)} />
    <WorkspaceSwitcher collapsed />
    <View style={{ flex: 1 }} />
    <TopAppDock collapsed />
    <Button variant="icon" icon="sidebar.left" size="toolbar" box={40} tooltip="Expand Sidebar" onPress={() => toggleSidebar(windowId)} />
    <Button variant="icon" icon="ellipsis" size="toolbar" box={40} tooltip="Profile and Menu" onPress={() => toggleProfilePopover(windowId)} />
  </View></ThemeContext.Provider>;
}
