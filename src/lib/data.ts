import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { UserData } from '$lib/types/ui/user';

const oldData = browser ? localStorage.getItem('data') : null;
const data = writable<UserData | null>(oldData ? JSON.parse(oldData) : null);

if (browser) data.subscribe((value) => localStorage.setItem('data', JSON.stringify(value)));

export default data;
