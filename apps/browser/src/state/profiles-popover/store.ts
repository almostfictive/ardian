import { create } from "zustand";
export const useProfilePopover = create<{ windowId: string | null }>()(() => ({ windowId: null }));
export const toggleProfilePopover = (windowId: string) => useProfilePopover.setState((s) => ({ windowId: s.windowId === windowId ? null : windowId }));
export const closeProfilePopover = () => useProfilePopover.setState({ windowId: null });
