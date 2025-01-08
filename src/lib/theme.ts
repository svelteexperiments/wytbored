import { writable } from 'svelte/store';

// Initialize theme from localStorage or default to 'light'
const storedTheme = localStorage.getItem('theme') || 'light';
export const theme = writable(storedTheme);

// Update theme and persist it in localStorage
theme.subscribe((value) => {
    localStorage.setItem('theme', value);
    document.documentElement.classList.toggle('dark', value === 'dark');
});