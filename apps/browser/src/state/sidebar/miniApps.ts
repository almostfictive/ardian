import { create } from "zustand";

export const MINI_APPS = {
  whatsapp: { title: "WhatsApp", icon: "bubble.left", url: "https://web.whatsapp.com/" },
  slack: { title: "Slack", icon: "square.stack.3d.up", url: "https://app.slack.com/client" },
  telegram: { title: "Telegram", icon: "arrow.up.forward", url: "https://web.telegram.org/a/" },
} as const;

export type MiniAppId = keyof typeof MINI_APPS;

export const useMiniApps = create<{
  active: Record<string, MiniAppId | undefined>;
  open(windowId: string, app: MiniAppId): void;
  close(windowId: string): void;
}>()((set) => ({
  active: {},
  open: (windowId, app) => set((state) => ({ active: { ...state.active, [windowId]: app } })),
  close: (windowId) =>
    set((state) => {
      const active = { ...state.active };
      delete active[windowId];
      return { active };
    }),
}));

export const openMiniApp = (windowId: string, app: MiniAppId) => useMiniApps.getState().open(windowId, app);
export const closeMiniApp = (windowId: string) => useMiniApps.getState().close(windowId);
