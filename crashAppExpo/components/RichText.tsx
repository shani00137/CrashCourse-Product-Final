import { View, Text, Platform } from "react-native";

interface RichTextProps {
  text: string;
  fontSize?: number;
  textColor?: string;
}

export function RichText({ text, fontSize = 13.5, textColor = "#1A1F1A" }: RichTextProps) {
  return (
    <View>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) {
          return <View key={i} style={{ height: 6 }} />;
        }

        const isTable = line.includes("|") && line.split("|").length > 3;

        if (isTable) {
          const cells = line
            .split("|")
            .filter((c) => c.trim().length > 0 && !c.includes("---"))
            .map((c) => c.trim());

          if (cells.length === 0) return null;

          return (
            <Text
              key={i}
              style={{
                fontSize: 11,
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                color: textColor,
                marginBottom: 2,
              }}
            >
              {cells.join("  │  ")}
            </Text>
          );
        }

        // Render bold **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <Text
            key={i}
            style={{ fontSize, lineHeight: fontSize * 1.5, color: textColor, marginBottom: 3 }}
          >
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <Text key={j} style={{ fontWeight: "700", color: textColor }}>
                  {part.slice(2, -2)}
                </Text>
              ) : (
                <Text key={j}>{part}</Text>
              )
            )}
          </Text>
        );
      })}
    </View>
  );
}
