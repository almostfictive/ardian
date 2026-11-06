import { useState } from "react";
import { useSettings } from "../../../state/browser/hooks";
import { customMiniAppUrl, isMiniAppId, MINI_APPS, miniAppDefinition } from "../../../state/mini-apps/model";
import { updateSettings } from "../../../state/settings/actions";
import { Button, TextField, Toggle } from "../../ui";
import { Group, Row, SectionHeader } from "../Form";

export function MiniAppsSection() {
  const apps = useSettings((settings) => settings.sidebarMiniApps);
  const [input, setInput] = useState("");
  const url = customMiniAppUrl(input);
  const duplicate = !!url && apps.filter(isMiniAppId).some((id) => miniAppDefinition(id).url === url);
  const add = () => {
    if (!url || duplicate) return;
    updateSettings({ sidebarMiniApps: [...apps, url] });
    setInput("");
  };
  return <>
    <SectionHeader title="Sidebar mini apps" description="Choose web apps or add one by URL." />
    <Group>
      {Object.entries(MINI_APPS).map(([id, app]) => <Row key={id} title={app.title}><Toggle value={apps.includes(id)} onChange={(on) => updateSettings({ sidebarMiniApps: on ? [...apps, id] : apps.filter((app) => app !== id) })} /></Row>)}
      {apps.filter((id) => !Object.hasOwn(MINI_APPS, id)).filter(isMiniAppId).map((id) => <Row key={id} title={miniAppDefinition(id).title} description={id}><Button title="Remove" onPress={() => updateSettings({ sidebarMiniApps: apps.filter((app) => app !== id) })} /></Row>)}
      <Row anchor="general.sidebarMiniApps" title="Web app URL"><TextField value={input} onChangeText={setInput} onSubmit={add} placeholder="https://example.com" width={220} /><Button title="Add" disabled={!url || duplicate} onPress={add} /></Row>
    </Group>
  </>;
}
