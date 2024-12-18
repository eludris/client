import type { PageLoad } from './$types';

type ThemeInfo = {
  name: string;
  author: string;
  description: string;
  cover_url: string;
  repo_url: string;
  readme_url: string | undefined;
  style_url: string | undefined;
};

export const load: PageLoad = async ({ fetch, params }): Promise<{theme_info: ThemeInfo[]}> => {
  let themeInfo: ThemeInfo[] = await fetch("https://raw.githubusercontent.com/eludris/client-themes/main/themes.json").then((r) => r.json());

	return {theme_info: themeInfo};
};