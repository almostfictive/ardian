import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";
import { WebView, Box, Button, Symbol, Text, type WebViewHandle } from "../ui";
import { curve, duration } from "../ui/motion";
import { layout, useTheme } from "../ui/theme";
import { space } from "../ui/tokens";
import { useSettings, useWindow, useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { useBrowser as useBrowserStore } from "../../state/browser/store";
import { engineProfile } from "../../state/browser/model";
import { openFromPage, pageProfileId } from "../../state/tabs/openFromPage";
import { closeMiniApp, MINI_APPS, useMiniApps } from "../../state/sidebar/miniApps";
import { updateSettings } from "../../state/settings/actions";
import { SIDE_PANEL_HEADER_PAD_RIGHT } from "../extensions/tokens";

const MIN_WIDTH = 320;
const MAX_WIDTH = 720;
const HEADER = 40;

const clamp = (width: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));

export function MiniAppsPanel() {
  const windowId = useWindowId();
  const active = useMiniApps((state) => state.active[windowId]);
  const activeEnabled = useSettings((settings) => !active || settings.sidebarMiniApps.includes(active));
  const privateWindow = useWindow(windowId, (window) => window?.kind === "private");
  const savedWidth = useSettings((settings) => settings.miniAppSidePanelWidth ?? 420);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const appear = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(active);

  useEffect(() => {
    if (active && !activeEnabled) closeMiniApp(windowId);
  }, [active, activeEnabled, windowId]);

  useEffect(() => {
    if (active) setShown(active);
    Animated.timing(appear, {
      toValue: active ? 1 : 0,
      duration: duration.fade,
      easing: curve.outCubic,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !active) setShown(undefined);
    });
  }, [!!active]);

  const width = dragWidth ?? savedWidth;
  const start = useRef(width);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          start.current = useBrowserStore.getState().settings.miniAppSidePanelWidth ?? 420;
          setDragWidth(start.current);
        },
        onPanResponderMove: (_, gesture) => setDragWidth(clamp(start.current - gesture.dx)),
        onPanResponderRelease: (_, gesture) => {
          updateSettings({ miniAppSidePanelWidth: clamp(start.current - gesture.dx) });
          setDragWidth(null);
        },
        onPanResponderTerminate: () => setDragWidth(null),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  if (privateWindow || !shown) return null;
  const room = width + layout.cardInset;
  return (
    <Animated.View style={{ width: appear.interpolate({ inputRange: [0, 1], outputRange: [0, room] }), overflow: "hidden" }}>
      <Animated.View style={{ position: "absolute", top: 0, bottom: 0, right: 0, width, opacity: appear }}>
        <MiniAppCard key={`${shown}|${windowId}`} windowId={windowId} app={shown} />
        <View
          {...responder.panHandlers}
          onDoubleClick={() => updateSettings({ miniAppSidePanelWidth: 420 })}
          style={{ position: "absolute", top: 0, bottom: 0, left: -3, width: 7, cursor: "col-resize" }}
        />
      </Animated.View>
    </Animated.View>
  );
}

function MiniAppCard({ windowId, app }: { windowId: string; app: keyof typeof MINI_APPS }) {
  const theme = useTheme();
  const profileId = useWindowProfileId();
  const profile = useBrowserStore((state) => engineProfile(state, profileId));
  const definition = MINI_APPS[app];
  const web = useRef<WebViewHandle>(null);
  const [url, setUrl] = useState<string>(definition.url);

  return (
    <View style={{ flex: 1, borderRadius: layout.cardRadius, overflow: "hidden", backgroundColor: theme.card }}>
      <Box row gap="m" style={HEADER_ROW}>
        <Symbol name={definition.icon} size={14} color={theme.textPrimary} style={{ width: 18, height: 18 }} />
        <Text numberOfLines={1} weight="medium" style={{ flex: 1 }}>
          {definition.title}
        </Text>
        <Button variant="icon" icon="arrow.clockwise" size={13} tooltip="Reload App" onPress={() => void web.current?.reload()} />
        <Button
          variant="icon"
          icon="arrow.up.right"
          size={13}
          tooltip="Open in Tab"
          onPress={() => {
            openFromPage({ url, disposition: "foreground" }, { windowId, profileId: pageProfileId(windowId, profile) });
            closeMiniApp(windowId);
          }}
        />
        <Button variant="icon" icon="xmark" size={12} weight="medium" tooltip="Close App Panel" onPress={() => closeMiniApp(windowId)} />
      </Box>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.divider }} />
      <View style={{ flex: 1, backgroundColor: theme.panel }}>
        <WebView
          ref={web}
          style={StyleSheet.absoluteFill}
          url={definition.url}
          profile={profile}
          standalone
          pageBackgroundColor={theme.panel}
          contentsBackgroundColor={theme.panel}
          onNavigationChange={(navigation) => {
            if (navigation.url) setUrl(navigation.url);
          }}
          onWindowClose={() => closeMiniApp(windowId)}
          onOpenWindow={(request) => openFromPage(request, { windowId, profileId: pageProfileId(windowId, profile) })}
        />
      </View>
    </View>
  );
}

const HEADER_ROW = { height: HEADER, alignItems: "center", paddingLeft: space.l, paddingRight: SIDE_PANEL_HEADER_PAD_RIGHT } as const;
