import { Action, ActionPanel, Grid, Icon } from "@raycast/api";
import { useDebounce } from "./utils.ts";
import { IconActions } from "./components/actions/icon-actions.tsx";
import { useCachedPromise } from "@raycast/utils";
import React, { useRef } from "react";
import { search } from "./api.ts";
import IconHistoryCommand from "./icon-history.js";

export default function ExploreIconsCommand() {
  const { debouncedValue: searchText, setValue } = useDebounce("", 400);

  const abortable = useRef<AbortController>();

  const { isLoading, data, pagination } = useCachedPromise(
    (searchText: string) => async (options: { page: number }) => {
      try {
        const response = await search(options.page, searchText);

        return {
          data: response.hits,
          hasMore: response.page < response.totalPages,
        };
      } catch (error) {
        console.error(error);
        return { data: [], hasMore: false };
      }
    },
    [searchText],
    {
      abortable,
      keepPreviousData: true,
    },
  );

  return (
    <Grid
      columns={6}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      onSearchTextChange={setValue}
      filtering={false}
      pagination={pagination}
    >
      <Grid.EmptyView
        title="No icons found"
        description="Consider changing your search criteria in order to get better results"
      />
      {data?.map((icon) => (
        <Grid.Item
          id={icon.objectID}
          content={{ source: icon.lowResPngUrl, fallback: Icon.DeleteDocument }}
          key={icon.objectID}
          title={icon.name}
          subtitle={`􀁸 ${icon.downloads}  􀉪 ${icon.usersName}`}
          actions={
            <ActionPanel>
              <IconActions searchText={searchText} icon={icon} />
              <ActionPanel.Section>
                <Action.Push
                  title="Show History"
                  shortcut={{ modifiers: ["cmd"], key: "y" }}
                  target={<IconHistoryCommand />}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}
