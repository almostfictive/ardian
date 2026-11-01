import { space, POPOVER_WIDTH } from "../ui/tokens";
import { incognitoOriginal } from "../../state/browser/model";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useProfileOrder, useProfileRecords } from "../../state/profiles/hooks";

import { useWindow, useWindowId } from "../../state/browser/hooks";
import { useProfilePopover, closeProfilePopover } from "../../state/sidebar/profilePopover";
import { runCommand } from "../../state/commands/commands";
import { switchProfile } from "../../state/browser/actions";
import { requestCreateProfile } from "../../state/profiles/createProfileRequest";
import { MenuRow, MenuSeparator, PANEL, PopoverSurface, Symbol } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export function ProfilePopover() {
  const windowId = useWindowId();
  const open = useProfilePopover((s) => s.windowId === windowId);
  return open ? <ProfilePopoverContent windowId={windowId} /> : null;
}
function ProfilePopoverContent({ windowId }: { windowId: string }) {
  const theme = useTheme();
  const profileId = useWindow(windowId, (w) => w?.profileId);
  const privateWindow = useWindow(windowId, (w) => w?.kind === "private");
  const expanded = useWindow(windowId, (w) => w?.sidebarOpen);
  const profileOrder = useProfileOrder();
  const profileRecords = useProfileRecords();
  const profiles = profileOrder.map((id) => profileRecords[id]!).filter(Boolean);
  const keys = useRef<View>(null);
  useEffect(() => keys.current?.focus(), []);
  const command = (name: Parameters<typeof runCommand>[0]["command"]) => { closeProfilePopover(); runCommand({ command: name, arg: name === "newWindow" ? (privateWindow && profileId ? incognitoOriginal(profileId) : profileId) ?? null : null, windowId }); };
  const entries: { key: string; title: string; icon: string; checked?: boolean; disabled?: boolean; run: () => void }[] = [
    { key: "new-window", title: "New Window", icon: "macwindow.badge.plus", run: () => command("newWindow") },
    { key: "new-private-window", title: "New Private Window", icon: "eye.slash", run: () => command("newIncognitoWindow") },
    ...profiles.map((p) => ({ key: p.id, title: p.name, icon: "person.crop.circle", checked: p.id === profileId, disabled: privateWindow, run: () => { closeProfilePopover(); switchProfile(windowId, p.id); } })),
    { key: "add-profile", title: "Add Profile", icon: "person.badge.plus", run: () => { closeProfilePopover(); void requestCreateProfile(windowId); } },
    { key: "history", title: "History", icon: "clock", run: () => command("showHistory") },
    { key: "settings", title: "Settings", icon: "gearshape", run: () => command("openSettings") },
  ];
  return <View style={StyleSheet.absoluteFill}>
    <Pressable accessibilityLabel="Close profile menu" style={StyleSheet.absoluteFill} onPress={closeProfilePopover} />
    <View ref={keys} focusable enableFocusRing={false} keyDownEvents={[{ key: "Escape" }]} onKeyDown={(e) => { if (e.nativeEvent.key === "Escape") closeProfilePopover(); }} style={{ position: "absolute", bottom: PAGE3.rowHeight, left: expanded ? space.l : PAGE3.collapsed + space.s, width: POPOVER_WIDTH.s, maxHeight: "85%" }}>
      <PopoverSurface style={{ overflow: "hidden", paddingVertical: space.m }}><ScrollView style={{ flexGrow: 0 }}>
        {entries.map((entry, index) => <View key={entry.key}>{index === 2 || entry.key === "history" ? <MenuSeparator /> : null}<MenuRow icon={entry.icon} title={entry.title} disabled={entry.disabled} selected={entry.checked} onPress={entry.run} accessory={entry.checked ? <Symbol name="checkmark" size={PANEL.iconSize} color={theme.textPrimary} style={{ width: PANEL.iconSlot, height: PANEL.iconSlot }} /> : undefined} /></View>)}
      </ScrollView></PopoverSurface>
    </View>
  </View>;
}
