import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { Scholarship, ScholarshipMatch } from "../types/api";

type Props = {
  scholarship?: Scholarship;
  match?: ScholarshipMatch;
  onPress: () => void;
};

export function ScholarshipCard({ scholarship, match, onPress }: Props) {
  const title = scholarship?.name ?? match?.scholarshipName ?? "";
  const provider = scholarship?.provider ?? match?.provider ?? "";
  const deadline = scholarship?.deadline ?? match?.deadline;
  const country = scholarship?.destinationCountry ?? match?.destinationCountry;
  const days = scholarship?.daysUntilDeadline;
  const score = match?.matchScore;
  const funding = scholarship?.fundingCoverage ?? match?.fundingCoverage;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeLeft}>
          <Ionicons name={score ? "sparkles" : "shield-checkmark"} size={14} color={score ? "#005312" : "#1b6d24"} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: score ? "#005312" : "#1b6d24" }]}>
            {score ? `${score}% AI Match` : "Verified Sponsor"}
          </Text>
        </View>
        
        {typeof days === "number" || deadline ? (
          <View style={styles.badgeRight}>
            <Ionicons name="time" size={14} color="#93000a" style={{ marginRight: 4 }} />
            <Text style={styles.badgeTextRight}>
              {typeof days === "number" ? `${days} days left` : deadline}
            </Text>
          </View>
        ) : null}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.meta}>
        {[country, funding].filter(Boolean).join(" • ")}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLeftText}>{provider}</Text>
        </View>
        <View style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>Details</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(195, 198, 209, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 4,
  },
  pressed: { opacity: 0.86, backgroundColor: "#f9f9fe" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a0f399",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
  },
  badgeRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffdad6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextRight: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: "#93000a",
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    lineHeight: 24,
    marginBottom: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontFamily: "BeVietnamPro_400Regular",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  footerLeft: {
    flex: 1,
    marginRight: 8,
  },
  footerLeftText: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: "BeVietnamPro_600SemiBold",
    fontStyle: "italic",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailsBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
});
