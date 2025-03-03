import { writable } from "svelte/store";

export const scrollPercentage = writable(0);
export const isConnected = writable(false);
export const isPlaying = writable(false);
export const isPlayerWin = writable(null);