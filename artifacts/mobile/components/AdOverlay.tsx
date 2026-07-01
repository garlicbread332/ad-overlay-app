import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";

interface AdOverlayProps {
  visible: boolean;
  durationSeconds?: number;
  onClose: () => void;
  onAdComplete?: () => void;
}

export default function AdOverlay({
  visible,
  durationSeconds = 15,
  onClose,
  onAdComplete,
}: AdOverlayProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState(durationSeconds);
  const [canClose, setCanClose] = useState(false);
  const [adEnded, setAdEnded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const btnFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (visible) {
      setCountdown(durationSeconds);
      setCanClose(false);
      setAdEnded(false);
      progressAnim.setValue(0);
      btnFadeAnim.setValue(0);
      pulseAnim.setValue(1);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      progressRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: durationSeconds * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      progressRef.current.start();

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setCanClose(true);
            setAdEnded(true);
            onAdComplete?.();
            Animated.timing(btnFadeAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }).start(() => startPulse());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      progressRef.current?.stop();
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      progressRef.current?.stop();
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (!canClose) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [canClose, onClose]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim, backgroundColor: colors.overlay }]}
      >
        <Animated.View
          style={[
            styles.adContainer,
            {
              transform: [{ scale: scaleAnim }],
              paddingTop: topInset + 12,
              paddingBottom: bottomInset + 12,
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={styles.adLabel}>
              <Feather name="zap" size={11} color={colors.primary} />
              <Text style={[styles.adLabelText, { color: colors.primary }]}>AD</Text>
            </View>

            {!canClose ? (
              <View style={[styles.countdownBadge, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={styles.countdownText}>{countdown}s</Text>
              </View>
            ) : (
              <Animated.View style={{ opacity: btnFadeAnim, transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  onPress={handleClose}
                  style={[styles.closeBtn, { backgroundColor: colors.adSkipActive }]}
                  testID="ad-close-btn"
                >
                  <Feather name="x" size={16} color="#000" />
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>

          <View style={styles.adContent}>
            <Image
              source={require("@/assets/images/ad_banner.png")}
              style={styles.adImage}
              resizeMode="cover"
            />

            <View style={styles.adTextOverlay}>
              <View style={[styles.adCard, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
                <Text style={styles.adSponsor}>SPONSORED</Text>
                <Text style={styles.adTitle}>Legend of the Realm</Text>
                <Text style={styles.adSubtitle}>Epic fantasy RPG — Download free</Text>
                <Pressable style={[styles.adCta, { backgroundColor: colors.primary }]}>
                  <Text style={styles.adCtaText}>Play Now</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            {!adEnded ? (
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: progressWidth, backgroundColor: colors.primary },
                  ]}
                />
              </View>
            ) : (
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: "100%", backgroundColor: colors.primary }]} />
              </View>
            )}
            <Text style={styles.progressLabel}>
              {adEnded ? "Ad finished — tap to close" : `Watch for ${countdown}s to skip`}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  adContainer: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 0,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  adLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,107,0,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adLabelText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  countdownBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  countdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
    fontVariant: ["tabular-nums"],
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  closeBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  adContent: {
    flex: 1,
    position: "relative",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  adTextOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  adCard: {
    borderRadius: 16,
    padding: 20,
    gap: 6,
  },
  adSponsor: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  adTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  adSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "400" as const,
  },
  adCta: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  adCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "400" as const,
  },
});
