import { Pressable, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { toggleSidebar } from "../../state/windows/actions";
import { toggleProfilePopover } from "../../state/sidebar/profilePopover";
import { useTabGroupIndicators } from "../../state/sidebar/hooks";
import { switchToTab } from "../../state/browser/actions";
import { Button } from "../ui";
import { useTheme } from "../ui/theme";
export function SidebarFooter() {
  const windowId = useWindowId();
  const theme = useTheme();
  const indicators = useTabGroupIndicators(windowId);
  return <View style={{ height: 42, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 }}>
    <Button variant="icon" toolbar icon="person.crop.circle" box={28} tooltip="Profile" onPress={() => toggleProfilePopover(windowId)} />
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", gap: 3 }}>
      {indicators.map((w) => <Pressable key={w.id} accessibilityRole="button" accessibilityLabel={w.name} accessibilityState={{ selected: w.active }} tooltip={w.name} onPress={() => switchToTab(w.tabId)} style={{ width: 14, height: 28, justifyContent: "center", alignItems: "center" }}><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: w.active ? theme.textPrimary : theme.textTertiary }} /></Pressable>)}
    </View>
    <Button variant="icon" toolbar icon="sidebar.left" box={28} tooltip="Collapse Sidebar" onPress={() => toggleSidebar(windowId)} />
  </View>;
}
