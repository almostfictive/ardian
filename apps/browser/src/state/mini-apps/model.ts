export const MINI_APPS = {
  whatsapp: { title: "WhatsApp", icon: "bubble.left", url: "https://web.whatsapp.com/" },
  slack: { title: "Slack", icon: "square.stack.3d.up", url: "https://app.slack.com/client" },
  telegram: { title: "Telegram", icon: "paperplane", url: "https://web.telegram.org/a/" },
  discord: { title: "Discord", icon: "gamecontroller", url: "https://discord.com/app" },
  gmail: { title: "Gmail", icon: "envelope", url: "https://mail.google.com/" },
  calendar: { title: "Calendar", icon: "calendar", url: "https://calendar.google.com/" },
} as const;
export type MiniAppId = keyof typeof MINI_APPS | `https://${string}` | `http://${string}`;

export function customMiniAppUrl(value: string): string | null {
  if (!value.trim() || /\s/.test(value.trim())) return null;
  try {
    const url = new URL(/^[a-z][\w+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    return ["http:", "https:"].includes(url.protocol) && !!url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export const isMiniAppId = (value: string): value is MiniAppId => Object.hasOwn(MINI_APPS, value) || customMiniAppUrl(value) === value;

export function miniAppDefinition(id: MiniAppId): { title: string; url: string } {
  if (Object.hasOwn(MINI_APPS, id)) return MINI_APPS[id as keyof typeof MINI_APPS];
  return { title: new URL(id).hostname, url: id };
}
