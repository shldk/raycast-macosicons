import {
  Action,
  ActionPanel,
  Application,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { restoreDefaultIcon } from "./utils.js";
import { usePromise } from "@raycast/utils";
import { History } from "./history.js";
import { useCallback } from "react";

export default function RestoreDefaultIconCommand() {
  const {
    data: applications,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const details = await History.getApplicationIcons();

    return Array.from(
      details.reduce((apps, detail) => {
        apps.add(detail.application);
        return apps;
      }, new Set<Application>()),
    ).filter(app => !!app);
  });

  const restore = useCallback(async (app: Application) => {
    let toast;
    try {
      await restoreDefaultIcon(app.path);
      toast = {
        style: Toast.Style.Success,
        title: "Icon successfully restored",
      };
    } catch (e) {
      toast = {
        style: Toast.Style.Failure,
        title: "Icon restoration failed",
      };
    }

    await showToast(toast);
    await revalidate();
  }, []);

  return (
    <List isLoading={isLoading}>
      {applications?.map((app) => (
        <List.Item
          key={app.path}
          title={app.name}
          icon={{ fileIcon: app.path }} // Mark with a custom icon if applicable
          actions={
            <ActionPanel>
              <Action title="Reset Icon" onAction={() => restore(app)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
