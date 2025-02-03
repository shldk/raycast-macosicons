import { History } from "./history.ts";
import { setIcon } from "./utils.ts";
import { exec } from "child_process";
import { promisify } from "node:util";
import { showToast, Toast } from "@raycast/api";

const run = promisify(exec);

export default async function FixOutdatedIconsCommand() {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Processing",
  });

  try {
    const entries = await History.getApplicationIcons();

    const latestIconsForApps = entries.reduce(
      (latestIcons, entry) => {
        const isNotLatest = latestIcons.find(({ application }) => {
          return application === entry.application;
        });
        if (!isNotLatest) {
          latestIcons.push(entry);
        }
        return latestIcons;
      },
      [] as typeof entries,
    );

    const promises = latestIconsForApps.map(async ({ application, icon }) => {
      const { stdout: iconPath } = await run(
        `find '${application.path}' -name 'Icon?'`,
      );

      if (!iconPath) {
        return await setIcon(application.path, icon.icnsUrl);
      }
    }, [] as Promise<unknown>[]);

    await Promise.allSettled(promises);

    toast.style = Toast.Style.Success;
    toast.title = "Icons successfully fixed";
  } catch (e) {
    toast.style = Toast.Style.Failure;
    toast.title = "Icon fix failed";
  }
}
