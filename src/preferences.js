export const DEFAULT_THEME_MODE = 'system';

export const themeModes = ['system', 'light', 'dark'];

const THEME_STORAGE_KEY = 'pdf2img:theme-mode';
const LOCALE_STORAGE_KEY = 'pdf2img:locale';

function safeRead(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures.
  }
}

export function resolveThemeMode(themeMode) {
  if (themeMode === 'light' || themeMode === 'dark') {
    return themeMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeMode(themeMode, root = document.documentElement) {
  const normalizedThemeMode = themeModes.includes(themeMode) ? themeMode : DEFAULT_THEME_MODE;
  const resolvedTheme = resolveThemeMode(normalizedThemeMode);

  root.dataset.theme = resolvedTheme;
  root.dataset.themeMode = normalizedThemeMode;

  return resolvedTheme;
}

export function createSystemThemeListener(onChange) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => onChange(mediaQuery.matches ? 'dark' : 'light');

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

export function saveThemeModePreference(themeMode) {
  safeWrite(THEME_STORAGE_KEY, themeMode);
}

export function saveLocalePreference(locale) {
  safeWrite(LOCALE_STORAGE_KEY, locale);
}

export function loadPreferences(defaultLocale = 'zh') {
  const themeMode = safeRead(THEME_STORAGE_KEY);
  const locale = safeRead(LOCALE_STORAGE_KEY);

  return {
    themeMode: themeModes.includes(themeMode) ? themeMode : DEFAULT_THEME_MODE,
    locale: locale || defaultLocale,
  };
}