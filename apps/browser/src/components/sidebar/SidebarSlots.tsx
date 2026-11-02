import type { ReactNode } from "react";
import { View } from "react-native";

export const SIDEBAR_SLOTS = ["trafficLights", "profile", "miniApps", "workspaces"] as const;
export type SidebarSlotName = typeof SIDEBAR_SLOTS[number];

export function SidebarSlot({ name, children }: { name: SidebarSlotName; children: ReactNode }) {
  return <View nativeID={`sidebar-slot-${name}`} style={{ flexShrink: 0 }}>{children}</View>;
}
