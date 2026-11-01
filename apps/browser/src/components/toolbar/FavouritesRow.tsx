import { space } from "../ui/tokens";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useWindowId, useWindowProfileId } from "../../state/browser/hooks";
import { favouriteMenu, openFavourite, usePageFavourites } from "../../state/favourites/favourites";
import { Button, ContextMenuArea, Symbol } from "../ui";
import { useTheme } from "../ui/theme";
import { PAGE3 } from "../ui/tokens";
import { FAVOURITES_HEIGHT } from "./tokens";
import { Favicon } from "../favicon/Favicon";
export function FavouritesRow() {
  const windowId = useWindowId();
  const profileId = useWindowProfileId();
  const items = usePageFavourites(profileId);
  const theme = useTheme();
  const colors = PAGE3[theme.dark ? "dark" : "light"];
  return <View style={{ height: FAVOURITES_HEIGHT }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: space.xxl, paddingHorizontal: space.xl }}>
      {items.map((item) => <ContextMenuArea key={item.id} onContextMenu={() => void favouriteMenu(windowId, item)}>
        <Pressable accessibilityRole="button" accessibilityLabel={item.title} onPress={() => openFavourite(windowId, item)} style={{ height: FAVOURITES_HEIGHT, flexDirection: "row", alignItems: "center", gap: space.s }}>
          <Favicon url={item.url} favicon={null} size={15} profileId={profileId} />
          <Text style={{ ...PAGE3.type.label, color: colors.primary }}>{item.title}</Text>
        </Pressable>
      </ContextMenuArea>)}
      <Pressable accessibilityRole="button" onPress={() => void favouriteMenu(windowId)} style={{ flexDirection: "row", alignItems: "center", gap: space.s }}>
        <Symbol name="folder.fill" size={14} color={colors.secondary} style={{ width: 15, height: 15 }} />
        <Text style={{ ...PAGE3.type.label, color: colors.secondary }}>Favorites</Text>
      </Pressable>
    </ScrollView>
  </View>;
}
