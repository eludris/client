import { writable } from 'svelte/store';

const activeContext = writable<number>(0);

export default activeContext;
