import { Text } from "react-native";
import { useWindowId } from "../../state/browser/hooks";
import { useTabNumber } from "../../state/sidebar/tabNumbers";
import { font, useTheme } from "../ui";

export function TabNumber({ tabId }: { tabId: string }) {
  const theme = useTheme();
  const number = useTabNumber(tabId, useWindowId());
  if (number === null) return null;
  return <Text accessibilityLabel={`Command ${number}`} style={{ ...font.small, color: theme.textSecondary, minWidth: 16, textAlign: "right", marginHorizontal: 4 }}>{number}</Text>;
}
