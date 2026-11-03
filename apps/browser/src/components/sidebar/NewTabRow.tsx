import { memo } from "react";
import { Animated, Pressable, View } from "react-native";
import { ContextMenuArea, radius, Symbol, useHover } from "../ui";
import { layout, useTheme } from "../ui/theme";
import { newTab } from "../../state/tabs/actions";
import { openNewTabInSplit } from "../../state/splits/actions";
import { openSidebarMenu } from "../../state/sidebar/menus";
import { toggleNewTabBar } from "../../state/omnibox/newTabBar";
import { modifiersOf } from "../../lib/keys";
import { useClipped, useShift, type ClipSource } from "./EntryMotion";
import { TAB_ROW, useSidebarTokens } from "./tokens";
import { SidebarRowLabel } from "./SidebarRow";

const CLIPPED = { marginTop: -layout.rowGap, paddingTop: layout.rowGap, overflow: "hidden" } as const;

export const NewTabRow = memo(function NewTabRow({ windowId, shift = null, clip = null }: { windowId: string; shift?: Animated.Value | null; clip?: ClipSource | null }) {
  const theme = useTheme();
  const tokens = useSidebarTokens();
  const { hovered, hoverProps } = useHover();
  const [moved, movedRef] = useShift(shift);
  const clipped = useClipped(clip);
  return (
    <View {...hoverProps} style={[{ flexDirection: "row", alignItems: "center" }, clipped ? CLIPPED : null]}>
      <ContextMenuArea style={{ flex: 1 }} onContextMenu={() => void openSidebarMenu(windowId)}>
        <Pressable
          style={{ flex: 1 }}
          onPress={(e) => {
            if (modifiersOf(e).altKey) openNewTabInSplit(windowId);
            else toggleNewTabBar(windowId) || newTab(windowId, { newTabCommand: true });
          }}
        >
          {({ pressed }) => (
            <View
              {...moved}
              ref={movedRef}
              style={[
                {
                  height: layout.rowHeight,
                  borderRadius: radius.tile,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: TAB_ROW.contentLeft,
                  paddingRight: TAB_ROW.trailing,
                  backgroundColor: pressed ? theme.tabPressed : hovered ? theme.tabHover : undefined,
                },
                moved.style as object,
              ]}
            >
              <Symbol name="plus" size={14} weight="medium" color={tokens.newTabIcon} style={{ width: 14, height: 14 }} />
              <SidebarRowLabel text="New Tab" color={tokens.newTabLabel} compact />
            </View>
          )}
        </Pressable>
      </ContextMenuArea>
    </View>
  );
});
