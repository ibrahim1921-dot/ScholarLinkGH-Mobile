import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export type PaymentResultType = 'SUCCESS_CREDITS' | 'SUCCESS_FEE' | 'FAILED' | null;

interface PaymentResultModalProps {
  type: PaymentResultType;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function PaymentResultModal({ type, onDismiss, onRetry }: PaymentResultModalProps) {
  if (!type) return null;

  const isSuccess = type === 'SUCCESS_CREDITS' || type === 'SUCCESS_FEE';
  
  let title = '';
  let description = '';
  let iconName: 'checkmark-circle' | 'close-circle' = 'checkmark-circle';
  let iconColor = colors.primary;

  if (type === 'SUCCESS_CREDITS') {
    title = 'Purchase Successful';
    description = '10 AI credits have been added to your balance.';
    iconName = 'checkmark-circle';
    iconColor = colors.primary;
  } else if (type === 'SUCCESS_FEE') {
    title = 'Payment Successful';
    description = 'Application fee paid — submitting your application now.';
    iconName = 'checkmark-circle';
    iconColor = colors.primary;
  } else if (type === 'FAILED') {
    title = 'Payment Failed';
    description = 'Your payment could not be processed. Please try again.';
    iconName = 'close-circle';
    iconColor = colors.danger;
  }

  return (
    <Modal visible={!!type} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Ionicons name={iconName} size={64} color={iconColor} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            {type === 'FAILED' && onRetry ? (
              <>
                <Pressable style={styles.primaryBtn} onPress={onRetry}>
                  <Text style={styles.primaryBtnText}>Retry</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={onDismiss}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.primaryBtn} onPress={onDismiss}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.muted,
  },
});
