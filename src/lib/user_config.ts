import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { UserConfig } from '$lib/types/ui/config';

let oldConfig = browser ? localStorage.getItem('config') : '{}';
if (browser && !oldConfig) {
  localStorage.setItem('config', '{}');
  oldConfig = '{}';
}
const config = writable<UserConfig>(oldConfig ? JSON.parse(oldConfig) : null);

if (browser) config.subscribe((value) => localStorage.setItem('config', JSON.stringify(value)));

export default config;
