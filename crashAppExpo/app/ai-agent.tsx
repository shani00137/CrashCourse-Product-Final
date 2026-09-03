import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { RichText } from "@/components/RichText";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "What is the mechanism of beta-blockers?",
  "Explain the cardiac cycle",
  "Symptoms of appendicitis?",
  "How does insulin regulate glucose?",
  "Layers of the heart wall",
  "Type 1 vs Type 2 diabetes",
];

const responses: Record<string, string> = {
  beta: "**Beta-blockers — Mechanism of Action**\n\nCompetitively antagonise catecholamines at β-adrenergic receptors.\n\n**β1 blockade (cardiac):**\n• ↓ Heart rate (chronotropy)\n• ↓ Contractility (inotropy)\n• ↓ AV conduction\n• ↓ Renin release\n\n**β2 blockade (non-selective only):**\n• Bronchoconstriction ⚠️\n• Peripheral vasoconstriction\n\n**Examples:**\n• Selective β1: Metoprolol, Atenolol, Bisoprolol\n• Non-selective: Propranolol, Carvedilol\n\n**Uses:** HTN, angina, post-MI, heart failure, AF rate control, thyroid storm",

  cardiac: "**The Cardiac Cycle** — at 75 bpm, one cycle ≈ 0.8 s\n\n1️⃣ **Atrial Systole** — atria contract → 20% of ventricular filling\n\n2️⃣ **Isovolumetric Contraction** — ventricles contract, all valves CLOSED, pressure builds\n\n3️⃣ **Rapid Ejection** — semilunar valves OPEN → blood into aorta & pulmonary artery\n\n4️⃣ **Reduced Ejection** — continued but slowing ejection\n\n5️⃣ **Isovolumetric Relaxation** — all valves CLOSED again, pressure falls rapidly\n\n6️⃣ **Rapid Ventricular Filling** — AV valves open → ~80% of filling is passive\n\n**Key heart sounds:**\n• S1 = mitral + tricuspid closure\n• S2 = aortic + pulmonary closure",

  appendicitis: "**Appendicitis — Classic Presentation**\n\n**Pain progression:**\n1. Central/periumbilical pain (visceral — referred)\n2. Nausea & vomiting (after pain onset)\n3. Anorexia\n4. Pain migrates → RLQ, McBurney's point (somatic)\n5. Low-grade fever (37.5–38.5°C)\n\n**Clinical signs:**\n• **Rovsing's** — RLQ pain on palpating LLQ\n• **Psoas** — pain on right hip extension (retrocaecal)\n• **Obturator** — pain on internal hip rotation (pelvic)\n• Rebound tenderness, guarding\n\n**Investigations:** WBC ↑, CRP ↑, CT abdomen (gold standard), USS (children/pregnant)\n\n**Alvarado score** ≥7 → likely appendicitis\n\n**Treatment:** Laparoscopic appendicectomy",

  insulin: "**Insulin & Glucose Regulation**\n\n**Source:** β-cells of islets of Langerhans\n**Trigger:** ↑ blood glucose (postprandial)\n\n**Receptor:** Tyrosine kinase receptor (IRS-1 pathway)\n\n**Peripheral effects:**\n• ↑ GLUT-4 translocation → ↑ glucose uptake (muscle, fat)\n• ↑ Glycogenesis (glucose → glycogen)\n• ↑ Lipogenesis\n• ↑ Protein synthesis\n\n**Liver effects:**\n• ↓ Glycogenolysis\n• ↓ Gluconeogenesis\n• ↑ Glycogen synthesis\n\n**Normal fasting glucose:** 3.9–5.5 mmol/L (70–99 mg/dL)\n**Postprandial peak:** returns to normal within 2 hours",

  heart: "**Layers of the Heart Wall (outside → in)**\n\n**1. Pericardium** (outer sac)\n• Fibrous pericardium — tough, inextensible\n• Serous pericardium — parietal & visceral layers\n• Pericardial cavity: 15–50 mL lubricating fluid\n\n**2. Epicardium** (visceral pericardium)\n• Outermost layer of heart itself\n• Contains coronary vessels, autonomic nerves, fat\n\n**3. Myocardium**\n• Thickest layer — cardiac muscle (striated, involuntary)\n• Thickest in left ventricle (6× thicker than RV)\n• Connected by intercalated discs & gap junctions\n\n**4. Endocardium**\n• Innermost smooth endothelial lining\n• Lines chambers, valves, and chordae tendineae\n• Continuous with vascular endothelium",

  diabetes: "**Type 1 vs Type 2 Diabetes Mellitus**\n\n| Feature | Type 1 | Type 2 |\n|---|---|---|\n| Pathology | Autoimmune β-cell destruction | Insulin resistance + relative deficiency |\n| Onset | Childhood / young adult | Adult (>40, ↓ age with obesity) |\n| Build | Usually lean | Usually obese |\n| Insulin | Absent | Reduced / ineffective |\n| C-peptide | Low/absent | Present |\n| Autoantibodies | Yes (GAD, ICA, IAA) | No |\n| Ketoacidosis | Common (DKA) | Rare |\n| HLA | DR3, DR4 | No HLA link |\n| Treatment | Insulin always | Lifestyle → Metformin → others → Insulin |\n\n**Diagnosis:** HbA1c ≥48 mmol/mol (6.5%) or fasting glucose ≥7.0 mmol/L",

  default: "That's a great medical question! I can provide detailed, exam-ready answers on:\n\n• **Pharmacology** — drug mechanisms, side effects, interactions\n• **Anatomy** — systems, landmarks, clinical correlations\n• **Physiology** — mechanisms, homeostasis, pathophysiology\n• **Pathology** — disease mechanisms, presentations\n• **Internal Medicine** — diagnosis, management, emergencies\n• **Biochemistry** — metabolic pathways, enzymes\n\nTry asking something specific like:\n— \"What is the mechanism of warfarin?\"\n— \"Explain the renin-angiotensin-aldosterone system\"\n— \"What causes Cushing syndrome?\"\n\nI'll give you a structured, concise explanation optimised for exams! 🩺",
};

function getAIResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("beta") || q.includes("blocker")) return responses.beta;
  if (q.includes("cardiac cycle") || q.includes("heart cycle")) return responses.cardiac;
  if (q.includes("appendicit") || q.includes("appendix")) return responses.appendicitis;
  if (q.includes("insulin") || q.includes("glucose")) return responses.insulin;
  if (q.includes("layer") && (q.includes("heart") || q.includes("wall"))) return responses.heart;
  if (q.includes("diabetes") || q.includes("type 1") || q.includes("type 2")) return responses.diabetes;
  return responses.default + `\n\nYou asked: **"${input}"**`;
}

const TypingDots = () => {
  const anims = [0, 1, 2].map((i) => useRef(new Animated.Value(1)).current);

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.5,
            duration: 400,
            delay: i * 180,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={styles.typingDots}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { transform: [{ scale: anim }] }]}
        />
      ))}
      <Text style={styles.typingText}>Thinking...</Text>
    </View>
  );
};

const welcomeMessage: Message = {
  id: "0",
  role: "assistant",
  text: "Hello! I'm your **AI Medical Tutor** for Crash Course. 🩺\n\nI can help you with:\n• Anatomy & Physiology\n• Pharmacology & drug mechanisms\n• Pathology & clinical presentations\n• Biochemistry & metabolism\n• Exam preparation\n\nWhat would you like to learn today?",
  timestamp: new Date(),
};

export default function AIAgentScreen() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || typing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 700));
    setTyping(false);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: getAIResponse(query),
      timestamp: new Date(),
    };
    setMessages((m) => [...m, aiMsg]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={gradients.darkRedGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="brain" size={22} color="#FDE047" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Smart AI Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Medical Tutor · Online</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setMessages([welcomeMessage])}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={15} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Suggested questions — visible only at start */}
        {messages.length === 1 && (
          <View style={styles.suggestedSection}>
            <View style={styles.suggestedHeader}>
              <Ionicons name="book-outline" size={12} color={colors.mutedForeground} />
              <Text style={styles.suggestedHeaderText}>Quick questions:</Text>
            </View>
            <View style={styles.suggestedList}>
              {suggestedQuestions.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.suggestedChip}
                  onPress={() => send(q)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestedChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.role === "user" ? styles.userRow : styles.assistantRow,
            ]}
          >
          {msg.role === "assistant" && (
            <LinearGradient
              colors={[colors.primaryDark, colors.green]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.assistantAvatar, styles.avatarGradient]}
            >
              <Ionicons name="sparkles" size={14} color="#FDE047" />
            </LinearGradient>
          )}

            <View
              style={[
                styles.messageBubble,
                msg.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {msg.role === "assistant" ? (
                <RichText text={msg.text} />
              ) : (
                <Text style={styles.userMessageText}>{msg.text}</Text>
              )}
              <Text
                style={[
                  styles.messageTime,
                  msg.role === "user" ? styles.userTime : styles.assistantTime,
                ]}
              >
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing indicator */}
        {typing && (
          <View style={styles.messageRow}>
            <LinearGradient
              colors={[colors.primaryDark, colors.green]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.assistantAvatar, styles.avatarGradient]}
            >
              <Ionicons name="sparkles" size={14} color="#FDE047" />
            </LinearGradient>
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a medical question..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: input.trim() && !typing ? colors.primary : "#E5E7EB",
              ...(input.trim() && !typing ? shadows.md : {}),
            },
          ]}
          onPress={() => send()}
          disabled={!input.trim() || typing}
          activeOpacity={0.9}
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() && !typing ? colors.white : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        AI Tutor · Crash Course · For study purposes only
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
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
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  onlineText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContent: {
    padding: 16,
  },
  suggestedSection: {
    marginBottom: 12,
  },
  suggestedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  suggestedHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  suggestedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestedChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestedChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    ...shadows.sm,
  },
  avatarGradient: {
    backgroundColor: undefined,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
    ...shadows.md,
  },
  assistantBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(22,101,52,0.1)",
    borderBottomLeftRadius: 6,
    ...shadows.sm,
  },
  userMessageText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 6,
  },
  userTime: {
    color: colors.white,
    textAlign: "right",
  },
  assistantTime: {
    color: colors.foreground,
    textAlign: "left",
  },
  typingBubble: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.sm,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mutedForeground,
  },
  typingText: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadows.sm,
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
  disclaimer: {
    textAlign: "center",
    fontSize: 10,
    color: colors.mutedForeground,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
});
