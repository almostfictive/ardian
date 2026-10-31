import { create } from "zustand";
import { useBrowser } from "../browser/store";
import { numberedTabs } from "./entries";

export const useTabNumberHints = create<{ windowId: string | null }>()(() => ({ windowId: null }));
export const setTabNumberWindow = (windowId: string | null) => useTabNumberHints.setState({ windowId });

export function useTabNumber(tabId: string, windowId: string): number | null {
  const shown = useTabNumberHints((s) => s.windowId === windowId);
  return useBrowser((s) => {
    if (!shown) return null;
    const index = numberedTabs(s, windowId).indexOf(tabId);
    return index >= 0 && index < 9 ? index + 1 : null;
  });
}
