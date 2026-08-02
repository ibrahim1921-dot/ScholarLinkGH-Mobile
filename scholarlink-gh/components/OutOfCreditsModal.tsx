import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { BUNDLE_CREDITS, BUNDLE_PRICE_GHS } from '../utils/creditUtils';

interface OutOfCreditsModalProps {
  visible: boolean;
  onClose: () => void;
  onBuy: () => void;
  loading?: boolean;
}

export function OutOfCreditsModal({ visible, onClose, onBuy, loading }: OutOfCreditsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>You're out of AI credits</Text>
          <Text style={styles.description}>
            Purchase a bundle of {BUNDLE_CREDITS} credits for ₵{BUNDLE_PRICE_GHS} to continue using AI-powered features like drafting cover letters and finding personalized matches.
          </Text>

          <View style={styles.actions}>
            <Pressable 
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]} 
              onPress={onBuy}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Buy {BUNDLE_CREDITS} Credits — ₵{BUNDLE_PRICE_GHS}</Text>
              )}
            </Pressable>
            <Pressable 
              style={styles.secondaryBtn} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
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
    height: 52,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
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
    height: 52,
  },
  secondaryBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.muted,
  },
});
