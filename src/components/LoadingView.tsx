import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../lib/theme';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
  },
  message: {
    fontSize: fonts.size.sm,
    color: colors.textMuted,
  },
  errorIcon: {
    fontSize: 32,
    color: colors.red,
  },
  errorMessage: {
    fontSize: fonts.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryText: {
    fontSize: fonts.size.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
