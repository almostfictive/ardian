import { chooseFromMenu } from "../app/menuChoice";
import { openSettings } from "../settings/settingsWindows";

export async function openPageMenu() {
  const choice = await chooseFromMenu([{ id: "settings", title: "Settings", symbol: "gearshape" }]);
  if (choice === "settings") openSettings();
}
