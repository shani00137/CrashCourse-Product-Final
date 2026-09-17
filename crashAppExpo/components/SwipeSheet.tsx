import React from "react";
import { View, useWindowDimensions, StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

interface SwipeSheetProps {
  onClose: () => void;
  /** Optional draggable region (e.g. the app header). Dragging it down dismisses the sheet. */
  handle?: React.ReactNode;
  /** Card style applied to the whole sheet (rounded top corners, background, shadow). */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function SwipeSheet({
  onClose,
  handle,
  style,
  children,
}: SwipeSheetProps) {
  const { height } = useWindowDimensions();
  const ty = useSharedValue(0);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  const close = () => onCloseRef.current();

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetY(-12)
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        ty.value = withSpring(
          height * 0.9,
          { damping: 22, stiffness: 200, velocity: e.velocityY },
          (finished) => {
            if (finished) runOnJS(close)();
          }
        );
      } else {
        ty.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[style, sheetStyle]}>
      {handle ? (
        <GestureDetector gesture={pan}>
          <View>{handle}</View>
        </GestureDetector>
      ) : null}
      {children}
    </Animated.View>
  );
}