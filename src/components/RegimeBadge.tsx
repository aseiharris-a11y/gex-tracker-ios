import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';

interface RegimeBadgeProps {
  regime: 'Positive' | 'Negative';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RegimeBadge({ regime, size = 'md', showIcon = true }: RegimeBadgeProps) {
  const isPositive = regime === 'Positive';
  const bgColor = isPositive ? colors.greenDim : colors.redDim;
  const textColor = isPositive ? colors.green : colors.red;
  const icon = isPositive ? '▲' : '▼';
  const label = `${isPositive ? 'Positive' : 'Negative'} Gamma`;

  const sizeStyles = {
    sm: { paddingH: spacing.sm, paddingV: 3, fontSize: fonts.size.xs },
    md: { paddingH: spacing.md, paddingV: spacing.xs, fontSize: fonts.size.sm },
    lg: { paddingH: spacing.base, paddingV: spacing.sm, fontSize: fonts.size.md },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor + '33', // ~20% opacity
          borderColor: bgColor,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
      ]}
    >
      {showIcon && (
        <Text style={[styles.icon, { color: textColor, fontSize: sizeStyles.fontSize }]}>
          {icon}{' '}
        </Text>
      )}
      <Text style={[styles.text, { color: textColor, fontSize: sizeStyles.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    fontWeight: fonts.weight.bold,
  },
  text: {
    fontWeight: fonts.weight.semibold,
    letterSpacing: 0.3,
  },
});
