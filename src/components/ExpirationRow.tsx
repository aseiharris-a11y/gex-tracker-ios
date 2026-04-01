import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatDateShort, formatDTE, formatOI, formatGex } from '../lib/format';
import type { ExpirationSummary } from '../lib/types';

interface ExpirationRowProps {
  item: ExpirationSummary;
  onPress?: () => void;
}

export function ExpirationRow({ item, onPress }: ExpirationRowProps) {
  const isZeroDTE = item.dte === 0;
  const gexColor = item.netGex >= 0 ? colors.green : colors.red;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      {/* Date + DTE */}
      <View style={styles.dateSection}>
        <Text style={styles.date}>{formatDateShort(item.date)}</Text>
        <View
          style={[
            styles.dteBadge,
            isZeroDTE && { backgroundColor: colors.redDim + '44', borderColor: colors.red },
          ]}
        >
          <Text style={[styles.dteText, isZeroDTE && { color: colors.red }]}>
            {formatDTE(item.dte)}
          </Text>
        </View>
      </View>

      {/* OI columns */}
      <View style={styles.oiSection}>
        <Text style={styles.oiLabel}>C OI</Text>
        <Text style={[styles.oiValue, { color: colors.green }]}>
          {formatOI(item.callOI)}
        </Text>
      </View>
      <View style={styles.oiSection}>
        <Text style={styles.oiLabel}>P OI</Text>
        <Text style={[styles.oiValue, { color: colors.red }]}>
          {formatOI(item.putOI)}
        </Text>
      </View>

      {/* Net GEX */}
      <View style={styles.gexSection}>
        <Text style={styles.oiLabel}>Net GEX</Text>
        <Text style={[styles.gexValue, { color: gexColor }]}>
          {formatGex(item.netGex)}
        </Text>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.bgMuted,
  },
  dateSection: {
    flex: 2,
    gap: spacing.xs,
  },
  date: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    fontFamily: fonts.mono,
  },
  dteBadge: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  dteText: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  oiSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  oiLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginBottom: 2,
  },
  oiValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    fontFamily: fonts.mono,
  },
  gexSection: {
    flex: 2,
    alignItems: 'flex-end',
  },
  gexValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
  },
  chevron: {
    fontSize: fonts.size.lg,
    color: colors.textDim,
    marginLeft: spacing.sm,
  },
});
