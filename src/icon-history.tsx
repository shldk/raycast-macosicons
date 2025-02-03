import React, { useMemo, useState } from "react";
import { History } from "./history.ts";
import { usePromise } from "@raycast/utils";
import { ActionPanel, Grid, Icon } from "@raycast/api";
import { IconActions } from "./components/actions/icon-actions.tsx";
import { HistoryActions } from "./components/actions/history-actions.tsx";
import { IconDetails } from "./types.ts";

function formatDate(dateString: string | number) {
  const date = new Date(dateString);

  return `${date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  })}, ${date.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function IconHistoryCommand() {
  const {
    data: details,
    isLoading,
    revalidate,
  } = usePromise(History.getApplicationIcons);
  const [searchText, setSearchText] = useState("");

  const iconsByAppName = useMemo(() => {
    return (details ?? []).reduce(
      (groupedIcons, detail) => {
        const appName = detail.application.name;

        (groupedIcons[appName] = groupedIcons[appName] || []).push(detail.icon);

        return groupedIcons;
      },
      {} as { [appName: string]: IconDetails[] },
    );
  }, [details]);

  console.log(iconsByAppName);

  const filteredAppNames = useMemo(() => {
    return Object.keys(iconsByAppName).filter((appName) =>
      appName.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [iconsByAppName, searchText]);

  return (
    <Grid
      columns={8}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      filtering={false}
    >
      {filteredAppNames.map((appName) => (
        <Grid.Section title={appName} key={appName}>
          {(iconsByAppName[appName] ?? []).map((icon) => (
            <Grid.Item
              content={{
                source: icon.lowResPngUrl,
                fallback: Icon.DeleteDocument,
              }}
              title={`${appName}`}
              subtitle={formatDate(icon.timeStamp)}
              key={icon.timeStamp + "@" + appName}
              actions={
                <ActionPanel>
                  <IconActions icon={icon} />
                  <HistoryActions
                    icon={icon}
                    appName={appName}
                    revalidate={revalidate}
                  />
                </ActionPanel>
              }
            />
          ))}
        </Grid.Section>
      ))}
      <Grid.EmptyView />
    </Grid>
  );
}
