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
}

/**
 * Captures a single silent frame from the front camera right when an exercise
 * starts (first question) and uploads it to the backend, which saves the image
 * into the web root and runs the server-side YOLO phone detector. If a phone is
 * detected the session is terminated via `onViolation`.
 */
export default function ProctorMonitor({ active, onViolation }: ProctorMonitorProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [ready, setReady] = useState(false);

  const granted = permission?.granted ?? false;

  const activeRef = useRef(active);
  const grantedRef = useRef(granted);
  const readyRef = useRef(ready);
  const lockedRef = useRef(false);
  const capturedRef = useRef(false);
  const onViolationRef = useRef(onViolation);

  activeRef.current = active;
  grantedRef.current = granted;
  readyRef.current = ready;
  onViolationRef.current = onViolation;

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
      capturedRef.current = true;
      return;
    }

    capturedRef.current = true;

    try {
      const result = await analyzeProctorFrame(photo.uri);
      if (__DEV__) {
        console.log(
          `[proctor] backend analysis: phoneDetected=${result.phoneDetected} image=${result.imageUrl ?? ""} ${result.message ?? ""}`
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

  useEffect(() => {
    if (active && granted && ready) {
      if (!capturedRef.current) {
        captureRef.current();
      }
    }
  }, [active, granted, ready]);

  useEffect(() => {
    if (!active) {
      capturedRef.current = false;
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