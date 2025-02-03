import {
  Action,
  ActionPanel,
  Application,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { setIcon, useSortedApplications } from "../../utils.ts";
import React from "react";
import { History } from "../../history.ts";
import { IconDetails } from "../../types.ts";

export type ActionProps = { icon: IconDetails; searchText?: string };

const SetApplicationIcon = ({ icon, searchText }: ActionProps) => {
  const { data: applications, isLoading } = useSortedApplications(searchText);

  const update = async (app: Application) => {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Updating application with new icon`,
    });

    try {
      await setIcon(app.path, icon.icnsUrl);
      await History.addIcon(app.path, icon);

      toast.style = Toast.Style.Success;
      toast.title = "Icon successfully updated";
      toast.message = `Relaunch ${app.name} to see changes`;
    } catch (e) {
      toast.style = Toast.Style.Failure;

      toast.title = e?.toString() ?? "Something went wrong";
    }
  };

  return (
    <ActionPanel.Submenu
      isLoading={isLoading}
      title="Set Icon"
      icon={Icon.Highlight}
    >
      {(applications ?? []).map((app) => {
        return (
          <Action
            icon={{ fileIcon: app.path }}
            title={app.name}
            onAction={() => update(app)}
            key={app.path}
          />
        );
      })}
    </ActionPanel.Submenu>
  );
};

const SaveUsingBrowser = ({ icon }: ActionProps) => (
  <Action.Open
    title="Download Icon"
    target={icon.icnsUrl ?? ""}
    icon={Icon.Download}
  />
);

const CopyURLToClipboard = ({ icon }: ActionProps) => (
  <Action.CopyToClipboard
    title="Copy URL to Clipboard"
    content={{ html: icon.icnsUrl }}
    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
  ></Action.CopyToClipboard>
);

export const IconActions = ({ icon, searchText }: ActionProps) => (
  <ActionPanel.Section>
    <SetApplicationIcon icon={icon} searchText={searchText} />
    <SaveUsingBrowser icon={icon} />
    <CopyURLToClipboard icon={icon} />
  </ActionPanel.Section>
);
