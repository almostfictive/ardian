import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../ui/theme";
import { useSettings, useTab, useTabLive } from "../../state/browser/hooks";
import { useBrowserWhile, useStoreWhile } from "../../state/tabs/tabWatch";
import type { ToolbarGeometry } from "../window/geometry";
import { toolbarPalette, useEasedColor } from "../ui/toolbarColors";
import { useToolbarHeld } from "../../state/app/transientUi";
import { revealToolbar, setToolbarPeek, STRIP_HEIGHT, toolbarMode, useToolbarAutoHide, type ToolbarMode } from "../../state/windows/toolbarAutoHide";
import { Toolbar } from "./Toolbar";
import { curve } from "../ui/motion";
import { Divider, Panel, reduceMotion } from "../ui";
import { ADDRESS_BAR, TOOLBAR_FADE, TOOLBAR_MOTION } from "./tokens";
import { motionStep, tallPage, type MotionValue, type TallPage } from "./toolbarMotion";
import { useToolbarRow } from "./useToolbarRow";

const HIDE_MS = TOOLBAR_MOTION.hide;
const HIDE_EASING = curve.enter;
const SHOW_MS = TOOLBAR_MOTION.show;
const SHOW_EASING = curve.enter;
const PEEK_DELAY = 150;
const UNPEEK_DELAY = 250;

export function useToolbarMode(tabId: string, windowId: string, enabled: boolean): ToolbarMode {
  const scrolledDown = useStoreWhile(useToolbarAutoHide, enabled, (s) => !!s.scrolledDown[tabId]);
  const down = enabled && scrolledDown;
  const peek = useStoreWhile(useToolbarAutoHide, down, (s) => !!s.peek[tabId]);
  const hasPage = useBrowserWhile(down, (s) => !!s.tabs[tabId]?.url);
  const held = useToolbarHeld(windowId, tabId, down);
  return toolbarMode({ enabled, hasPage, scrolledDown, peek, needsBar: held });
}

type ToolbarMotion = {
  bar: Animated.Value;
  fade: Animated.Value;
  groupStyle: Animated.WithAnimatedValue<ViewStyle>;
  pageHeight: number;
  bottomStyle: Animated.WithAnimatedValue<ViewStyle>;
};

export function useToolbarMotion({
  enabled,
  mode,
  height,
  extra,
  doc,
}: {
  enabled: boolean;
  mode: ToolbarMode;
  height: number;
  extra: number;
  doc: string;
}): ToolbarMotion {
  const collapsed = mode !== "shown";
  const shownTop = useToolbarRow().height + extra;
  const room = shownTop;
  const [tallState, setTall] = useState<TallPage>({ on: collapsed, doc });
  const tall = tallPage(tallState, { enabled, collapsed, doc });
  if (tall !== tallState) setTall(tall);
  const latest = useRef({ collapsed, doc });
  latest.current = { collapsed, doc };
  const fitShownPage = () => {
    if (!latest.current.collapsed) setTall({ on: false, doc: latest.current.doc });
  };

  const values = useRef<Record<MotionValue, Animated.Value>>(null as never);
  const initial = useRef({ page: collapsed ? 1 : 0, bar: mode === "collapsed" ? 1 : 0 }).current;
  if (!values.current) {
    values.current = {
      page: new Animated.Value(initial.page),
      laid: new Animated.Value(initial.page),
      bar: new Animated.Value(initial.bar),
      fade: new Animated.Value(initial.bar),
    };
    const { page, bar, fade } = values.current;
    for (const a of [page, bar, fade]) a.addListener(() => {});
  }
  const v = values.current;
  const bottomShift = useMemo(() => (tall.on ? Animated.multiply(Animated.subtract(v.page, 1), room) : 0), [tall.on, room]);
  useEffect(() => {
    const keep = (a: Animated.Value, value: number) => Animated.timing(a, { toValue: value, duration: TOOLBAR_MOTION.settle, useNativeDriver: true });
    Animated.parallel([keep(v.page, initial.page), keep(v.laid, initial.page), keep(v.bar, initial.bar), keep(v.fade, initial.bar)]).start();
  }, []);
  const was = useRef(mode);
  useLayoutEffect(() => {
    const reduced = reduceMotion() === true;
    const step = motionStep(was.current, mode, reduced);
    was.current = mode;
    if (!step) return;
    for (const [name, value] of Object.entries(step.set)) v[name as MotionValue].setValue(value);
    if (reduced && step.glide.fade !== undefined) v.fade.setValue(step.glide.fade);
    const glides = Object.entries(step.glide)
      .filter(([name]) => !(reduced && name === "fade"))
      .map(([name, value]) => Animated.timing(v[name as MotionValue], {
        toValue: value,
        duration: name === "fade" ? TOOLBAR_MOTION.hide : step.show ? SHOW_MS : HIDE_MS,
        easing: name === "fade" ? curve.linear : step.show ? SHOW_EASING : HIDE_EASING,
        useNativeDriver: true,
      }));
    if (glides.length) Animated.parallel(glides).start(({ finished }) => finished && step.fit === "afterGlide" && fitShownPage());
    if (step.fit === "now") fitShownPage();
  }, [mode]);

  return {
    bar: v.bar,
    fade: v.fade,
    groupStyle: {
      position: "absolute",
      left: 0,
      right: 0,
      top: (collapsed ? 0 : shownTop) - extra,
    },
    pageHeight: height - (tall.on ? 0 : shownTop),
    bottomStyle: { transform: [{ translateY: bottomShift }] },
  };
}

function useMovedOnce(mode: ToolbarMode) {
  const [moved, setMoved] = useState(mode !== "shown");
  if (!moved && mode !== "shown") setMoved(true);
  return moved;
}

export function AutoHideBackdrop({ tabId, mode, motion }: { tabId: string; mode: ToolbarMode; motion: Pick<ToolbarMotion, "bar"> }) {
  const theme = useTheme();
  const url = useTab(tabId, (t) => t?.url ?? "");
  const themeColor = useTabLive(tabId, (l) => l.themeColor);
  const extendColor = useSettings((s) => s.extendWebsiteColor);
  const palette = toolbarPalette(theme, extendColor && url ? themeColor : null);
  const band = useEasedColor(palette.background);
  const { bar } = motion;
  const H = useToolbarRow().height;
  const moved = useMovedOnce(mode);
  const anim = useMemo(
    () =>
      moved && {
        bandScale: bar.interpolate({ inputRange: [0, 1], outputRange: [1, STRIP_HEIGHT / H] }),
        bandLift: bar.interpolate({ inputRange: [0, 1], outputRange: [0, -(H - STRIP_HEIGHT) / 2] }),
        dividerTop: bar.interpolate({ inputRange: [0, 1], outputRange: [0, -(H - STRIP_HEIGHT)] }),
      },
    [moved, bar, H],
  );
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: H }}>
      <Animated.View
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: H, backgroundColor: theme.card, transform: anim ? [{ translateY: anim.bandLift }, { scaleY: anim.bandScale }] : undefined }}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: band }]} />
      </Animated.View>
      {url ? (
        <Animated.View style={{ position: "absolute", left: 0, right: 0, top: H - 1, height: 1, justifyContent: "flex-end", transform: anim ? [{ translateY: anim.dividerTop }] : undefined }}>
          <Divider color={palette.divider} />
        </Animated.View>
      ) : null}
    </View>
  );
}

export function AutoHideToolbar({
  tabId,
  windowId,
  geometry,
  inSplit,
  focused,
  mode,
  motion,
}: {
  tabId: string;
  windowId: string;
  geometry: ToolbarGeometry;
  inSplit: boolean;
  focused: boolean;
  mode: ToolbarMode;
  motion: Pick<ToolbarMotion, "bar" | "fade">;
}) {
  const theme = useTheme();
  const url = useTab(tabId, (t) => t?.url ?? "");
  const themeColor = useTabLive(tabId, (l) => l.themeColor);
  const extendColor = useSettings((s) => s.extendWebsiteColor);
  const palette = toolbarPalette(theme, extendColor && url ? themeColor : null);
  const collapsed = mode === "collapsed";
  const modeNow = useRef(mode);
  modeNow.current = mode;

  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(peekTimer.current), [tabId]);
  const peekLater = (on: boolean, ms: number) => {
    clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setToolbarPeek(tabId, on), ms);
  };

  const { bar, fade } = motion;
  const H = useToolbarRow().height;
  const moved = useMovedOnce(mode);
  const anim = useMemo(
    () =>
      moved && {
        controls: fade.interpolate(TOOLBAR_FADE),
      },
    [moved, bar, fade, H],
  );

  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: H }}>
      <Animated.View
        pointerEvents={collapsed ? "none" : "box-none"}
        onMouseEnter={() => modeNow.current === "peek" && clearTimeout(peekTimer.current)}
        onMouseLeave={() => modeNow.current === "peek" && peekLater(false, UNPEEK_DELAY)}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: H, opacity: anim ? anim.controls : 1 }}
      >
        <Panel pointerEvents="none" fill={theme.dark ? ADDRESS_BAR.fill.dark : ADDRESS_BAR.fill.light} radius={ADDRESS_BAR.radius} material="popover" materialAppearance="light" border={theme.dark ? ADDRESS_BAR.border.dark : ADDRESS_BAR.border.light} borderWidth={0.5} shadow={ADDRESS_BAR.shadow} style={{ position: "absolute", top: 2, left: 2, right: 2, height: ADDRESS_BAR.height }} />
        <Toolbar tabId={tabId} geometry={geometry} windowId={windowId} inSplit={inSplit} focused={focused} bare />
      </Animated.View>
      {anim && (
        <Animated.View pointerEvents={collapsed ? "auto" : "none"} style={{ position: "absolute", left: 0, right: 0, top: 0, height: STRIP_HEIGHT, opacity: 1 }}>
          <Pressable
            onPress={() => {
              clearTimeout(peekTimer.current);
              revealToolbar(tabId);
            }}
            onMouseEnter={() => modeNow.current === "collapsed" && peekLater(true, PEEK_DELAY)}
            onMouseLeave={() => modeNow.current === "collapsed" && clearTimeout(peekTimer.current)}
            tooltip="Show Toolbar"
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
}
