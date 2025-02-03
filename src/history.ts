import { AppliedIconDetails, IconDetails } from "./types.ts";
import { Application, getApplications, LocalStorage } from "@raycast/api";

enum Key {
  History = "history",
}

interface Storage {
  [Key.History]: string;
}

export class History {
  static async addIcon(appPath: string, icon: IconDetails) {
    const history = await History.getIcons();
    history.unshift({
      ...icon,
      appPath,
    });
    return LocalStorage.setItem(Key.History, JSON.stringify(history));
  }

  static async removeApplication(appPath: string) {
    return await History.removeIcons(
      (originalIcon: AppliedIconDetails) => originalIcon.appPath !== appPath,
    );
  }

  static async removeIcon(icon: IconDetails) {
    return await History.removeIcons(
      (originalIcon: IconDetails) => originalIcon.timeStamp !== icon.timeStamp,
    );
  }

  private static async removeIcons(
    predicate: (icon: AppliedIconDetails) => boolean,
  ) {
    const originalHistory = await History.getIcons();
    const history = originalHistory.filter(predicate);

    return await LocalStorage.setItem(Key.History, JSON.stringify(history));
  }

  static async getIcons(): Promise<AppliedIconDetails[]> {
    const history = await LocalStorage.getItem<Storage[Key.History]>(
      Key.History,
    );

    return history ? JSON.parse(history) : [];
  }

  static async getApplicationIcons(): Promise<
    { icon: AppliedIconDetails; application: Application }[]
  > {
    const [icons, apps] = await Promise.all([
      History.getIcons(),
      getApplications(),
    ]);
    return icons.map((icon) => ({
      icon,
      application: apps.find((app) => app.path === icon.appPath)!,
    }));
  }
}
