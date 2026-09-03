import React, { createContext, useContext, useState } from "react";

export interface User {
  name: string;
  isGuest: boolean;
  appUserId?: number;
  applicantId?: number;
  courseId?: number;
}

export interface TestResult {
  name: string;
  score: number;
  total: number;
}

interface AppContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
}

const AppContext = createContext<AppContextValue>({
  user: null,
  setUser: () => {},
  testResults: [],
  addTestResult: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  return (
    <AppContext.Provider value={{ user, setUser, testResults, addTestResult }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
