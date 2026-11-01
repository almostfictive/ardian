import { useState } from "react";
import { Pressable, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { currentProfiles } from "../../state/browser/current";
import { createProfile } from "../../state/profiles/actions";
import { endCreateProfileRequest, profileNames, takeCreateProfileSheet, useCreateProfileRequest, type CreateProfilePreset } from "../../state/profiles/createProfileRequest";
import { unusedProfileColor } from "../../state/profiles/profiles";
import type { ProfileColor } from "../../state/browser/types";
import { Box, Button, DialogActions, DialogTitle, Dot, PROFILE_COLORS, Sheet, Swatch, TextField, useTheme } from "../ui";
import { profileColors } from "./tokens";
import { closeSettingsSheet, showSettingsSheet } from "../../state/settings/sheet";

useCreateProfileRequest.subscribe((s, prev) => {
  if (!s.sheet || s.sheet === prev.sheet) return;
  const request = takeCreateProfileSheet();
  if (!request) return;
  const done = (id: string | null) => {
    closeSettingsSheet();
    request.resolve(id);
  };
  showSettingsSheet(<CreateProfileSheet windowId={null} preset={request.preset} onDone={done} />);
});

export function CreateProfileHost() {
  const windowId = useWindowId();
  const request = useCreateProfileRequest((r) => (r.request?.windowId === windowId ? r.request : null));
  if (!request) return null;
  const done = (id: string | null) => endCreateProfileRequest(request, id);
  return <CreateProfileSheet windowId={windowId} preset={request.preset} onDone={done} />;
}

function CreateProfileSheet({ windowId, preset, onDone }: { windowId: string | null; preset: CreateProfilePreset; onDone: (id: string | null) => void }) {
  const [name, setName] = useState(preset.name ?? "");
  const [color, setColor] = useState<ProfileColor>(() => unusedProfileColor(currentProfiles()));
  const submit = () => {
    const id = createProfile({ name, color });
    onDone(id);
  };

  return (
    <Sheet size="s" onClose={() => onDone(null)}>
      <Box gap="xl">
        <DialogTitle subtitle="Profiles separate your logins, cookies, passwords, extensions, history and bookmarks.">Create a Profile</DialogTitle>
        <Box gap="l">
          <TextField value={name} onChangeText={setName} placeholder="Profile name" autoFocus onSubmit={submit} onEscape={() => onDone(null)} />
          <Box row gap="m">
            {(Object.keys(PROFILE_COLORS) as ProfileColor[]).map((c) => (
              <ColorSwatch key={c} color={c} selected={color === c} onPress={() => setColor(c)} />
            ))}
          </Box>
        </Box>
      </Box>
      <DialogActions>
        <Button title="Cancel" onPress={() => onDone(null)} />
        <Button title="Create Profile" kind="primary" onPress={submit} />
      </DialogActions>
    </Sheet>
  );
}

export function ColorStack({ colors: swatches, size = 12 }: { colors: string[]; size?: number }) {
  const theme = useTheme();
  const shown = swatches.slice(0, 4);
  return (
    <View style={{ flexDirection: "row", width: size + (shown.length - 1) * (size * 0.6) }}>
      {shown.map((c, i) => (
        <Dot key={i} size={size} color={c} ring={theme.dark ? profileColors.stackRing.dark : profileColors.stackRing.light} style={{ marginLeft: i ? -size * 0.4 : 0 }} />
      ))}
    </View>
  );
}

function ColorSwatch({ color, selected, onPress }: { color: ProfileColor; selected: boolean; onPress: () => void }) {
  const spec = PROFILE_COLORS[color];
  return (
    <Pressable onPress={onPress} tooltip={spec.name}>
      <Swatch selected={selected} ring={spec.swatch} fill={spec.swatch} />
    </Pressable>
  );
}
