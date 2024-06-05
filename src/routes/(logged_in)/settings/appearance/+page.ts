import type { PageLoad } from './$types';

type ThemeInfo = {
  name: string;
  author: string;
  'repo-url': string;
  description: string;
  'cover-image': string;
  'readme-url': string | undefined;
  'style-url': string | undefined;
};

export const load: PageLoad = async ({ fetch, params }): Promise<{theme_info: ThemeInfo[]}> => {
  let themeInfo: ThemeInfo[] = await fetch("https://raw.githubusercontent.com/eludris/client-themes/main/themes.json").then((r) => r.json());

  // NOTE: these are temporary, for testing.
  themeInfo[0].author = "Sharp Eyes"
  themeInfo = [...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo];

	return {theme_info: themeInfo};
};