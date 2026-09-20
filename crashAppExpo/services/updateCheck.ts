import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, ENDPOINTS } from "@/constants/api";

const CACHE_KEY = "update_check_cache_v2";
// Re-query the backend at most once per 6h; the prompt itself is what nudges
// the user repeatedly until they update. Kept in line with the "Not now"
// snooze so a fresh (possibly forced) release surfaces quickly.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  /** Force the update: the prompt cannot be dismissed (no "Not now"). */
  forceUpdate?: boolean;
  /** Store intent link (e.g. market://…) — best opened on the device. */
  storeUrl?: string;
  /** Web fallback for the store listing. */
  storeWebUrl?: string;
  /** Optional custom message shown in the prompt. */
  message?: string;
}

interface CacheEntry {
  checkedAt: number;
  current: string;
  latest: string;
  force?: boolean;
  url?: string;
  webUrl?: string;
  message?: string;
}

function parseParts(v: string): [number, number, number] {
  const p = String(v || "")
    .split(".")
    .map((s) => parseInt(s, 10));
  return [p[0] || 0, p[1] || 0, p[2] || 0];
}

/** True when a < b (semver-ish numeric compare). */
function versionLess(a: string, b: string): boolean {
  const pa = parseParts(a);
  const pb = parseParts(b);
  return pa[0] !== pb[0] ? pa[0] < pb[0] : pa[1] !== pb[1] ? pa[1] < pb[1] : pa[2] < pb[2];
}

function currentVersion(): string {
  const v = Constants.expoConfig?.version;
  return typeof v === "string" && v ? v : "1.0.0";
}

const defaultStoreUrl = (): string =>
  Platform.OS === "ios"
    ? `https://apps.apple.com/app/id${Constants.expoConfig?.ios?.bundleIdentifier ?? ""}`
    : `market://details?id=${Constants.expoConfig?.android?.package ?? "com.onlinecrashcourse.app"}`;

/**
 * The latest released version comes from the backend (AppVersionTb), which the
 * developer bumps when a new build is uploaded to the store. Google removed the
 * version from the public Play Store page years ago, so scraping is unreliable.
 */
async function latestFromBackend(): Promise<{
  version: string;
  force: boolean;
  url: string;
  webUrl: string;
  message?: string;
} | null> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.getLatestAppVersion}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const version = typeof json?.latestVersion === "string" ? json.latestVersion : "";
  if (!version) return null;
  return {
    version,
    force: Boolean(json?.forceUpdate),
    url: typeof json?.storeUrl === "string" && json.storeUrl ? json.storeUrl : defaultStoreUrl(),
    webUrl:
      typeof json?.storeWebUrl === "string" && json.storeWebUrl
        ? json.storeWebUrl
        : `https://play.google.com/store/apps/details?id=${Constants.expoConfig?.android?.package ?? "com.onlinecrashcourse.app"}`,
    message: typeof json?.message === "string" ? json.message : undefined,
  };
}

function fromCache(cache: CacheEntry | null, current: string): UpdateCheckResult | null {
  if (!cache || cache.current !== current || !cache.latest) return null;
  if (Date.now() - (cache.checkedAt || 0) >= CACHE_TTL_MS) return null;
  return {
    updateAvailable: versionLess(current, cache.latest),
    currentVersion: current,
    latestVersion: cache.latest,
    forceUpdate: cache.force,
    storeUrl: cache.url,
    storeWebUrl: cache.webUrl,
    message: cache.message,
  };
}

/**
 * Compares the installed version against the backend's latest released version.
 * Results are cached for 24h so we don't hit the backend on every launch or
 * every time the app returns to the foreground. Any network/store failure
 * degrades to "no update" so the app is never blocked by this check.
 */
export async function checkForUpdates(force = false): Promise<UpdateCheckResult> {
  const current = currentVersion();
  try {
    let cache: CacheEntry | null = null;
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) cache = JSON.parse(raw) as CacheEntry;
    } catch {}

    if (!force) {
      const hit = fromCache(cache, current);
      if (hit) return hit;
    }

    const latest = await latestFromBackend();
    if (!latest || !latest.version) {
      return { updateAvailable: false, currentVersion: current };
    }

    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          checkedAt: Date.now(),
          current,
          latest: latest.version,
          force: latest.force,
          url: latest.url,
          webUrl: latest.webUrl,
          message: latest.message,
        })
      );
    } catch {}

    return {
      updateAvailable: versionLess(current, latest.version),
      currentVersion: current,
      latestVersion: latest.version,
      forceUpdate: latest.force,
      storeUrl: latest.url,
      storeWebUrl: latest.webUrl,
      message: latest.message,
    };
  } catch {
    return { updateAvailable: false, currentVersion: current };
  }
}