import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { buildPdfViewerHtml, pdfPageKey } from "@/constants/pdfViewerHtml";
import { bytesToBase64, loadSecurePdfBytes } from "@/services/securePdf";
import { useApp } from "@/context/AppContext";

export default function PdfPreviewScreen() {
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user } = useApp();
  const isTrial = !!user?.isTrial;

  const params = useLocalSearchParams<{
    url: string;
    fileName: string;
    courseName: string;
  }>();

  const uri = params.url;
  const fileName = params.fileName || "Course PDF";
  const courseName = params.courseName || "";

  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // While the user drags the page slider we preview the target page number
  // here without jumping until the finger is lifted.
  const [dragPage, setDragPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Opening PDF…");
  const [attempt, setAttempt] = useState(0);
  const initialPageRef = useRef(1);
  const webRef = useRef<WebView>(null);
  const bytesRef = useRef<Uint8Array | null>(null);
  const feedingRef = useRef(false);
  const feedAbortRef = useRef(false);

  // The app runs edge-to-edge, so the bottom of the screen sits under the
  // Android navigation keys. Lift the content above the system inset, pull the
  // bottom region (viewer + toolbar) in from the left/right edges as well, and
  // keep a small grey margin below the PDF so it never overlays the nav keys.
  // Some Android devices/font-scaling setups report a 0 inset, so always keep a
  // minimum bottom gap on Android.
  const insets = useSafeAreaInsets();
  const sidePad = Math.max(insets.left, 8);
  const sidePadRight = Math.max(insets.right, 8);
  const bottomPad = Math.max(
    insets.bottom + 6,
    Platform.OS === "android" ? 28 : 10
  );

  useEffect(() => {
    if (!uri || isTrial) {
      setReady(true);
      return;
    }
    let cancelled = false;
    feedAbortRef.current = false;
    feedingRef.current = false;
    bytesRef.current = null;
    setError("");
    setPdfLoaded(false);
    setReady(false);
    setLoading(true);
    setBusyLabel("Preparing PDF…");
    (async () => {
      let startPage = 1;
      try {
        const saved = await AsyncStorage.getItem(pdfPageKey(uri));
        const parsed = saved ? parseInt(saved, 10) : 1;
        if (!Number.isNaN(parsed) && parsed > 0) startPage = parsed;
      } catch {
        // fall through and start at page 1
      }
      initialPageRef.current = startPage;
      if (!cancelled) setCurrentPage(startPage);

      try {
        // Download once to the hidden app-private cache and decrypt in memory.
        // No plaintext PDF is ever written to a user-visible location.
        setBusyLabel("Decrypting…");
        const bytes = await loadSecurePdfBytes(uri);
        if (cancelled) return;
        bytesRef.current = bytes;
        setPdfLoaded(true);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error && e.message
              ? e.message
              : "Couldn't open the PDF. Check your connection and try again."
          );
          setLoading(false);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      feedAbortRef.current = true;
    };
  }, [uri, attempt, isTrial]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 60000);
    return () => clearTimeout(t);
  }, [loading]);

  // Built once per PDF (not on every page turn). The decrypted bytes are
  // streamed in separately so large books never go through one giant HTML string.
  const html = useMemo(() => {
    if (!ready || !uri || !pdfLoaded) return "";
    return buildPdfViewerHtml(uri, initialPageRef.current);
  }, [ready, uri, pdfLoaded]);

  // Streams the decrypted bytes into the WebView in base64 chunks. Chunks are
  // multiples of 3 bytes so none ends with base64 padding until the last one.
  const feedPdf = useCallback(async () => {
    const web = webRef.current;
    const bytes = bytesRef.current;
    if (!web || !bytes || feedingRef.current) return;
    feedingRef.current = true;
    setBusyLabel("Opening PDF…");
    const CHUNK = 3 * 128 * 1024;
    try {
      web.injectJavaScript(`window.__ccBegin(${bytes.length});true`);
      for (let offset = 0; offset < bytes.length; offset += CHUNK) {
        if (feedAbortRef.current) return;
        const chunk = bytesToBase64(bytes.subarray(offset, offset + CHUNK));
        web.injectJavaScript(`window.__ccFeed(${JSON.stringify(chunk)});true`);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (feedAbortRef.current) return;
      web.injectJavaScript("window.__ccEnd();true");
    } catch {
      if (!feedAbortRef.current) {
        setLoading(false);
        setError("Couldn't open the PDF. Check your connection and try again.");
      }
    } finally {
      feedingRef.current = false;
    }
  }, []);

  const retry = () => {
    setError("");
    setAttempt((a) => a + 1);
  };

  // Ask the WebView viewer to jump to a specific page (used by the slider).
  const jumpToPage = (page: number) => {
    const web = webRef.current;
    if (!web || totalPages <= 0) return;
    const target = Math.max(1, Math.min(totalPages, Math.round(page)));
    web.injectJavaScript(
      `if (window.__goToPage) { window.__goToPage(${target}); } true`
    );
  };

  const handleMessage = (e: { nativeEvent: { data: string } }) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d.type === "ready") {
        feedPdf();
      } else if (d.type === "page") {
        setLoading(false);
        const page = Number(d.page) || 1;
        setCurrentPage(page);
        if (d.pages) setTotalPages(Number(d.pages) || 0);
        if (uri) {
          AsyncStorage.setItem(pdfPageKey(uri), String(page)).catch(() => {});
        }
      } else if (d.type === "error") {
        setLoading(false);
        setError(
          `${typeof d.message === "string" && d.message ? d.message : "Couldn't load the PDF."}`
        );
      }
    } catch {
      // ignore non-JSON payloads
    }
  };

  // PDF books are a Pro feature: trial users never download or render them.
  if (isTrial) {
    return (
      <View style={[styles.flex, { paddingBottom: bottomPad }]}>
        <LinearGradient
          colors={gradients.darkRedGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        </LinearGradient>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.mutedForeground} />
          <Text style={styles.errorTitle}>PDF locked for trial users</Text>
          <Text style={styles.errorText}>
            PDF books are available on the Pro plan. Request the Pro upgrade
            from Settings to view them.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { paddingBottom: bottomPad }]}>
      {/* Header */}
      <LinearGradient
        colors={gradients.darkRedGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {fileName}
          </Text>
          {courseName ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {courseName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={retry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Viewer */}
      <View style={[styles.viewer, { marginLeft: sidePad, marginRight: sidePadRight }]}>
        {error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
            <Text style={styles.errorTitle}>Couldn't load the PDF</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retry}
              activeOpacity={0.85}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : ready && uri && html ? (
          <WebView
            ref={webRef}
            source={{ html }}
            style={styles.web}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="never"
            originWhitelist={["*"]}
            onMessage={handleMessage}
            onError={(e) => {
              setLoading(false);
              setError(e.nativeEvent.description || "Couldn't load the PDF.");
            }}
          />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
        {loading && !error && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>{busyLabel}</Text>
          </View>
        )}
      </View>

      {/* Toolbar — page indicator + slider to jump pages. */}
      <View style={[styles.toolbar, { marginLeft: sidePad, marginRight: sidePadRight }]}>
        <Text style={styles.pageLabel} numberOfLines={1}>
          {totalPages > 0
            ? `Page ${dragPage ?? currentPage} of ${totalPages}`
            : "Loading pages…"}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={Math.max(1, totalPages)}
          step={1}
          value={currentPage}
          disabled={totalPages <= 1}
          tapToSeek
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          onSlidingStart={() => setDragPage(currentPage)}
          onValueChange={(v) => setDragPage(Math.round(v))}
          onSlidingComplete={(v) => {
            const target = Math.round(v);
            setDragPage(null);
            jumpToPage(target);
          }}
        />
      </View>
    </View>
  );
}

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  viewer: {
    flex: 1,
    backgroundColor: "#525252",
    // Keep the PDF page off the bottom edge: a small grey breathing space
    // between the page canvas and the toolbar below.
    paddingBottom: 12,
  },
  web: {
    flex: 1,
    backgroundColor: "#525252",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: colors.background,
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // Keep the toolbar visible even when the native WebView layer sits above
    // sibling views (a known WKWebView behaviour).
    zIndex: 10,
    elevation: 10,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  slider: {
    width: "100%",
    height: 32,
  },
});