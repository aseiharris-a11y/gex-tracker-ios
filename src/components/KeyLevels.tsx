import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatPrice } from '../lib/format';
import type { LevelsResponse } from '../lib/types';

interface LevelDisplay {
  label: string;
  price: number;
  type: 'support' | 'resistance' | 'flip' | 'wall' | 'oi' | 'magnet';
}

interface KeyLevelsProps {
  levels: LevelsResponse;
  spot: number;
}

type LevelType = LevelDisplay['type'];

const TYPE_CONFIG: Record<LevelType, { bg: string; border: string; text: string }> = {
  support: {
    bg: colors.green + '22',
    border: colors.greenDim,
    text: colors.green,
  },
  resistance: {
    bg: colors.red + '22',
    border: colors.redDim,
    text: colors.red,
  },
  flip: {
    bg: colors.primary + '22',
    border: colors.primaryDim,
    text: colors.primary,
  },
  wall: {
    bg: colors.amber + '22',
    border: colors.amberDim,
    text: colors.amber,
  },
  oi: {
    bg: colors.textMuted + '22',
    border: colors.border,
    text: colors.textMuted,
  },
  magnet: {
    bg: colors.primary + '11',
    border: colors.primaryDim,
    text: colors.primary,
  },
};

function buildLevelList(levels: LevelsResponse, spot: number): LevelDisplay[] {
  const items: LevelDisplay[] = [];

  if (levels.gamma_flip != null) {
    items.push({ label: 'Gamma Flip', price: levels.gamma_flip, type: 'flip' });
  }
  if (levels.call_wall != null) {
    items.push({
      label: 'Call Wall',
      price: levels.call_wall,
      type: levels.call_wall > spot ? 'resistance' : 'support',
    });
  }
  if (levels.put_wall != null) {
    items.push({
      label: 'Put Wall',
      price: levels.put_wall,
      type: levels.put_wall < spot ? 'support' : 'resistance',
    });
  }
  if (levels.max_positive_gamma != null) {
    items.push({ label: 'Max +γ', price: levels.max_positive_gamma, type: 'wall' });
  }
  if (levels.max_negative_gamma != null) {
    items.push({ label: 'Max -γ', price: levels.max_negative_gamma, type: 'wall' });
  }
  if (levels.highest_oi_strike != null) {
    items.push({ label: 'Highest OI', price: levels.highest_oi_strike, type: 'oi' });
  }
  if (levels.zero_dte_magnet != null) {
    items.push({ label: '0DTE Magnet', price: levels.zero_dte_magnet, type: 'magnet' });
  }

  // Sort by price descending
  return items.sort((a, b) => b.price - a.price);
}

export function KeyLevels({ levels, spot }: KeyLevelsProps) {
  const items = buildLevelList(levels, spot);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Key Levels</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((level, idx) => {
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
              <Text style={[styles.levelType, { color: cfg.text }]}>{level.label}</Text>
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
