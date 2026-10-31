import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSettings, useWindow, useWindowId } from "../../state/browser/hooks";
import { addFooterItem, editFooterItem, footerItem, FOOTER_HEIGHT, openFooterItem } from "../../state/sidebar/footer";
import { Button } from "../ui";
import { closeMiniApp, MINI_APPS, openMiniApp, useMiniApps, type MiniAppId } from "../../state/sidebar/miniApps";
import { closeSidePanel } from "../../state/extensions/sidePanels";
import { MINI_APP_BRANDS } from "./tokens";
import { useTheme } from "../ui/theme";

export function SidebarFooter() {
  const windowId = useWindowId();
  const theme = useTheme();
  const items = useSettings((s) => s.sidebarShortcuts);
  const enabledApps = useSettings((s) => s.sidebarMiniApps);
  const active = useMiniApps((state) => state.active[windowId]);
  const privateWindow = useWindow(windowId, (window) => window?.kind === "private");
  const toggleApp = (id: MiniAppId) => {
    if (active === id) return closeMiniApp(windowId);
    closeSidePanel(windowId);
    openMiniApp(windowId, id);
  };
  return (
    <View style={{ height: FOOTER_HEIGHT, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ alignItems: "center" }}>
        {items.map((id) => {
          const item = footerItem(id);
          return <Button key={id} variant="icon" toolbar icon={item.icon} box={30} tooltip={item.title} onPress={() => openFooterItem(windowId, id)} onContextMenu={() => void editFooterItem(id)} />;
        })}
        {!privateWindow && items.length > 0 && enabledApps.length > 0 && <View style={{ width: 1, height: 18, marginHorizontal: 5, backgroundColor: theme.divider }} />}
        {!privateWindow && (Object.keys(MINI_APPS) as MiniAppId[]).filter((id) => enabledApps.includes(id)).map((id) => {
          const app = MINI_APPS[id];
          return <Pressable key={id} accessibilityRole="button" accessibilityLabel={app.title} onPress={() => toggleApp(id)} style={{ width: 30, height: 30, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: active === id ? theme.toolbarPressed : undefined }}><MiniAppMark app={id} /></Pressable>;
        })}
      </ScrollView>
      <Button variant="icon" toolbar icon="plus" box={30} tooltip="Add or Configure Shortcuts" onPress={() => void addFooterItem()} />
    </View>
  );
}

function MiniAppMark({ app }: { app: MiniAppId }) {
  if (app === "whatsapp") {
    return <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: MINI_APP_BRANDS.whatsapp, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "white", fontSize: 12, fontWeight: "700", lineHeight: 16 }}>☎</Text></View>;
  }
  if (app === "telegram") {
    return <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: MINI_APP_BRANDS.telegram, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "white", fontSize: 12, fontWeight: "700", lineHeight: 15 }}>➤</Text></View>;
  }
  return <Image source={require("../../../assets/site-icons/slack.png")} resizeMode="contain" style={{ width: 19, height: 19 }} />;
}
