import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { FadeLabel, font, radius, Surface, type SurfaceProps } from "../ui";
import { hex, layout } from "../ui/theme";
import { SIDEBAR_TYPE, TAB_ROW } from "./tokens";

export const ROW_TITLE_FRAME = { flex: 1, height: TAB_ROW.titleHeight, marginLeft: TAB_ROW.titleGap } as const;

const COMPACT_TITLE_FRAME = { flex: 1, height: TAB_ROW.compactTitleHeight, marginLeft: TAB_ROW.titleGap } as const;

export function SidebarRowSurface({
  fill,
  border = 0,
  stroke,
  cornerRadius = radius.tile,
  padLeft = TAB_ROW.contentLeft,
  padRight = TAB_ROW.trailing,
  children,
}: {
  fill: string;
  border?: number;
  stroke?: string;
  cornerRadius?: number;
  padLeft?: number;
  padRight?: number;
  children: SurfaceProps["children"];
}) {
  return (
    <Surface
      fill={hex(fill)}
      cornerRadius={cornerRadius}
      borderWidth={border}
      borderColor={stroke === undefined ? undefined : hex(stroke)}
      style={{ height: layout.rowHeight, flexDirection: "row", alignItems: "center", paddingLeft: padLeft, paddingRight: padRight }}
    >
      {children}
    </Surface>
  );
}

export function SidebarRowLabel({ text, color, weight, compact = false }: { text: string; color: string; weight?: "medium" | "regular"; compact?: boolean }) {
  return <FadeLabel text={text} fontSize={compact ? SIDEBAR_TYPE.compact : font.body.fontSize} weight={weight} color={color} style={compact ? COMPACT_TITLE_FRAME : ROW_TITLE_FRAME} />;
}

export function SidebarListRow({ height, fill, padRight = 0, style, children }: { height: number; fill?: string; padRight?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <View
      style={[
        { height, borderRadius: radius.tile, flexDirection: "row", alignItems: "center", paddingLeft: TAB_ROW.contentLeft, paddingRight: padRight, backgroundColor: fill },
        style,
      ]}
    >
      {children}
    </View>
  );
}
