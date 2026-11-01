import { radius, space } from "../ui/tokens";
import { Pressable, Text, View } from "react-native";
import { useTab, useTabLive } from "../../state/browser/hooks";
import { usePage, popoverOf, setPopover } from "../../state/tabs/pageState";
import { useToolbarAutoHide } from "../../state/windows/toolbarAutoHide";
import { openPanel, toggleDownloadsOpen } from "../../state/windows/actions";
import { openSplitPane, showSplitMenu } from "../../state/splits/actions";
import { captureScreenshot } from "../../state/screenshots/actions";
import { pageHostLabel } from "../../lib/url";
import { Button, ContextMenuArea, Symbol } from "../ui";
import { useTheme } from "../ui/theme";
import { PAGE3 } from "../ui/tokens";
import { siteScopedTheme } from "../ui/toolbarColors";
import { ThemeContext } from "../ui/theme";
import { useSitePalette } from "./useSitePalette";
import { GlassFill, useGlass } from "../ui/Glass";
import { ReloadButton } from "./NavButtons";
import { showUrlBarMenu } from "../../state/omnibox/paste";
import { ToolbarExtensions } from "../extensions/ToolbarExtensions";
import { GLYPH } from "./tokens";

export function PageCardToolbar({ tabId, windowId, inSplit }: { tabId: string; windowId: string; inSplit: boolean }) {
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const tab = useTab(tabId, (t) => t);
  const loading = useTabLive(tabId, (l) => l.isLoading);
  const scrolled = useToolbarAutoHide((s) => !!s.scrolledDown[tabId]);
  const security = usePage(tabId, (p) => p.security);
  const popover = usePage(tabId, () => popoverOf(tabId));

  const toggle = () => setPopover(tabId, popoverOf(tabId) === "siteControls" ? null : "siteControls");
  const glass = useGlass();
  const palette = useSitePalette(tabId);
  const shownTheme = siteScopedTheme(theme, palette);
  const hit = { width: 28, height: 28, plateX: 0, plateY: 0, box: 28, radius: radius.tile };
  if (!tab) return null;
  return <ThemeContext.Provider value={shownTheme}><View style={{ height: scrolled ? 28 : 41, flexDirection: "row", alignItems: "center", paddingHorizontal: space.l, backgroundColor: glass ? undefined : palette.background ?? colors.surface, gap: space.s }}>
    {glass && <GlassFill radius={radius.chrome} panelFill={palette.background ?? theme.panel} theme={shownTheme} />}
    <ContextMenuArea onContextMenu={() => void showUrlBarMenu(tab)} style={{ flex: 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={tab.url || "Search or enter address"} onPress={() => openPanel(windowId, tab.url)} style={{ flexDirection: "row", alignItems: "center", height: scrolled ? 28 : 41, gap: space.s }}>
        {tab.url ? <Symbol name={security?.level === "insecure" || security?.level === "certificateError" ? "lock.open" : "lock"} size={12} color={palette.secondary} style={{ width: 14, height: 14 }} /> : null}
        <Text numberOfLines={1} ellipsizeMode="middle" style={{ ...PAGE3.type.label, color: palette.text }}>{tab.url ? pageHostLabel(tab.url) : ""}</Text>
      </Pressable>
    </ContextMenuArea>
    {!scrolled && !!tab.url && <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ReloadButton place={{ hit }} tab={tab} loading={loading} palette={palette} onFocus={() => {}} />
      <Button variant="icon" toolbar palette={palette} icon="camera" box={28} look="field" tooltip="Take Screenshot" onPress={() => void captureScreenshot(tabId)} />
      <Button variant="icon" toolbar palette={palette} icon="slider.horizontal.3" box={28} look="field" tooltip="Site Settings" active={popover === "siteControls"} onPress={toggle} />
      <Button variant="icon" toolbar palette={palette} icon="rectangle.split.2x1" box={28} look="field" tooltip="Split View" onPress={() => inSplit ? void showSplitMenu(tabId) : openSplitPane(windowId, { anchorTabId: tabId })} />
      <Button variant="icon" toolbar palette={palette} icon="arrow.down.circle" box={28} look="field" tooltip="Downloads" onPress={() => toggleDownloadsOpen(windowId)} />
      <Button variant="icon" toolbar palette={palette} icon="shield" box={28} look="field" tooltip="Site Controls" onPress={toggle} />
      <View style={{ width: 28, height: 28 }}><ToolbarExtensions tabId={tabId} windowId={windowId} palette={palette} top={0} right={0} limit={1} /></View>
    </View>}
  </View></ThemeContext.Provider>;
}
