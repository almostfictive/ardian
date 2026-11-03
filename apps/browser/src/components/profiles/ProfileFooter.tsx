import { useRef } from "react";
import { Image, Pressable, View } from "react-native";
import { useIsIncognito, useWindowId, useWindowProfile } from "../../state/browser/hooks";
import { toggleProfilePopover } from "../../state/profiles-popover/store";
import { ContextMenuArea, ink, Text, useTheme } from "../ui";
import { profileAccent } from "../ui/theme";
import { openProfileItemMenu } from "./profileMenu";
import { PROFILE_FOOTER } from "./tokens";
import { profileFooterContent } from "./profileFooterModel";

export function ProfileFooter() {
  const windowId = useWindowId();
  const profile = useWindowProfile();
  const incognito = useIsIncognito();
  const theme = useTheme();
  const anchor = useRef<View>(null);
  const { photo, initial } = profileFooterContent(profile.name, profile.icon);

  return (
    <ContextMenuArea onContextMenu={() => !incognito && void openProfileItemMenu(profile.id, "sidebar", windowId, anchor.current)}>
      <Pressable
        ref={anchor}
        accessibilityRole="button"
        accessibilityLabel={incognito ? "Private profile" : `Profile: ${profile.name}`}
        disabled={incognito}
        onPress={() => toggleProfilePopover(windowId)}
        style={{
          width: PROFILE_FOOTER.box,
          height: PROFILE_FOOTER.box,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {({ pressed }) => (
          <View style={{ width: PROFILE_FOOTER.photo, height: PROFILE_FOOTER.photo, borderRadius: PROFILE_FOOTER.radius, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: pressed ? theme.tabPressed : profileAccent(profile) }}>
            {photo ? (
              <Image source={{ uri: photo }} resizeMode="cover" style={{ width: PROFILE_FOOTER.photo, height: PROFILE_FOOTER.photo }} />
            ) : (
              <Text weight="semibold" style={{ color: ink.white, fontSize: PROFILE_FOOTER.initial }}>{initial}</Text>
            )}
          </View>
        )}
      </Pressable>
    </ContextMenuArea>
  );
}
