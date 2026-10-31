import { StyleSheet, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { tourAnchorRef } from "../onboarding/tour/anchors";
import { ReleaseNotesPage } from "./Postcard";
import { closeReleaseNotes, useReleaseNotesPage } from "../../state/releaseNotes/releaseNotes";

export type Frame = { x: number; y: number; width: number; height: number };

export function NewTabExtras({ size, bar }: { size: { width: number; height: number }; bar: Frame }) {
  const windowId = useWindowId();
  const page = useReleaseNotesPage(windowId);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View ref={tourAnchorRef(windowId, "page")} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View ref={tourAnchorRef(windowId, "commandBar")} style={{ position: "absolute", left: bar.x, top: bar.y, width: bar.width, height: bar.height }} pointerEvents="none" />
      {page ? <ReleaseNotesPage notes={page} size={size} onClose={closeReleaseNotes} /> : null}
    </View>
  );
}
