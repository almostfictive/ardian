import { useState } from "react";
import { Pressable, View } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { currentProfiles } from "../../state/browser/current";
import { createProfile } from "../../state/profiles/actions";
import { endCreateProfileRequest, profileNames, takeCreateProfileSheet, useCreateProfileRequest, type CreateProfilePreset } from "../../state/profiles/createProfileRequest";
import { unusedProfileColor } from "../../state/profiles/profiles";
import type { ProfileColor } from "../../state/browser/types";
import { Button, PROFILE_COLORS, Sheet, space, Swatch, swatch, Text, TextField, useTheme } from "../ui";
import { profileColors, profileType } from "./tokens";
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
    <Sheet width={420} onClose={() => onDone(null)}>
      <Text weight="semibold" style={{ fontSize: profileType.sheetTitle }}>
        Create a Profile
      </Text>
      <Text tone="textSecondary" style={{ fontSize: profileType.sheetBody, lineHeight: profileType.sheetBodyLine, marginTop: space.s }}>
        Profiles separate your logins, cookies, passwords, extensions, history and bookmarks.
      </Text>

      <TextField value={name} onChangeText={setName} placeholder="Profile name" autoFocus onSubmit={submit} onEscape={() => onDone(null)} style={{ marginTop: space.xl }} />

      <View style={{ flexDirection: "row", gap: swatch.gap, marginTop: space.l }}>
        {(Object.keys(PROFILE_COLORS) as ProfileColor[]).map((c) => (
          <ColorSwatch key={c} color={c} selected={color === c} onPress={() => setColor(c)} />
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: space.m, marginTop: space.xlx }}>
        <Button title="Cancel" onPress={() => onDone(null)} />
        <Button title="Create Profile" kind="primary" onPress={submit} />
      </View>
    </Sheet>
  );
}

export function ColorStack({ colors: swatches, size = 12 }: { colors: string[]; size?: number }) {
  const theme = useTheme();
  const shown = swatches.slice(0, 4);
  return (
    <View style={{ flexDirection: "row", width: size + (shown.length - 1) * (size * 0.6) }}>
      {shown.map((c, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: i ? -size * 0.4 : 0,
            backgroundColor: c,
            borderWidth: 1,
            borderColor: theme.dark ? profileColors.stackRing.dark : profileColors.stackRing.light,
          }}
        />
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
