import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import AdOverlay from "@/components/AdOverlay";

const FEED_ITEMS = [
  {
    id: "1",
    category: "Technology",
    title: "The Future of Mobile Gaming in 2025",
    excerpt: "How next-gen graphics and AI are reshaping the gaming landscape on mobile devices.",
    readTime: "4 min read",
    likes: 1204,
  },
  {
    id: "2",
    category: "Design",
    title: "Building Interfaces That Feel Human",
    excerpt: "Micro-interactions and haptic feedback are becoming essential in modern UI design.",
    readTime: "6 min read",
    likes: 874,
  },
  {
    id: "3",
    category: "Business",
    title: "How Ad Networks Generate $50B Annually",
    excerpt: "A deep dive into the mechanics of digital advertising and why it works so well.",
    readTime: "8 min read",
    likes: 3102,
  },
  {
    id: "4",
    category: "Health",
    title: "Screen Time and Mental Wellness",
    excerpt: "Research-backed strategies to maintain a healthy relationship with your phone.",
    readTime: "5 min read",
    likes: 2048,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [adVisible, setAdVisible] = useState(false);
  const [adCount, setAdCount] = useState(0);
  const [lastReward, setLastReward] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  function handleShowAd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLastReward(null);
    setAdVisible(true);
  }

  function handleAdClose() {
    setAdVisible(false);
    setAdCount((n) => n + 1);
  }

  function handleAdComplete() {
    setLastReward("50 coins unlocked!");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Feed</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {adCount} ads watched · {adCount * 50} coins earned
          </Text>
        </View>
        <Pressable
          onPress={handleShowAd}
          style={[styles.rewardBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="play-circle" size={16} color="#fff" />
          <Text style={styles.rewardBtnText}>Watch Ad</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + 20, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {lastReward && (
          <View style={[styles.rewardBanner, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="award" size={16} color={colors.primary} />
            <Text style={[styles.rewardText, { color: colors.primary }]}>{lastReward}</Text>
          </View>
        )}

        <View style={[styles.adPromptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.adIconWrap, { backgroundColor: colors.accent }]}>
            <Feather name="tv" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adPromptTitle, { color: colors.foreground }]}>
              Earn rewards instantly
            </Text>
            <Text style={[styles.adPromptSub, { color: colors.mutedForeground }]}>
              Watch a 40-second ad. Close button unlocks when it's done.
            </Text>
          </View>
          <Pressable
            onPress={handleShowAd}
            style={[styles.adPromptBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="play" size={14} color="#fff" />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TOP STORIES</Text>

        {FEED_ITEMS.map((item, index) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
                marginBottom: index === FEED_ITEMS.length - 1 ? 0 : 12,
              },
            ]}
          >
            <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.cardExcerpt, { color: colors.mutedForeground }]}>{item.excerpt}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{item.readTime}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Feather name="heart" size={12} color={colors.mutedForeground} />
                <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{item.likes.toLocaleString()}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <AdOverlay
        visible={adVisible}
        durationSeconds={40}
        onClose={handleAdClose}
        onAdComplete={handleAdComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: "400" as const,
    marginTop: 2,
  },
  rewardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  rewardBtnText: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  rewardBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  adPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  adIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adPromptTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  adPromptSub: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  adPromptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  cardExcerpt: {
    fontSize: 14,
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
  },
});
