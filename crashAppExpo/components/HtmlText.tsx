import React, { useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

interface HtmlTextProps {
  html: string;
  fontSize?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");

function prepareHtml(html: string, color: string, fontSize: number) {
  const body = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+\/api\/Files\//gi, `${apiOrigin}/api/Files/`)
    .replace(/(src=["'])\/api\/Files\//gi, `$1${apiOrigin}/api/Files/`)
    .replace(/(src=["'])api\/Files\//gi, `$1${apiOrigin}/api/Files/`);

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
    html,body{margin:0;padding:0;background:transparent;color:${color};font-size:${fontSize}px;line-height:1.5;}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;word-break:break-word;}
    p{margin:0 0 8px;}p:last-child{margin-bottom:0;}
    ul,ol{margin:4px 0 8px;padding-left:20px;}
    img{max-width:100%;height:auto;border-radius:6px;margin:4px 0;}
    table{border-collapse:collapse;max-width:100%;}td,th{border:1px solid #CBD5E0;padding:4px 6px;}
  </style></head><body>${body}<script>
    function postHeight(){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));}}
    window.addEventListener('load',postHeight);
    window.addEventListener('resize',postHeight);
    document.querySelectorAll('img').forEach(function(img){img.addEventListener('load',postHeight);img.addEventListener('error',postHeight);});
    setTimeout(postHeight,100);setTimeout(postHeight,500);true;
  </script></body></html>`;
}

export function HtmlText({ html, fontSize = 14, color, style }: HtmlTextProps) {
  const { colors } = useTheme();
  const [height, setHeight] = useState(60);
  const resolvedColor = color ?? colors.foreground;
  const source = useMemo(
    () => ({ html: prepareHtml(html, resolvedColor, fontSize) }),
    [html, resolvedColor, fontSize]
  );

  return (
    <View style={[styles.container, { height }, style]}>
      <WebView
        source={source}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.webView}
        onMessage={(event) => {
          const next = Number(event.nativeEvent.data);
          if (Number.isFinite(next) && next > 0) setHeight(Math.ceil(next));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
