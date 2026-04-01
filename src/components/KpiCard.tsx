import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  accent?: 'green' | 'red' | 'amber' | 'primary' | 'neutral';
  onPress?: () => void;
}

const accentMap = {
  green: colors.green,
  red: colors.red,
  amber: colors.amber,
  primary: colors.primary,
  neutral: colors.text,
};

export function KpiCard({ label, value, subtext, accent = 'neutral', onPress }: KpiCardProps) {
  const accentColor = accentMap[accent];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.75,
    backgroundColor: colors.bgMuted,
  },
  label: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
    color: colors.text,
    lineHeight: 28,
  },
  subtext: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
});
