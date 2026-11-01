import { View } from "react-native";
import { useActiveTabId, useWindowId } from "../../state/browser/hooks";
import { useHistoryAvailability } from "../../state/tabs/navigation";
import { HistoryButton } from "../toolbar/NavButtons";
import { toolbarPalette } from "../ui/toolbarColors";
import { useTheme } from "../ui/theme";
const hit = { width: 26, height: 26, plateX: 0, plateY: 0, box: 26, radius: 8 };
export function Page3History() {
  const windowId = useWindowId();
  const tabId = useActiveTabId();
  const availability = useHistoryAvailability(tabId ?? "");
  const palette = toolbarPalette(useTheme(), null);
  if (!tabId) return null;
  return <View style={{ position: "absolute", top: 11, right: 8, flexDirection: "row" }}>
    <HistoryButton hit={hit} tabId={tabId} windowId={windowId} direction={-1} disabled={!availability.back} palette={palette} onFocus={() => {}} />
    <HistoryButton hit={hit} tabId={tabId} windowId={windowId} direction={1} disabled={!availability.forward} palette={palette} onFocus={() => {}} />
  </View>;
}
