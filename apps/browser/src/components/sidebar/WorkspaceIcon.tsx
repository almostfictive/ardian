import { Image } from "react-native";
import { PAGE3 } from "../ui/tokens";

const icons: Record<string, readonly [number, number]> = {
  "house": [require("../../../assets/workspaces/house-light.png"), require("../../../assets/workspaces/house-dark.png")],
  "airplane": [require("../../../assets/workspaces/airplane-light.png"), require("../../../assets/workspaces/airplane-dark.png")],
  "hourglass": [require("../../../assets/workspaces/hourglass-light.png"), require("../../../assets/workspaces/hourglass-dark.png")],
  "briefcase": [require("../../../assets/workspaces/briefcase-light.png"), require("../../../assets/workspaces/briefcase-dark.png")],
  "star": [require("../../../assets/workspaces/star-light.png"), require("../../../assets/workspaces/star-dark.png")],
  "book": [require("../../../assets/workspaces/book-light.png"), require("../../../assets/workspaces/book-dark.png")],
  "heart": [require("../../../assets/workspaces/heart-light.png"), require("../../../assets/workspaces/heart-dark.png")],
  "globe": [require("../../../assets/workspaces/globe-light.png"), require("../../../assets/workspaces/globe-dark.png")],
  "music.note": [require("../../../assets/workspaces/music-note-light.png"), require("../../../assets/workspaces/music-note-dark.png")],
  "gamecontroller": [require("../../../assets/workspaces/game-controller-light.png"), require("../../../assets/workspaces/game-controller-dark.png")],
  "whatsapp": [require("../../../assets/workspaces/whatsapp-logo-light.png"), require("../../../assets/workspaces/whatsapp-logo-dark.png")],
  "slack": [require("../../../assets/workspaces/slack-logo-light.png"), require("../../../assets/workspaces/slack-logo-dark.png")],
  "telegram": [require("../../../assets/workspaces/telegram-logo-light.png"), require("../../../assets/workspaces/telegram-logo-dark.png")],
  "discord": [require("../../../assets/workspaces/discord-logo-light.png"), require("../../../assets/workspaces/discord-logo-dark.png")],
  "gmail": [require("../../../assets/workspaces/envelope-simple-light.png"), require("../../../assets/workspaces/envelope-simple-dark.png")],
  "calendar": [require("../../../assets/workspaces/calendar-blank-light.png"), require("../../../assets/workspaces/calendar-blank-dark.png")],
};

export function WorkspaceIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const pair = icons[name] ?? icons.house!;
  return <Image source={pair[color === PAGE3.light.primary ? 0 : 1]} style={{ width: size, height: size }} />;
}
