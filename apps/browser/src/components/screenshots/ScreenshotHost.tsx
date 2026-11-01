import { radius, space } from "../ui/tokens";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { useCardAnchors } from "../../state/windows/layout";
import { chooseCapture, closeScreenshot, useScreenshot } from "../../state/screenshots/actions";
import { MenuRow, PopoverSurface } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";
import { useToolbarRow } from "../toolbar/useToolbarRow";
import { ScreenshotEditor } from "./ScreenshotEditor";
import { ScreenshotSelection } from "./ScreenshotSelection";

export function ScreenshotHost() {
  const windowId = useWindowId();
  const capture = useScreenshot((s) => s.capture?.windowId === windowId ? s.capture : null);
  return capture ? <ScreenshotContent key={capture.id} /> : null;
}
function ScreenshotContent() {
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const capture = useScreenshot((s) => s.capture)!;
  const toolbar = useToolbarRow();
  const anchor = useCardAnchors((s) => s[capture.windowId]);
  const keys = useRef<View>(null);
  useEffect(() => keys.current?.focus(), []);
  return <View ref={keys} focusable enableFocusRing={false} keyDownEvents={[{ key: "Escape" }]} onKeyDown={(e) => { if (e.nativeEvent.key === "Escape") closeScreenshot(); }} style={StyleSheet.absoluteFill}>
    {capture.phase === "menu" && <>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close capture menu" onPress={closeScreenshot} />
      <View style={{ position: "absolute", top: (anchor?.top ?? space.l) + toolbar.height + space.m, right: space.xl, width: PAGE3.panelWidth }}><PopoverSurface style={{ paddingVertical: space.m }}>
        {([ ["visible", "Visible area", "rectangle.dashed"], ["selected", "Selected area", "crop"], ["fullPage", "Full page", "doc.text.viewfinder"] ] as const).map(([mode, title, icon]) => <MenuRow key={mode} icon={icon} title={title} detail={mode === "visible" ? "Captures instantly" : mode === "selected" ? "Drag to choose a region" : "Scrolls and stitches"} onPress={() => void chooseCapture(mode)} />)}
        {capture.error && <Text accessibilityRole="alert" style={{ ...PAGE3.type.caption, color: theme.destructive, padding: space.xl }}>{capture.error}</Text>}
      </PopoverSurface></View>
    </>}
    {capture.phase === "flash" && <View pointerEvents="none" style={{ position: "absolute", left: anchor?.left ?? 172, top: anchor?.top ?? space.m, right: 8, bottom: 8, borderRadius: PAGE3.pageRadius, borderWidth: 3, borderColor: theme.formAccent }} />}
    {capture.phase === "capturing" && <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={{ position: "absolute", right: 24, top: 92, borderRadius: radius.chrome, padding: space.xl }}><PopoverSurface><Text accessibilityLiveRegion="polite" style={{ ...PAGE3.type.label, color: colors.primary }}>{capture.progress}</Text></PopoverSurface></View>
    </View>}
    {capture.phase === "selection" && capture.image && <ScreenshotSelection image={capture.image} error={capture.error} />}
    {capture.phase === "editor" && capture.image && <ScreenshotEditor image={capture.image} strokes={capture.strokes} error={capture.error} />}
  </View>;
}
