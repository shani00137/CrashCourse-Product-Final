import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type CameraCapturedPicture,
} from "expo-camera";
import { analyzeProctorFrame } from "@/services/api";

interface ProctorMonitorProps {
  active: boolean;
  onViolation: () => void;
  /**
   * 1-based number of the question currently on screen. A silent frame is
   * taken once when this reaches each entry in `targets`.
   */
  questionNumber?: number;
  /** Question numbers to capture at. Defaults to 5, 10 and 20. */
  targets?: number[];
}

/** Question positions that are silently photographed in every exercise. */
export const PROCTOR_CAPTURE_POINTS = [5, 10, 20];

/**
 * Silently captures frames from the front camera at fixed points in an exercise
 * (questions 5, 10 and 20 by default) and uploads each to the backend, which
 * saves the image into the web root and runs the server-side YOLO phone
 * detector. If a phone is detected the session is terminated via `onViolation`.
 */
export default function ProctorMonitor({
  active,
  onViolation,
  questionNumber = 1,
  targets = PROCTOR_CAPTURE_POINTS,
}: ProctorMonitorProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [ready, setReady] = useState(false);

  const granted = permission?.granted ?? false;

  const activeRef = useRef(active);
  const grantedRef = useRef(granted);
  const readyRef = useRef(ready);
  const lockedRef = useRef(false);
  const onViolationRef = useRef(onViolation);

  activeRef.current = active;
  grantedRef.current = granted;
  readyRef.current = ready;
  onViolationRef.current = onViolation;

  // Question numbers already photographed this session (reset when inactive).
  const capturedRef = useRef<Set<number>>(new Set());

  const capture = async () => {
    if (!activeRef.current || lockedRef.current) return;
    if (!grantedRef.current || !readyRef.current || !cameraRef.current) return;

    let photo: CameraCapturedPicture | null = null;
    try {
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
        shutterSound: false,
      });
    } catch (e) {
      if (__DEV__) console.log("[proctor] capture failed:", String(e));
      return;
    }

    try {
      const result = await analyzeProctorFrame(photo.uri);
      if (__DEV__) {
        console.log(
          `[proctor] backend analysis (Q${questionNumber}): phoneDetected=${result.phoneDetected} image=${result.imageUrl ?? ""} ${result.message ?? ""}`
        );
      }
      if (result.phoneDetected && !lockedRef.current) {
        lockedRef.current = true;
        onViolationRef.current();
      }
    } catch (e) {
      if (__DEV__) console.log("[proctor] backend analysis failed:", String(e));
    }
  };

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  const captureRef = useRef(capture);
  captureRef.current = capture;

  // Take a frame once the camera is ready and the current question is one of
  // the capture points (5, 10, 20). Each point is captured at most once.
  useEffect(() => {
    if (!active || !granted || !ready) return;
    if (!targets.includes(questionNumber)) return;
    if (capturedRef.current.has(questionNumber)) return;

    capturedRef.current.add(questionNumber);
    captureRef.current();
  }, [active, granted, ready, questionNumber, targets]);

  useEffect(() => {
    if (!active) {
      capturedRef.current = new Set();
      lockedRef.current = false;
    }
  }, [active]);

  if (!active || !granted) {
    return null;
  }

  return (
    <CameraView
      ref={cameraRef}
      style={styles.hidden}
      facing="front"
      active
      onCameraReady={() => setReady(true)}
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 2,
    height: 2,
    opacity: 0,
    zIndex: -1,
  },
});