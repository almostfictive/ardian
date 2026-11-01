import { withLivePage } from "./livePage";
import { pageOf, patchPage } from "./pageState";

export function reloadPage(tabId: string, force = false) {
  patchPage(tabId, { refreshSequence: pageOf(tabId).refreshSequence + 1 });
  return withLivePage(tabId, (page) => force ? page.forceReload() : page.reload());
}
