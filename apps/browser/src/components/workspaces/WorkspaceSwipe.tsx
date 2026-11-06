import { useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { switchWorkspace, useActiveWorkspace, useWorkspaces } from "../../state/workspaces/actions";
import { SwipeArea, type SwipeEvent } from "../ui";

export function WorkspaceSwipe() {
  const windowId = useWindowId();
  const profileId = useWindowProfileId();
  const workspaces = useWorkspaces(windowId);
  const selected = useActiveWorkspace(windowId);
  const index = workspaces.findIndex((workspace) => workspace.id === selected);
  const [ack, setAck] = useState(0);
  const wheel = useRef({ sum: 0, last: 0, trigger: 0 });
  const nativePager = useMemo(() => ({ key: `workspaces:${windowId}:${profileId}`, selected: Math.max(0, index), count: workspaces.length, order: workspaces.map((workspace) => workspace.id), ack }), [windowId, profileId, index, workspaces, ack]);
  const onSwipe = (event: SwipeEvent) => {
    if (!event.available) return;
    let delta = event.direction === "back" ? -1 : 1;
    if (event.phase === "wheel") {
      const now = Date.now();
      const state = wheel.current;
      if (now - state.trigger <= 250) return;
      if (now - state.last > 49) state.sum = 0;
      state.last = now;
      state.sum += delta * event.distance;
      if (Math.abs(state.sum) <= 1) return;
      delta = state.sum < 0 ? -1 : 1;
      state.sum = 0;
      state.trigger = now;
    } else if (event.phase !== "swipe") return;
    const target = workspaces[index + delta];
    if (target) switchWorkspace(windowId, target.id);
  };
  return <SwipeArea style={StyleSheet.absoluteFill} canSwipeBack={index > 0} canSwipeForward={index >= 0 && index < workspaces.length - 1} tracksUnavailableDirections isPager nativePager={nativePager} onPagerState={(event) => {
    setAck(event.sequence);
    const target = workspaces.find((workspace) => workspace.id === event.profileId);
    if (event.phase === "selected" && target) switchWorkspace(windowId, target.id);
  }} onSwipe={onSwipe} />;
}
