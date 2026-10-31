import { PowerUp, hex, ink, Surface, useTheme } from "../ui";
import { TOOLBAR_ROWS } from "../../lib/toolbarRow";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useWindow, useWindowId } from "../../state/browser/hooks";
import { useCardAnchors } from "../../state/windows/layout";
import { NewTabExtras } from "./NewTabExtras";
import { IncognitoHeading } from "./IncognitoHeading";
import { DIA_OFFSET, newTabBarTop } from "./newTabLayout";
import { useOnboarding } from "../../state/onboarding/onboarding";
import { Omnibox } from "../omnibox/Omnibox";
import { ContextMenuArea } from "../ui";
import { openPageMenu } from "../../state/pages/contextMenu";
import { NTP_BAR } from "./tokens";

const BAR_HEIGHT = 112;
type Size = { width: number; height: number };
let lastSize: { card: Size; size: Size } | null = null;
const introPlayed = new Set<string>();


function sameSize(a: Size, b: Size) {
  return a.width === b.width && a.height === b.height;
}

export function barWidth(viewWidth: number) {
  const content = viewWidth < 708 ? (viewWidth <= 636 ? viewWidth - 20 : 616) : viewWidth < 1700 ? 652 : 774;
  return Math.min(content, viewWidth - 28);
}

export function NewTabPage({ tabId, toolbar = true }: { tabId: string; toolbar?: boolean }) {
  const theme = useTheme();
  const windowId = useWindowId();
  const incognito = useWindow(windowId, (w) => w?.kind === "private");
  const onboarding = useOnboarding((s) => s.windowId === windowId);
  const card = useCardAnchors((s) => s[windowId]);
  const [size, setSizeState] = useState<Size | null>(() => (lastSize && (!card || sameSize(lastSize.card, card)) ? lastSize.size : null));
  const setSize = (next: Size) => setSizeState((prev) => (prev && sameSize(prev, next) ? prev : next));
  useEffect(() => {
    if (size && card) lastSize = { card: { width: card.width, height: card.height }, size };
  }, [size, card?.width, card?.height]);
  const [panelHeight, setPanelHeight] = useState(BAR_HEIGHT);
  const [headingHeight, setHeadingHeight] = useState(0);
  const heading = !onboarding && incognito;
  const [playIntro] = useState(() => !introPlayed.has(tabId));
  useEffect(() => {
    introPlayed.add(tabId);
  }, [tabId]);

  if (!size) return <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)} />;

  const width = barWidth(size.width);
  const x = Math.max(size.width / 2 - width / 2, 14) + DIA_OFFSET;
  const under = toolbar ? 0 : TOOLBAR_ROWS.regular.height;
  const top = newTabBarTop(size.height, under, heading ? headingHeight : 0);

  const bar = { x, y: top, width, height: panelHeight };

  return (
    <ContextMenuArea style={{ flex: 1 }} onContextMenu={() => void openPageMenu()}>
    <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {playIntro && theme.powerUpPalette && (
        <PowerUp
          style={StyleSheet.absoluteFill}
          palette={theme.powerUpPalette}
          speed={1}
          origin={0.5}
          cornerRadius={NTP_BAR.radius}
          halo={bar}
        />
      )}
      {heading && <IncognitoHeading left={x} barTop={top} width={width} onHeight={setHeadingHeight} />}
      <View onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)} style={{ position: "absolute", left: x, top, width }}>
        {NTP_BAR.shadows.map((level, i) => (
          <Surface
            key={i}
            style={StyleSheet.absoluteFill}
            fill={ink.clear}
            cornerRadius={NTP_BAR.radius}
            shadowColor={level.color}
            shadowOpacity={level.opacity}
            shadowRadius={level.radius}
            shadowOffset={level.offset}
          />
        ))}
        <Surface fill={hex(theme.ntpBarSolid)} cornerRadius={NTP_BAR.radius} style={{ padding: NTP_BAR.contentInset }}>
          {onboarding ? <View style={{ height: BAR_HEIGHT - 2 * NTP_BAR.contentInset }} /> : <Omnibox variant="hero" tabId={tabId} />}
          <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, borderRadius: NTP_BAR.radius, borderWidth: NTP_BAR.border, borderColor: theme.ntpBarBorder }} />
        </Surface>
      </View>
      <NewTabExtras size={size} bar={bar} />
    </View>
    </ContextMenuArea>
  );
}
