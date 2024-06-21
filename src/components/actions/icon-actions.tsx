import {
	Action,
	ActionPanel,
	Application,
	Icon,
	showToast,
	Toast,
} from "@raycast/api";
import {setMacOSIcon, useSortedApplications} from "../../utils";
import React from "react";
import {IconHit} from "../../types";
import {DB} from "../../db";

export type ActionProps = { icon: IconHit, searchText?: string };

const SetApplicationIcon = ({ icon, searchText }: ActionProps) => {
	const { data: applications } = useSortedApplications(searchText);

	const update = async (app: Application) => {
		const toast = await showToast({
			style: Toast.Style.Animated,
			title: `Updating application with new icon`,
		});

		try {
			await setMacOSIcon(app.path, icon.icnsUrl!);
			await DB.addToHistory(app.bundleId!, {
				...icon,
				date: new Date().toString(),
			});

			toast.style = Toast.Style.Success;
			toast.title = "Icon successfully updated";
			toast.message = `Relaunch ${app.name} to see changes`;
		} catch (e) {

			toast.style = Toast.Style.Failure;

			toast.title = e?.toString() ?? "Something went wrong";
		}
	};

	return (
		<ActionPanel.Submenu title="Set Icon" icon={Icon.Highlight}>
			{(applications ?? []).map((app) => {
				return (
					<Action
						icon={{ fileIcon: app.path }}
						title={app.name}
						onAction={() => update(app)}
						key={app.bundleId}
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
		content={{ html: icon.icnsUrl ?? icon.appName }}
		shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
	></Action.CopyToClipboard>
);

export const IconActions = ({ icon, searchText }: ActionProps) => (
	<ActionPanel.Section>
		<SetApplicationIcon icon={icon} searchText={searchText}/>
		<SaveUsingBrowser icon={icon}/>
		<CopyURLToClipboard icon={icon}/>
	</ActionPanel.Section>
);
