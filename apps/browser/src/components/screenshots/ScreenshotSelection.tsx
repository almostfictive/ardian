import { useMemo, useRef, useState } from "react";
import { Image, PanResponder, Text, View } from "react-native";
import type { ScreenshotImage } from "../../state/screenshots/types";
import { captureSelection } from "../../state/screenshots/actions";
import { Button } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";

type Point = { x: number; y: number };
export function ScreenshotSelection({ image, error }: { image: ScreenshotImage; error?: string }) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selection, setSelection] = useState<{ start: Point; end: Point } | null>(null);
  const [ready, setReady] = useState(false);
  const start = useRef<Point>({ x: 0, y: 0 });
  const scale = Math.min(Math.max(1, size.width - 64) / image.width, Math.max(1, size.height - 100) / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;
  const bounds = useRef({ width, height });
  bounds.current = { width, height };
  const point = (x: number, y: number) => ({ x: Math.max(0, Math.min(bounds.current.width, x)), y: Math.max(0, Math.min(bounds.current.height, y)) });
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { start.current = point(e.nativeEvent.locationX, e.nativeEvent.locationY); setReady(false); setSelection({ start: start.current, end: start.current }); },
    onPanResponderMove: (_, gesture) => setSelection({ start: start.current, end: point(start.current.x + gesture.dx, start.current.y + gesture.dy) }),
    onPanResponderRelease: (_, gesture) => { const end = point(start.current.x + gesture.dx, start.current.y + gesture.dy); setSelection({ start: start.current, end }); setReady(Math.abs(end.x - start.current.x) >= 4 && Math.abs(end.y - start.current.y) >= 4); },
    onPanResponderTerminate: () => { setReady(false); setSelection(null); },
  }), []);
  const rect = selection ? { left: Math.min(selection.start.x, selection.end.x), top: Math.min(selection.start.y, selection.end.y), width: Math.abs(selection.end.x - selection.start.x), height: Math.abs(selection.end.y - selection.start.y) } : { left: 0, top: 0, width: 0, height: 0 };
  return <View onLayout={(e) => setSize(e.nativeEvent.layout)} style={{ flex: 1, backgroundColor: PAGE3.dim, alignItems: "center", justifyContent: "center" }}>
    <View style={{ width, height }}>
    <View {...responder.panHandlers} accessibilityLabel="Drag to select a screenshot area. Press Escape to cancel." style={{ width, height, cursor: "crosshair" }}>
      <Image source={{ uri: `data:image/png;base64,${image.data}` }} style={{ width, height }} />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: rect.top, backgroundColor: PAGE3.dim }} />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: rect.top + rect.height, bottom: 0, backgroundColor: PAGE3.dim }} />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, top: rect.top, width: rect.left, height: rect.height, backgroundColor: PAGE3.dim }} />
      <View pointerEvents="none" style={{ position: "absolute", left: rect.left + rect.width, right: 0, top: rect.top, height: rect.height, backgroundColor: PAGE3.dim }} />
      {selection && <View pointerEvents="none" style={{ position: "absolute", ...rect, borderWidth: 2, borderColor: PAGE3.selection }} />}
    </View>
    {ready && <View style={{ position: "absolute", left: Math.max(0, Math.min(width - 180, rect.left + rect.width / 2 - 90)), top: Math.min(height + 8, rect.top + rect.height + 8) }}><Button title="Capture screenshot" kind="primary" onPress={() => void captureSelection([rect.left / width, rect.top / height, rect.width / width, rect.height / height])} /></View>}
    </View>
    {!ready && <Text style={{ ...PAGE3.type.label, color: PAGE3.railText, marginTop: 16 }}>Drag to select an area · Esc to cancel</Text>}
    {error && <Text style={{ color: theme.destructive }}>{error}</Text>}
  </View>;
}
