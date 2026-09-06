import { useCallback, useEffect, useState } from "react";
import { getAllReadingTime, getUserTests, type UserTestInfo } from "@/services/api";

export interface ReadingModule {
  exerciseStart: number;
  exerciseEnd: number;
  minutes: number;
}

export interface StudyData {
  loading: boolean;
  error: string;
  readingMinutes: number;
  modules: ReadingModule[];
  moduleCount: number;
  tests: UserTestInfo[];
  completedTests: UserTestInfo[];
  testsDone: number;
  testsInProgress: number;
  avgScore: number;
  bestScore: number;
  totalQuestionsAnswered: number;
  recentCompleted: UserTestInfo[];
  refresh: () => Promise<void>;
}

function pct(t: UserTestInfo): number {
  const total = t.questions || 1;
  const right = t.rightQuestions || 0;
  return Math.round((right / Math.max(total, 1)) * 100);
}

function scoreOf(test: UserTestInfo): number {
  return test.isCompleted ? pct(test) : 0;
}

/**
 * Loads a user's persisted reading time (per exercise) and test history and
 * derives the stats shown by the Dashboard and Stats screens. Both fetches are
 * guarded so one failing endpoint never blocks the page.
 */
export function useStudyData(appUserId?: number): StudyData {
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [modules, setModules] = useState<ReadingModule[]>([]);
  const [tests, setTests] = useState<UserTestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!appUserId) {
      setReadingMinutes(0);
      setModules([]);
      setTests([]);
      setLoading(false);
      return;
    }
    let minutes = 0;
    let mods: ReadingModule[] = [];
    try {
      const rows = await getAllReadingTime(appUserId);
      if (Array.isArray(rows)) {
        mods = rows
          .filter((r) => (r.totalSeconds || 0) > 0)
          .map((r) => ({
            exerciseStart: r.exerciseStart,
            exerciseEnd: r.exerciseEnd,
            minutes: Math.max(1, Math.round((r.totalSeconds || 0) / 60)),
          }))
          .sort((a, b) => b.minutes - a.minutes);
        minutes = mods.reduce((a, b) => a + b.minutes, 0);
      }
    } catch {
      // Reading-time table may not exist on the hosted DB yet.
    }
    setModules(mods);
    setReadingMinutes(minutes);

    let t: UserTestInfo[] = [];
    let err = "";
    try {
      t = await getUserTests(appUserId);
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    setTests(t);
    setError(err);
    setLoading(false);
  }, [appUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const completedTests = tests.filter((test) => test.isCompleted);
  const testsInProgress = tests.filter(
    (test) => !test.isCompleted && (test.answeredQuestions || 0) > 0
  );

  let avgScore = 0;
  let bestScore = 0;
  if (completedTests.length > 0) {
    const values = completedTests.map(scoreOf);
    avgScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    bestScore = Math.max(...values);
  }

  const totalQuestionsAnswered = tests.reduce(
    (acc, t) => acc + Math.min(t.answeredQuestions || 0, t.questions || t.answeredQuestions || 0),
    0
  );

  const recentCompleted = [...completedTests].sort((a, b) => {
    const da = a.testDate || "";
    const db = b.testDate || "";
    return db < da ? -1 : da < db ? 1 : 0;
  }).slice(0, 3);

  return {
    loading,
    error,
    readingMinutes,
    modules,
    moduleCount: modules.length,
    tests,
    completedTests,
    testsDone: completedTests.length,
    testsInProgress: testsInProgress.length,
    avgScore,
    bestScore,
    totalQuestionsAnswered,
    recentCompleted,
    refresh: load,
  };
}