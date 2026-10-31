import { ContextMenuArea } from "../ui";
import { openPageMenu } from "../../state/pages/contextMenu";
import { useEffect } from "react";
import { showOnceOverEmptyCard } from "../../state/omnibox/newTabBar";

export function EmptyCard({ windowId, tabId }: { windowId: string; tabId: string }) {
  useEffect(() => showOnceOverEmptyCard(windowId, tabId), [windowId, tabId]);
  return <ContextMenuArea style={{ flex: 1 }} onContextMenu={() => void openPageMenu()} />;
}
