import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPalette, type ThemePalette } from "@/constants/theme";

const THEME_KEY = "crash_app_theme_v1";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue extends ThemePalette {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  ...getPalette("light"),
  mode: "light",
  isDark: false,
  setMode: () => {},
  toggleMode: () => {},
});

/**
 * Holds the light/dark mode for the whole app. The default is ALWAYS light;
 * the user's choice is persisted to AsyncStorage and re-applied on launch.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (!cancelled && (stored === "dark" || stored === "light")) {
          setModeState(stored);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const palette = getPalette(mode);
    return {
      ...palette,
      mode,
      isDark: mode === "dark",
      setMode,
      toggleMode: () => setMode(mode === "dark" ? "light" : "dark"),
    };
  }, [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Current theme: mode, colors, gradients, and setters. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Memoized theme-aware styles. Use it in place of a module-level
 * StyleSheet.create when the styles reference palette colors:
 *
 *   const makeStyles = ({ colors }: ThemePalette) =>
 *     StyleSheet.create({ box: { backgroundColor: colors.card } });
 *
 *   function Screen() {
 *     const styles = useThemedStyles(makeStyles);
 *     ...
 *   }
 *
 * Module-level styles that don't touch colors can stay as StyleSheet.create.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (palette: ThemePalette) => T
): T {
  const palette = useTheme();
  return StyleSheet.create(factory(palette));
}
