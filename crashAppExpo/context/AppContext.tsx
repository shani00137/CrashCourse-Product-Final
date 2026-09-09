import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSessionToken as setApiToken } from "@/services/api";
import { registerDeviceNotifications } from "@/services/notifications";

const SESSION_KEY = "crash_app_session_v1";
export const SESSION_TTL_DAYS = 7;

export interface User {
  name: string;
  isGuest: boolean;
  appUserId?: number;
  applicantId?: number;
  courseId?: number;
  courseName?: string;
  isTrial?: boolean;
  planExpiry?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface TestResult {
  name: string;
  score: number;
  total: number;
}

interface StoredSession {
  user: User;
  token: string;
  savedAt: string;
  expiresAt: string;
}

interface AppContextValue {
  user: User | null;
  sessionToken: string;
  userLoaded: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
}

const AppContext = createContext<AppContextValue>({
  user: null,
  sessionToken: "",
  userLoaded: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  testResults: [],
  addTestResult: () => {},
});

function defaultSession(
  user: User,
  token: string,
  now = Date.now()
): StoredSession {
  return {
    user,
    token,
    savedAt: new Date(now).toISOString(),
    expiresAt: new Date(
      now + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [userLoaded, setUserLoaded] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  // Restore the persisted session (if any) when the app starts.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const session = JSON.parse(raw) as StoredSession;
        if (!session || !session.user) return;
        const expiresAt = new Date(session.expiresAt).getTime();
        if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
          await AsyncStorage.removeItem(SESSION_KEY);
          return;
        }
        if (mounted) {
          setUser(session.user);
          setApiToken(session.token || "");
        }
        // Register the device for push notifications as soon as the session is
        // restored; best-effort and guarded inside the helper.
        void registerDeviceNotifications(session.user.appUserId);
        // Ignore corrupt storage; fall through to unauthenticated state.
      } catch {
        // Ignore corrupt storage; fall through to unauthenticated state.
      } finally {
        if (mounted) setUserLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextUser: User, token: string) => {
    try {
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify(defaultSession(nextUser, token))
      );
    } catch {
      // Persistence is best-effort; the in-memory session still works.
    }
  }, []);

  const login = useCallback(
    (nextUser: User, token = "") => {
      setUser(nextUser);
      setSessionToken(token);
      setApiToken(token);
      persistSession(nextUser, token);
      void registerDeviceNotifications(nextUser.appUserId);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    setUser(null);
    setSessionToken("");
    setApiToken("");
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors on logout.
    }
  }, []);

  const updateUser = useCallback(
    (partial: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...partial };
        persistSession(next, sessionToken);
        return next;
      });
    },
    [persistSession, sessionToken]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        sessionToken,
        userLoaded,
        login,
        logout,
        updateUser,
        testResults,
        addTestResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}