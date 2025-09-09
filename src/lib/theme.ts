export function setDarkMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

export function getStorageTheme(): 'dark' | 'light' | null {
  return localStorage.getItem('theme') as 'dark' | 'light' | null;
}
