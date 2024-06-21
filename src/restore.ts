import {DB} from "./db";
import {getApplications, setMacOSIcon} from "./utils";
import {exec} from "child_process";
import {promisify} from "node:util";
import {showToast, Toast} from "@raycast/api";

const run = promisify(exec);

export default async function RestoreCommand() {
	const history = await DB.getHistory();
	const applications = await getApplications();

	const promises = Object.entries(history).map(async ([bundleId, icons]) => {
		const app = applications.find(app => app.bundleId === bundleId);

		if (!app) {
			return '';
		}

		const {stdout: iconPath} = await run(`find ${app!.path} -name 'Icon?'`);

		if (!iconPath) {
			await setMacOSIcon(app!.path, icons[0].icnsUrl);

			return app!.name;
		}
	});

	await showToast({
		style: Toast.Style.Success,
		title: 'Icons Restored',
		message: 'Relaunch desired application to see changes'
	});

	return await Promise.allSettled(promises);
}
