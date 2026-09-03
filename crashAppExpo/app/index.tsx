import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image } from "expo-image";
import { colors, gradients } from "@/constants/theme";

const logoSource = require("@/assets/logo/logo.jpg");

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const dotAnimations = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          easing: Easing.back(1.5),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    dotAnimations.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.6,
            duration: 500,
            delay: index * 220,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#C41E3A", "#8B0000", "#166534"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale }], opacity },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.textBlock}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleY }],
              },
            ]}
          >
            Crash Course
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Health Care Professionals
          </Animated.Text>
        </View>

        <Animated.View style={[styles.pill, { opacity: pillOpacity }]}>
          <Text style={styles.pillText}>Study Smarter · Practice Better · Excel</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        {dotAnimations.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { transform: [{ scale: anim }] },
            ]}
          />
        ))}
      </Animated.View>

      <Text style={styles.version}>v2.0 · For Medical Students</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -70,
    left: -70,
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  ringOuter: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ringInner: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  logoContainer: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: colors.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
    elevation: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
  },
  tagline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pillText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  version: {
    position: "absolute",
    bottom: 28,
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
  },
});
