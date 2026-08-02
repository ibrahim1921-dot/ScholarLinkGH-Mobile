import { router, Stack } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { colors } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { profileService } from "../services/profileService";
import { paymentService, PaymentTransaction } from "../services/paymentService";
import { usePayment } from "../hooks/usePayment";
import { BUNDLE_CREDITS, BUNDLE_PRICE_GHS } from "../utils/creditUtils";

export default function CreditsBillingScreen() {
  const insets = useSafeAreaInsets();
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: paymentService.getMyTransactions,
  });

  const { paymentLoading, processPayment, renderPaymentResult } = usePayment();

  const executePurchase = async () => {
    const result = await processPayment((callbackUrl) => paymentService.initializeAiCreditPurchase(callbackUrl));
    if (result === 'SUCCESS') {
      refetchProfile();
      refetchTransactions();
    }
  };

  const renderTransaction = ({ item }: { item: PaymentTransaction }) => {
    const isSuccess = item.status === 'SUCCESS';
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIconBox, isSuccess ? styles.bgSuccess : styles.bgWarning]}>
            <Ionicons name={isSuccess ? "checkmark" : "time"} size={16} color={isSuccess ? "#005312" : "#723610"} />
          </View>
          <View>
            <Text style={styles.transactionTitle}>{item.type === 'AI_CREDIT_BUNDLE' ? 'AI Credits Bundle' : 'Assisted Application Fee'}</Text>
            <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleDateString()} • {item.reference}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isSuccess ? styles.textSuccess : styles.textWarning]}>
          ₵{(item.amountPesewas / 100).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderPaymentResult()}

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Payments & Billing</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
                <Text style={styles.balanceLabel}>Available Credits</Text>
              </View>
              <Text style={styles.balanceValue}>{profileLoading ? "..." : profile?.aiCreditsRemaining ?? 0}</Text>
              <Text style={styles.balanceDesc}>Use AI credits to generate CVs, check eligibility, and draft cover letters.</Text>
            </View>

            <View style={styles.buyCard}>
              <Text style={styles.buyTitle}>Need more credits?</Text>
              <Text style={styles.buyDesc}>Get a bundle of {BUNDLE_CREDITS} AI credits for ₵{BUNDLE_PRICE_GHS}</Text>
              <Pressable 
                style={[styles.buyBtn, paymentLoading && { opacity: 0.7 }]} 
                onPress={executePurchase}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buyBtnText}>Buy {BUNDLE_CREDITS} Credits</Text>
                )}
              </Pressable>
            </View>

            <View style={[styles.buyCard, { backgroundColor: 'rgba(27, 109, 36, 0.05)', borderColor: 'rgba(27, 109, 36, 0.1)', marginBottom: 32 }]}>
              <View style={[styles.balanceHeader, { justifyContent: 'center' }]}>
                 <Ionicons name="briefcase" size={20} color={colors.primary} />
                 <Text style={[styles.buyTitle, { marginBottom: 0 }]}>Assisted Applications</Text>
              </View>
              <Text style={[styles.buyDesc, { marginBottom: 0, textAlign: 'center' }]}>
                Applying via the Assisted path carries a fee that varies by listing. Sponsored listings are completely free!
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Transaction History</Text>
            {transactionsLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
            {!transactionsLoading && transactions?.length === 0 && (
              <Text style={styles.emptyText}>No transactions found.</Text>
            )}
          </>
        }
        renderItem={renderTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: colors.primary,
  },
  scrollContent: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 51, 102, 0.1)',
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: colors.primary,
  },
  balanceValue: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 48,
    color: colors.primary,
    marginBottom: 8,
  },
  balanceDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  buyCard: {
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 51, 102, 0.1)',
    alignItems: 'center',
  },
  buyTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  buyDesc: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  buyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buyBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 16,
    color: '#ffffff',
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.4)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgSuccess: { backgroundColor: '#a0f399' },
  bgWarning: { backgroundColor: '#ffdbca' },
  textSuccess: { color: '#005312' },
  textWarning: { color: '#723610' },
  transactionTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 15,
    color: colors.ink,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: colors.muted,
  },
  transactionAmount: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 16,
  },
});
