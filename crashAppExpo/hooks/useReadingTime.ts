import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveReadingTime } from "@/services/api";

const SYNC_INTERVAL_MS = 30000;

function bufferKey(appUserId: number, courseId: number, start: number, end: number) {
  return `reading_time_buffer_${appUserId}_${courseId}_${start}_${end}`;
}

interface Options {
  appUserId?: number;
  courseId: number;
  start: number;
  end: number;
  active: boolean;
}

/**
 * Tracks the seconds a user actively spends on an exercise screen while the
 * app is in the foreground, syncing the accumulated delta to the backend every
 * 30s and on app-background / unmount. If a sync fails, the delta is kept in a
 * per-user/per-exercise AsyncStorage buffer and retried on the next flush.
 */
export function useReadingTime({ appUserId, courseId, start, end, active }: Options) {
  const accSecRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const optsRef = useRef({ appUserId, courseId, start, end });
  optsRef.current = { appUserId, courseId, start, end };

  useEffect(() => {
    const { appUserId: uid, courseId: cid, start: s, end: e } = optsRef.current;

    async function flush() {
      if (!uid) return;
      const delta = Math.floor(accSecRef.current);
      if (delta <= 0) return;
      accSecRef.current -= delta;

      const key = bufferKey(uid, cid, s, e);
      let pending = 0;
      try {
        pending = Number(await AsyncStorage.getItem(key)) || 0;
      } catch {
        // Ignore read errors; the delta is still sent below.
      }

      try {
        await saveReadingTime({
          appUserId: uid,
          courseId: cid,
          exerciseStart: s,
          exerciseEnd: e,
          seconds: pending + delta,
        });
        await AsyncStorage.setItem(key, "0");
      } catch {
        try {
          await AsyncStorage.setItem(key, String(pending + delta));
        } catch {
          // Nothing else to do if storage is unavailable.
        }
      }
    }

    if (!active) {
      if (startedAtRef.current != null) {
        accSecRef.current += (Date.now() - startedAtRef.current) / 1000;
        startedAtRef.current = null;
      }
      return;
    }

    startedAtRef.current = Date.now();
    const syncTimer = setInterval(() => {
      void flush();
    }, SYNC_INTERVAL_MS);

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        if (startedAtRef.current == null) startedAtRef.current = Date.now();
        return;
      }
      if (startedAtRef.current != null) {
        accSecRef.current += (Date.now() - startedAtRef.current) / 1000;
        startedAtRef.current = null;
      }
      void flush();
    });

    return () => {
      clearInterval(syncTimer);
      sub.remove();
      if (startedAtRef.current != null) {
        accSecRef.current += (Date.now() - startedAtRef.current) / 1000;
        startedAtRef.current = null;
      }
      void flush();
    };
  }, [active]);
}