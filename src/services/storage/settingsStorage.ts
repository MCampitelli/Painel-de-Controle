import type { UserSettings } from "../../types/settings";
import type { ThemeMode } from "../../types/settings";

const SETTINGS_STORAGE_KEY = "dev-dashboard:user-settings";
const THEME_STORAGE_KEY = "dev-dashboard:theme";

function parseUserSettings(value: string | null): UserSettings | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<UserSettings>;
    if (
      typeof parsed.displayName === "string" &&
      typeof parsed.githubToken === "string" &&
      typeof parsed.azureDevOpsPat === "string"
    ) {
      return {
        displayName: parsed.displayName,
        githubToken: parsed.githubToken,
        githubUsername: typeof parsed.githubUsername === "string" ? parsed.githubUsername : "",
        azureDevOpsPat: parsed.azureDevOpsPat,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function getUserSettings(): UserSettings | null {
  return parseUserSettings(localStorage.getItem(SETTINGS_STORAGE_KEY));
}

export function saveUserSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function clearUserSettings(): void {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

export function hasUserSettings(): boolean {
  const settings = getUserSettings();
  if (!settings) return false;

  return Boolean(settings.displayName && settings.githubToken && settings.azureDevOpsPat);
}

export function getSavedTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
}

export function saveTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
