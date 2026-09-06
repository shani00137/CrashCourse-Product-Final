import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "@/constants/theme";
import { RichText } from "@/components/RichText";
import { explainQuestion } from "@/services/api";

const optionLabels = ["A", "B", "C", "D"];

const presetPrompts = [
  "Explain this question in simple terms",
  "Why is the correct answer right?",
  "Why are the other options wrong?",
  "Summarize the key concept",
];

interface QuestionAiModalProps {
  visible: boolean;
  questionText: string;
  options: string[];
  correct: number;
  questionNumber?: number;
  onClose: () => void;
}

export function QuestionAiModal({
  visible,
  questionText,
  options,
  correct,
  questionNumber,
  onClose,
}: QuestionAiModalProps) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setPrompt("");
      setAnswer(null);
      setError("");
      setLoading(false);
    }
  }, [visible]);

  const send = async (preset?: string) => {
    const p = (preset ?? prompt).trim();
    if (!p || loading) return;
    setPrompt(preset ? p : prompt);
    setLoading(true);
    setAnswer(null);
    setError("");
    try {
      const res = await explainQuestion({
        question: questionText,
        options,
        prompt: p,
        maxWords: 130,
      });
      if (!res.succeeded) {
        setError(res.message || "Could not get an answer.");
      } else if (res.answer) {
        setAnswer(res.answer);
      } else {
        setError("No answer returned. Please try again.");
      }
      if (!preset) setPrompt("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again."
      );
      setPrompt("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerAvatar}>
              <Ionicons name="sparkles" size={18} color="#FDE047" />
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>AI Tutor</Text>
              <Text style={styles.headerSubtitle}>
                {questionNumber != null
                  ? `Helper for Question ${questionNumber}`
                  : "Ask anything about this question"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Question card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{questionText}</Text>
            {options.length > 0 && (
              <View style={styles.optionList}>
                {options.map((opt, idx) => {
                  const isCorrect = idx === correct;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.optionRow,
                        isCorrect && styles.optionRowCorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionBadge,
                          isCorrect && styles.optionBadgeCorrect,
                        ]}
                      >
                        {isCorrect ? "✓" : optionLabels[idx]}
                      </Text>
                      <Text
                        style={[
                          styles.optionText,
                          isCorrect && styles.optionTextCorrect,
                        ]}
                      >
                        {opt}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Preset prompts */}
          <View style={styles.presetWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetRow}
            >
              {presetPrompts.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.presetChip}
                  onPress={() => send(p)}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.presetChipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Answer area */}
          <ScrollView
            style={styles.answerArea}
            contentContainerStyle={styles.answerContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.typingBox}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.typingText}>Thinking…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : answer ? (
              <View style={styles.answerBox}>
                <View style={styles.answerHeader}>
                  <Ionicons name="sparkles" size={13} color={colors.green} />
                  <Text style={styles.answerHeaderText}>Short answer</Text>
                </View>
                <RichText text={answer} />
              </View>
            ) : (
              <Text style={styles.hintText}>
                Pick a quick question above or type your own, then tap send.
                You'll get a short, exam-focused explanation.
              </Text>
            )}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask about this question…"
                placeholderTextColor={colors.mutedForeground}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                onSubmitEditing={() => send()}
                returnKeyType="send"
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    prompt.trim() && !loading ? colors.primary : "#E5E7EB",
                  ...(prompt.trim() && !loading ? shadows.md : {}),
                },
              ]}
              onPress={() => send()}
              disabled={!prompt.trim() || loading}
              activeOpacity={0.9}
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  prompt.trim() && !loading
                    ? colors.white
                    : colors.mutedForeground
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    height: "88%",
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.sm,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    color: colors.foreground,
  },
  optionList: {
    marginTop: 12,
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  optionRowCorrect: {
    backgroundColor: colors.greenLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  optionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.muted,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
    overflow: "hidden",
  },
  optionBadgeCorrect: {
    backgroundColor: "#DCFCE7",
    color: colors.green,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.foreground,
  },
  optionTextCorrect: {
    color: colors.green,
    fontWeight: "600",
  },
  presetWrap: {
    paddingVertical: 12,
  },
  presetRow: {
    gap: 8,
    paddingHorizontal: 16,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },
  answerArea: {
    flex: 1,
  },
  answerContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.mutedForeground,
    paddingTop: 12,
  },
  typingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 12,
  },
  typingText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.redLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "#FECDD3",
    padding: 14,
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#9F1239",
  },
  answerBox: {
    marginTop: 12,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  answerHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.green,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    fontSize: 14,
    color: colors.foreground,
    maxHeight: 80,
    paddingVertical: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});