import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, gradients } from "@/constants/theme";
import { buildPdfViewerHtml, pdfPageKey } from "@/constants/pdfViewerHtml";

export default function PdfPreviewScreen() {
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
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useNative, setUseNative] = useState(false);
  const webRef = useRef<WebView>(null);

  useEffect(() => {
    if (!uri) {
      setReady(true);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(pdfPageKey(uri));
        const page = saved ? parseInt(saved, 10) : 1;
        if (!Number.isNaN(page) && page > 0) setCurrentPage(page);
      } catch {
        // fall through and start at page 1
      } finally {
        setReady(true);
      }
    })();
  }, [uri]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  const html = ready && uri ? buildPdfViewerHtml(uri, currentPage) : "";

  const handleMessage = (e: { nativeEvent: { data: string } }) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d.type === "page") {
        const page = Number(d.page) || 1;
        setCurrentPage(page);
        if (d.pages) setTotalPages(Number(d.pages) || 0);
        if (uri) {
          AsyncStorage.setItem(pdfPageKey(uri), String(page)).catch(() => {});
        }
      } else if (d.type === "error") {
        if (!useNative) {
          // page-tracking viewer couldn't fetch the PDF (server may not send
          // CORS headers yet) -> fall back to the OS native PDF renderer.
          setUseNative(true);
          setError("");
          setLoading(true);
          return;
        }
        setLoading(false);
        setError(
          `${typeof d.message === "string" && d.message ? d.message : "Couldn't load the PDF."}`
        );
      }
    } catch {
      // ignore non-JSON payloads
    }
  };

  const cmd = (c: "next" | "prev" | "in" | "out") => {
    if (c === "in") setZoom((z) => Math.min(4, Math.round(z * 1.25 * 100) / 100));
    if (c === "out") setZoom((z) => Math.max(0.4, Math.round(z / 1.25 * 100) / 100));
    webRef.current?.injectJavaScript(`window.__nav&&window.__nav("${c}");true`);
  };

  const canPrev = currentPage > 1;
  const canNext = totalPages === 0 || currentPage < totalPages;

  return (
    <View style={styles.flex}>
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
          onPress={() => {
            setError("");
            setLoading(true);
            webRef.current?.reload();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Viewer */}
      <View style={styles.viewer}>
        {error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
            <Text style={styles.errorTitle}>Couldn't load the PDF</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorUrl} selectable>
              {uri}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError("");
                setLoading(true);
                webRef.current?.reload();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
            {useNative && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setUseNative(false);
                  setError("");
                  setLoading(true);
                  webRef.current?.reload();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.switchText}>Back to page-tracking view</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : useNative ? (
          <WebView
            ref={webRef}
            source={{ uri }}
            style={styles.web}
            javaScriptEnabled
            setBuiltInZoomControls
            setDisplayZoomControls={false}
            allowsInlineMediaPlayback
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              setLoading(false);
              setError(e.nativeEvent.description || "Couldn't load the PDF.");
            }}
          />
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
            onLoadEnd={() => setLoading(false)}
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
            <Text style={styles.loadingText}>Opening PDF…</Text>
          </View>
        )}
      </View>

      {/* Toolbar */}
      {!useNative && (
        <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton} onPress={() => cmd("out")} activeOpacity={0.8}>
          <Ionicons name="remove" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
        <TouchableOpacity style={styles.toolButton} onPress={() => cmd("in")} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.toolDivider} />
        <Text style={styles.pageLabel}>
          {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : "Loading pages…"}
        </Text>
        <View style={styles.toolFiller} />
        <TouchableOpacity
          style={[styles.toolButton, !canPrev && styles.toolButtonDisabled]}
          disabled={!canPrev}
          onPress={() => cmd("prev")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canPrev ? colors.foreground : "#CBD5E0"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, !canNext && styles.toolButtonDisabled]}
          disabled={!canNext}
          onPress={() => cmd("next")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={canNext ? colors.foreground : "#CBD5E0"}
          />
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  errorUrl: {
    color: colors.primary,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
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
  switchButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  switchText: {
    color: colors.primary,
    fontSize: 12,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toolButtonDisabled: {
    opacity: 0.4,
  },
  zoomLabel: {
    minWidth: 44,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.foreground,
  },
  toolDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  pageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  toolFiller: {
    flex: 1,
  },
});