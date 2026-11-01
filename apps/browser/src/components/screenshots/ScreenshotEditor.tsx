import { radius, space } from "../ui/tokens";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ScreenshotImage, ScreenshotStroke } from "../../state/screenshots/types";
import { closeScreenshot, outputScreenshot, setScreenshotStrokes } from "../../state/screenshots/actions";
import { useSettings } from "../../state/browser/hooks";
import { updateSettings } from "../../state/settings/actions";
import { Button, PopoverSurface, ScreenshotCanvas, ScreenshotColor } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";
import { screenshotColor } from "./tokens";

export function ScreenshotEditor({ image, strokes, error }: { image: ScreenshotImage; strokes: ScreenshotStroke[]; error?: string }) {
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const [mode, setMode] = useState<"marker" | "highlighter">("marker");
  const marker = useSettings((s) => s.screenshotMarkerColor);
  const highlighter = useSettings((s) => s.screenshotHighlighterColor);
  const color = screenshotColor(mode === "marker" ? marker : highlighter);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [saving, setSaving] = useState(false);
  const scale = Math.min(Math.max(1, size.width - 48) / image.width, Math.max(1, size.height - 48) / image.height, 1) * zoom;
  const chooseColor = (value: string) => updateSettings(mode === "marker" ? { screenshotMarkerColor: value } : { screenshotHighlighterColor: value });
  const output = (format: "png" | "pdf" | "clipboard") => { setSaving(true); void outputScreenshot(format).finally(() => setSaving(false)); };
  return <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
    <Pressable accessibilityLabel="Close screenshot editor" onPress={closeScreenshot} style={[StyleSheet.absoluteFill, { backgroundColor: PAGE3.dim }]} />
    <View style={{ width: "90%", height: "88%", maxWidth: 1100 }}><PopoverSurface style={{ flex: 1, overflow: "hidden" }}>
      <View style={{ minHeight: 56, paddingHorizontal: space.xl, flexDirection: "row", alignItems: "center", gap: space.m, flexWrap: "wrap" }}>
        <Text style={{ ...PAGE3.type.heading, fontWeight: "600", color: colors.primary, marginRight: space.l }}>Screenshot</Text>
        {(["marker", "highlighter"] as const).map((tool) => <Pressable key={tool} accessibilityRole="button" accessibilityLabel={tool === "marker" ? "Marker" : "Highlighter"} accessibilityState={{ selected: mode === tool }} onPress={() => setMode(tool)} style={{ paddingVertical: space.m, paddingHorizontal: space.l, borderRadius: PAGE3.dockRadius, backgroundColor: mode === tool ? colors.subtle : undefined }}><Text style={{ ...PAGE3.type.label, fontWeight: mode === tool ? "600" : "400", color: colors.primary }}>{tool === "marker" ? "Marker" : "Highlighter"}</Text></Pressable>)}
        {PAGE3[mode].map((preset) => <Pressable key={preset} accessibilityRole="button" accessibilityLabel={`${mode} ${preset}`} accessibilityState={{ selected: preset.toLowerCase() === color.toLowerCase() }} onPress={() => chooseColor(preset)} style={{ width: 24, height: 24, borderRadius: radius.chrome, borderWidth: preset.toLowerCase() === color.toLowerCase() ? 3 : 1, borderColor: colors.border, backgroundColor: preset }} />)}
        <ScreenshotColor accessibilityLabel="Custom color wheel" color={color} onColor={(e) => chooseColor(e.nativeEvent.color)} style={{ width: 28, height: 28 }} />
        <Button variant="icon" icon="arrow.uturn.backward" tooltip="Undo" disabled={!strokes.length} onPress={() => setScreenshotStrokes(strokes.slice(0, -1))} />
        <View style={{ flex: 1 }} />
        <Button variant="icon" icon="minus.magnifyingglass" tooltip="Zoom Out" disabled={zoom <= 0.25} onPress={() => setZoom(Math.max(0.25, zoom - 0.25))} />
        <Text style={{ ...PAGE3.type.caption, color: colors.secondary }}>{Math.round(zoom * 100)}%</Text>
        <Button variant="icon" icon="plus.magnifyingglass" tooltip="Zoom In" disabled={zoom >= 4} onPress={() => setZoom(Math.min(4, zoom + 0.25))} />
        <Button variant="close" look="panel" onPress={closeScreenshot} />
      </View>
      <View onLayout={(e) => setSize(e.nativeEvent.layout)} style={{ flex: 1, backgroundColor: colors.canvas }}>
        <ScrollView horizontal centerContent contentContainerStyle={{ flexGrow: 1 }}><ScrollView centerContent contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: space.xxxl }}>
          <ScreenshotCanvas image={image.data} strokes={strokes} color={color} highlighter={mode === "highlighter"} onStroke={(e) => setScreenshotStrokes([...strokes, e.nativeEvent])} style={{ width: image.width * scale, height: image.height * scale }} />
        </ScrollView></ScrollView>
      </View>
      {error && <Text accessibilityRole="alert" style={{ ...PAGE3.type.caption, color: theme.destructive, padding: space.m }}>{error}</Text>}
      <View style={{ minHeight: 64, flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center", padding: space.xl, gap: space.l }}>
        <Button title="Save as image" disabled={saving} onPress={() => output("png")} />
        <Button title="Save as PDF" disabled={saving} onPress={() => output("pdf")} />
        <Button title="Copy to clipboard" kind="primary" disabled={saving} onPress={() => output("clipboard")} />
      </View>
    </PopoverSurface></View>
  </View>;
}
