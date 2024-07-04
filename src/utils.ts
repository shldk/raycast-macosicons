import {exec} from "child_process";
import {promisify} from "node:util";
import React, {useEffect, useState} from "react";
import {usePromise} from "@raycast/utils";
import {Application} from "@raycast/api";
import fuzzysort from "fuzzysort";

const run = promisify(exec);

export async function setMacOSIcon(appPath: string, imagePath: string) {
	return new Promise((resolve, reject) => {
		try {
			exec(
				`
        replace_icon(){
          droplet="$1"
          icon="$2"
          if [[ "$icon" =~ ^https?:// ]]; then
              curl -sLo /tmp/icon "$icon"
              icon=/tmp/icon
          fi
          rm -rf "$droplet"$'/Icon\r'
          sips -i "$icon" >/dev/null
          DeRez -only icns "$icon" > /tmp/icns.rsrc
          Rez -append /tmp/icns.rsrc -o "$droplet"$'/Icon\r'
          SetFile -a C "$droplet"
          SetFile -a V "$droplet"$'/Icon\r'
          killall Dock
        }; replace_icon '${appPath}' '${imagePath}'
      `,
				(error: unknown, stdout: string) => {
					if (error) {
						console.error(`exec error: ${error}`);
						reject(error);
					}
					resolve(stdout);
				},
			);
		} catch (e) {
			console.error(e);
		}
	});
}

export function useApplications() {
	return usePromise(getApplications);
}

export async function getApplications() {
	const {stdout} = await run(`mdfind -onlyin ~/Applications -onlyin /Applications 'kMDItemContentType == "com.apple.application-bundle" && kMDItemAppStoreIsAppleSigned != 1' -attr kMDItemFSName -attr kMDItemCFBundleIdentifier -attr kMDItemContentModificationDate`);

	return stdout.trim().split('\n').map(line => {
		const parts = line.split('  ');

		const name = parts[1]?.split('=')[1].replace('.app', '').trim();
		const bundleId = parts[2]?.split('=')[1].trim();
		const lastModified = parts[3]?.split('=')[1].trim();
		const path = parts[0];
		return {
			path,
			name,
			bundleId,
			lastModified: new Date(lastModified)
		} as Application
	});
}

export function useSortedApplications(search?: string) {
	const {data: applications, isLoading} = useApplications();

	const results = fuzzysort.go(search || '', applications || [], {key: 'name'});
	const objects = results.map(r => r.obj);

	const otherApplications = (applications || []).filter(app => !objects.includes(app))

	return {data: [...objects, ...otherApplications], isLoading};
}

// if `turbo = true` then function doesn't debounce empty value and executes instantly
export function useDebounce<T>(
	initialValue: T,
	delay?: number,
	turbo = true,
): {
	debouncedValue: T;
	rawValue: T;
	setValue: React.Dispatch<React.SetStateAction<T>>;
} {
	const [rawValue, setValue] = useState<T>(initialValue);
	const [debouncedValue, setDebouncedValue] = useState<T>(rawValue);

	useEffect(() => {
		if (turbo && !rawValue) {
			setDebouncedValue(rawValue);
			return;
		}

		const timer = setTimeout(() => setDebouncedValue(rawValue), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [rawValue, delay]);

	return {debouncedValue, rawValue, setValue};
}
