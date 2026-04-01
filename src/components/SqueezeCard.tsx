import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatDateShort, formatDTE, formatPrice, formatGex } from '../lib/format';
import { ScoreGauge } from './ScoreGauge';
import type { SqueezeSetup } from '../lib/types';

interface SqueezeCardProps {
  setup: SqueezeSetup;
}

const CONDITION_CONFIG = {
  Extreme: { bg: colors.red + '22', border: colors.red, text: colors.red },
  High: { bg: colors.amber + '22', border: colors.amber, text: colors.amber },
  Moderate: { bg: colors.primary + '22', border: colors.primary, text: colors.primary },
  Low: { bg: colors.green + '22', border: colors.green, text: colors.green },
};

export function SqueezeCard({ setup }: SqueezeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const condCfg = CONDITION_CONFIG[setup.condition];

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={styles.card}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ScoreGauge score={setup.score} size={60} />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.expiration}>{formatDateShort(setup.expiration)}</Text>
          <View style={styles.dteBadge}>
            <Text style={styles.dteText}>{formatDTE(setup.dte)}</Text>
          </View>
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: condCfg.bg, borderColor: condCfg.border },
            ]}
          >
            <Text style={[styles.conditionText, { color: condCfg.text }]}>
              {setup.condition}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.regimeLabel}>
            {setup.regime === 'Positive' ? '▲' : '▼'} {setup.regime}
          </Text>
          <Text style={styles.dealerAction}>{setup.dealerAction}</Text>
        </View>
      </View>

      {/* Key levels row */}
      <View style={styles.levelsRow}>
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>Key Level</Text>
          <Text style={styles.levelValue}>{formatPrice(setup.keyLevel)}</Text>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>Gamma Flip</Text>
          <Text style={[styles.levelValue, { color: colors.primary }]}>
            {formatPrice(setup.gammaFlip)}
          </Text>
        </View>
      </View>

      {/* Expanded: signals and strikes */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedTitle}>Signals</Text>
          {setup.signals.map((sig, i) => (
            <View key={i} style={styles.signalRow}>
              <View
                style={[
                  styles.signalDot,
                  { backgroundColor: sig.active ? colors.green : colors.textDim },
                ]}
              />
              <Text style={styles.signalName}>{sig.name}</Text>
              {sig.description ? (
                <Text style={styles.signalDesc}>{sig.description}</Text>
              ) : null}
            </View>
          ))}

          {setup.topStrikes.length > 0 && (
            <>
              <Text style={[styles.expandedTitle, { marginTop: spacing.md }]}>
                Top Strikes
              </Text>
              {setup.topStrikes.slice(0, 5).map((ts, i) => (
                <View key={i} style={styles.strikeRow}>
                  <Text style={styles.strikePrice}>{formatPrice(ts.strike)}</Text>
                  <View
                    style={[
                      styles.strikeGexBar,
                      {
                        backgroundColor: ts.gex >= 0 ? colors.greenDim : colors.redDim,
                        width: Math.min(Math.abs(ts.gex) * 80 + 20, 120),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.strikeGexLabel,
                      { color: ts.gex >= 0 ? colors.green : colors.red },
                    ]}
                  >
                    {formatGex(ts.gex)}
                  </Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.expandHint}>Tap to collapse</Text>
        </View>
      )}

      {!expanded && (
        <Text style={styles.expandHint}>Tap to expand signals</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  expiration: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    fontFamily: fonts.mono,
  },
  dteBadge: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dteText: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  conditionBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  conditionText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
  },
  regimeLabel: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
  },
  dealerAction: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    textAlign: 'right',
    maxWidth: 100,
  },
  levelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginBottom: 2,
  },
  levelValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  levelDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  expandedTitle: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  signalName: {
    fontSize: fonts.size.sm,
    color: colors.text,
    flex: 1,
  },
  signalDesc: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    flex: 1,
    textAlign: 'right',
  },
  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  strikePrice: {
    fontSize: fonts.size.sm,
    fontFamily: fonts.mono,
    color: colors.text,
    width: 70,
  },
  strikeGexBar: {
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  strikeGexLabel: {
    fontSize: fonts.size.xs,
    fontFamily: fonts.mono,
    marginLeft: spacing.xs,
  },
  expandHint: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
