import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatPrice } from '../lib/format';
import type { KeyLevel } from '../lib/types';

interface KeyLevelsProps {
  levels: KeyLevel[];
  spot: number;
}

const TYPE_CONFIG: Record<KeyLevel['type'], { bg: string; border: string; text: string; label: string }> = {
  support: {
    bg: colors.green + '22',
    border: colors.greenDim,
    text: colors.green,
    label: 'Support',
  },
  resistance: {
    bg: colors.red + '22',
    border: colors.redDim,
    text: colors.red,
    label: 'Resistance',
  },
  flip: {
    bg: colors.primary + '22',
    border: colors.primaryDim,
    text: colors.primary,
    label: 'Gamma Flip',
  },
  wall: {
    bg: colors.amber + '22',
    border: colors.amberDim,
    text: colors.amber,
    label: 'GEX Wall',
  },
};

export function KeyLevels({ levels, spot }: KeyLevelsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Key Levels</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {levels.map((level, idx) => {
          const cfg = TYPE_CONFIG[level.type];
          const distance = (((level.price - spot) / spot) * 100).toFixed(1);
          const distStr = Number(distance) >= 0 ? `+${distance}%` : `${distance}%`;

          return (
            <View
              key={`${level.price}-${idx}`}
              style={[
                styles.levelBadge,
                {
                  backgroundColor: cfg.bg,
                  borderColor: cfg.border,
                },
              ]}
            >
              <Text style={[styles.levelType, { color: cfg.text }]}>{cfg.label}</Text>
              <Text style={styles.levelPrice}>{formatPrice(level.price)}</Text>
              <Text style={styles.levelDist}>{distStr}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 110,
    alignItems: 'center',
  },
  levelType: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  levelPrice: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
    color: colors.text,
    marginBottom: 2,
  },
  levelDist: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
  },
});
