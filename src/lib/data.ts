import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface UserData {
	name: String,
	instanceURL: String,
}

const data = writable<null | UserData>(null);

if (browser) data.subscribe((value) => window.localStorage.setItem("data", JSON.stringify(value)));

export default data;
