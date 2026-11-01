import { space } from "../ui/tokens";
import { incognitoOriginal } from "../../state/browser/model";
import { useHover } from "../ui/useHover";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useProfileOrder, useProfileRecords } from "../../state/profiles/hooks";

import { useWindow, useWindowId } from "../../state/browser/hooks";
import { useProfilePopover, closeProfilePopover } from "../../state/sidebar/profilePopover";
import { runCommand } from "../../state/commands/commands";
import { switchProfile } from "../../state/browser/actions";
import { requestCreateProfile } from "../../state/profiles/createProfileRequest";
import { PopoverSurface, Symbol } from "../ui";
import { PAGE3 } from "../ui/tokens";
import { useTheme } from "../ui/theme";

export function ProfilePopover() {
  const windowId = useWindowId();
  const open = useProfilePopover((s) => s.windowId === windowId);
  return open ? <ProfilePopoverContent windowId={windowId} /> : null;
}
function ProfilePopoverContent({ windowId }: { windowId: string }) {
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const profileId = useWindow(windowId, (w) => w?.profileId);
  const privateWindow = useWindow(windowId, (w) => w?.kind === "private");
  const expanded = useWindow(windowId, (w) => w?.sidebarOpen);
  const profileOrder = useProfileOrder();
  const profileRecords = useProfileRecords();
  const profiles = profileOrder.map((id) => profileRecords[id]!).filter(Boolean);
  const keys = useRef<View>(null);
  useEffect(() => keys.current?.focus(), []);
  const command = (name: Parameters<typeof runCommand>[0]["command"]) => { closeProfilePopover(); runCommand({ command: name, arg: name === "newWindow" ? (privateWindow && profileId ? incognitoOriginal(profileId) : profileId) ?? null : null, windowId }); };
  const entries = [
    { key: "new-window", title: "New Window", icon: "macwindow.badge.plus", run: () => command("newWindow") },
    { key: "new-private-window", title: "New Private Window", icon: "eye.slash", run: () => command("newIncognitoWindow") },
    ...profiles.map((p) => ({ key: p.id, title: p.name, icon: "person.crop.circle", checked: p.id === profileId, disabled: privateWindow, run: () => { closeProfilePopover(); switchProfile(windowId, p.id); } })),
    { key: "add-profile", title: "Add Profile", icon: "person.badge.plus", run: () => { closeProfilePopover(); void requestCreateProfile(windowId); } },
    { key: "history", title: "History", icon: "clock", run: () => command("showHistory") },
    { key: "settings", title: "Settings", icon: "gearshape", run: () => command("openSettings") },
  ];
  return <View style={StyleSheet.absoluteFill}>
    <Pressable accessibilityLabel="Close profile menu" style={StyleSheet.absoluteFill} onPress={closeProfilePopover} />
    <View ref={keys} focusable enableFocusRing={false} keyDownEvents={[{ key: "Escape" }]} onKeyDown={(e) => { if (e.nativeEvent.key === "Escape") closeProfilePopover(); }} style={{ position: "absolute", bottom: 46, left: expanded ? 12 : 68, width: PAGE3.panelWidth, maxHeight: "85%" }}>
      <PopoverSurface style={{ overflow: "hidden" }}><ScrollView style={{ flexGrow: 0 }}>
        {entries.map((entry) => <ProfileMenuRow key={entry.key} entry={entry} />)}
      </ScrollView></PopoverSurface>
    </View>
  </View>;
}

type ProfileEntry = { key: string; title: string; icon: string; run: () => void; checked?: boolean; disabled?: boolean };
function ProfileMenuRow({ entry }: { entry: ProfileEntry }) {
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  const { hovered, hoverProps } = useHover();
  return <View {...hoverProps}><Pressable disabled={entry.disabled} accessibilityRole="menuitem" accessibilityLabel={entry.title} accessibilityState={{ selected: entry.checked, disabled: entry.disabled }} onPress={entry.run} style={{ height: PAGE3.rowHeight, paddingHorizontal: space.xl, flexDirection: "row", alignItems: "center", gap: space.l, backgroundColor: hovered && !entry.disabled ? colors.subtle : undefined, opacity: entry.disabled ? 0.45 : 1 }}>
    <Symbol name={entry.icon} size={17} color={colors.primary} style={{ width: 20, height: 20 }} />
    <Text style={{ flex: 1, ...PAGE3.type.body, color: colors.primary }}>{entry.title}</Text>
    {entry.checked && <Symbol name="checkmark" size={13} color={colors.primary} style={{ width: 16, height: 16 }} />}
  </Pressable></View>;
}
