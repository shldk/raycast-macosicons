import {
  Action,
  ActionPanel,
  Icon,
  Keyboard,
  showToast,
  Toast,
} from "@raycast/api";
import React from "react";
import { IconDetails } from "../../types.ts";
import { History } from "../../history.ts";

export type ActionProps = {
  appName: string;
  icon: IconDetails;
  onDeleted: () => Promise<unknown>;
};

const RemoveHistoryItem = ({ icon, onDeleted }: ActionProps) => {
  const remove = async () => {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Removing history item`,
    });

    try {
      await History.removeIcon(icon);

      onDeleted();

      toast.style = Toast.Style.Success;
      toast.title = `Successfully removed`;
    } catch (e) {
      toast.style = Toast.Style.Failure;

      toast.title = e?.toString() ?? "Something went wrong";
    }
  };

  return (
    <Action
      shortcut={Keyboard.Shortcut.Common.Remove}
      icon={Icon.Trash}
      title="Remove History Item"
      onAction={() => remove()}
    />
  );
};

export const HistoryActions = ({
  icon,
  appName,
  revalidate,
}: {
  icon: IconDetails;
  appName: string;
  revalidate: () => Promise<unknown>;
}) => (
  <ActionPanel.Section>
    <RemoveHistoryItem appName={appName} icon={icon} onDeleted={revalidate} />
  </ActionPanel.Section>
);
