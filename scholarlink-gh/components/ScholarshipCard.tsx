import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../constants/colors";
import { Scholarship, ScholarshipMatch } from "../types/api";

// Static fallback image when no imageUrl is set
const PLACEHOLDER_IMAGE = require("../assets/images/header-scholarships.jpg");

type Props = {
  scholarship?: Scholarship;
  match?: ScholarshipMatch;
  onPress: () => void;
};

/**
 * Derives a human-readable countdown label from daysUntilDeadline.
 * Never shows negative numbers.
 */
function getCountdownLabel(days: number | undefined | null): string | null {
  if (days == null) return null;
  if (days < 0) return "Expired";
  if (days === 0) return "Closing today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

type StatusInfo = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

/**
 * Resolves the status badge appearance.
 * Uses the explicit status field when available, otherwise derives from daysUntilDeadline.
 * Semantic colors: green=open, amber=full/closing, gray=closed.
 */
function getStatusInfo(
  status: Scholarship["status"] | undefined,
  days: number | undefined | null
): StatusInfo {
  // Use explicit status when set
  const resolved =
    status ??
    (days != null
      ? days < 0
        ? "CLOSED"
        : days === 0
        ? "CLOSING_SOON"
        : "OPEN"
      : "OPEN");

  switch (resolved) {
    case "OPEN":
      return {
        label: "Open",
        backgroundColor: "rgba(27, 109, 36, 0.12)",
        textColor: colors.success,
      };
    case "CLOSING_SOON":
      return {
        label: "Closing Soon",
        backgroundColor: "rgba(216, 136, 92, 0.15)",
        textColor: colors.warning,
      };
    case "FULL":
      return {
        label: "Full",
        backgroundColor: "rgba(216, 136, 92, 0.15)",
        textColor: colors.warning,
      };
    case "CLOSED":
      return {
        label: "Closed",
        backgroundColor: colors.surfaceMuted,
        textColor: colors.muted,
      };
    default:
      return {
        label: "Open",
        backgroundColor: "rgba(27, 109, 36, 0.12)",
        textColor: colors.success,
      };
  }
}

/**
 * Formats an ISO date string into a readable date like "Mar 31, 2026".
 */
function formatDeadline(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ScholarshipCard({ scholarship, match, onPress }: Props) {
  const title = scholarship?.name ?? match?.scholarshipName ?? "";
  const provider = scholarship?.provider ?? match?.provider ?? "";
  const deadline = scholarship?.deadline ?? match?.deadline;
  const country = scholarship?.destinationCountry ?? match?.destinationCountry;
  const days = scholarship?.daysUntilDeadline;
  const field = scholarship?.eligibleFields;
  const imageUrl = scholarship?.imageUrl;
  const status = scholarship?.status;

  const countdownLabel = getCountdownLabel(days);
  const statusInfo = getStatusInfo(status, days);

  // Resolve image source: remote URL or local placeholder
  const imageSource = imageUrl
    ? { uri: imageUrl }
    : PLACEHOLDER_IMAGE;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* ── Image Header with Gradient Overlay ── */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.65)"]}
          style={styles.imageGradient}
        />

        {/* Countdown pill badge — top-right */}
        {countdownLabel && (
          <View style={styles.countdownBadge}>
            <Ionicons
              name="time-outline"
              size={13}
              color="#ffffff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.countdownText}>{countdownLabel}</Text>
          </View>
        )}

        {/* Title overlaid — bottom-left */}
        <Text style={styles.overlaidTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {/* ── Card Body ── */}
      <View style={styles.body}>
        {/* Provider name */}
        <Text style={styles.providerText} numberOfLines={1}>
          {provider}
        </Text>

        {/* Two-column metadata row */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <View style={styles.metaLabelRow}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Text style={styles.metaLabel}>Country</Text>
            </View>
            <Text style={styles.metaValue} numberOfLines={1}>
              {country || "N/A"}
            </Text>
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaLabelRow}>
              <MaterialCommunityIcons
                name="school-outline"
                size={14}
                color={colors.muted}
              />
              <Text style={styles.metaLabel}>Field</Text>
            </View>
            <Text style={styles.metaValue} numberOfLines={1}>
              {field || "All Fields"}
            </Text>
          </View>
        </View>

        {/* Hairline divider */}
        <View style={styles.divider} />

        {/* Footer row: deadline pill + status badge */}
        <View style={styles.footerRow}>
          <View style={styles.deadlinePill}>
            <Text style={styles.deadlinePillText}>
              Deadline: {formatDeadline(deadline)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.backgroundColor },
            ]}
          >
            <Text
              style={[styles.statusBadgeText, { color: statusInfo.textColor }]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },

  /* ── Image Header ── */
  imageContainer: {
    height: 180,
    position: "relative",
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  countdownBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countdownText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 11,
    color: "#ffffff",
  },
  overlaidTitle: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 60,
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: "#ffffff",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* ── Card Body ── */
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  providerText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 13,
    color: colors.info,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  metaLabel: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 11,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.ink,
  },

  /* ── Footer ── */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deadlinePill: {
    backgroundColor: "rgba(167, 200, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deadlinePillText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 11,
    color: colors.info,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 11,
  },
});
