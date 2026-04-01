import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatDateShort, formatDTE, formatPrice, formatGex } from '../lib/format';
import { ScoreGauge } from './ScoreGauge';
import type { SqueezeSetup } from '../lib/types';

interface SqueezeCardProps {
  setup: SqueezeSetup;
}

// Map condition codes to display labels and styles
const CONDITION_CONFIG: Record<
  SqueezeSetup['condition'],
  { bg: string; border: string; text: string; label: string }
> = {
  loaded_spring: {
    bg: colors.amber + '22',
    border: colors.amber,
    text: colors.amber,
    label: 'Loaded Spring',
  },
  at_trigger: {
    bg: colors.red + '22',
    border: colors.red,
    text: colors.red,
    label: 'At Trigger',
  },
  post_break: {
    bg: colors.primary + '22',
    border: colors.primary,
    text: colors.primary,
    label: 'Post Break',
  },
  no_setup: {
    bg: colors.border + '22',
    border: colors.border,
    text: colors.textDim,
    label: 'No Setup',
  },
};

// Format dealerAction for display
function formatDealerAction(action: string): string {
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function SqueezeCard({ setup }: SqueezeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const condCfg = CONDITION_CONFIG[setup.condition] ?? CONDITION_CONFIG.no_setup;

  // Derive regime from spotBelow
  const regimeLabel = setup.spotBelow ? '▼ Negative' : '▲ Positive';

  // Build signals inline from real fields
  const signals = [
    {
      name: 'P/C Flow',
      active: setup.pcRatio > 1.0,
      description: `P/C: ${setup.pcRatio.toFixed(2)}`,
    },
    {
      name: 'GEX Above',
      active: setup.gexAboveCeiling < 0,
      description: formatGex(setup.gexAboveCeiling),
    },
    {
      name: 'Regime',
      active: setup.spotBelow,
      description: setup.spotBelow ? 'Below Flip' : 'Above Flip',
    },
  ];

  // Top strikes: sort allStrikes by |net_gex| descending, take top 5
  const topStrikes = [...(setup.allStrikes ?? [])]
    .sort((a, b) => Math.abs(b.net_gex) - Math.abs(a.net_gex))
    .slice(0, 5);

  const maxStrikeGex = Math.abs(topStrikes[0]?.net_gex ?? 1) || 1;

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={styles.card}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ScoreGauge score={setup.squeezeScore} size={60} />
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
              {condCfg.label}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.regimeLabel}>{regimeLabel}</Text>
          <Text style={styles.dealerAction}>{formatDealerAction(setup.dealerAction)}</Text>
        </View>
      </View>

      {/* Key levels row */}
      <View style={styles.levelsRow}>
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>Neg γ Ceiling</Text>
          <Text style={styles.levelValue}>
            {setup.negGammaCeiling?.strike != null
              ? formatPrice(setup.negGammaCeiling.strike)
              : '—'}
          </Text>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>Call Wall</Text>
          <Text style={[styles.levelValue, { color: colors.green }]}>
            {setup.callWall?.strike != null
              ? formatPrice(setup.callWall.strike)
              : '—'}
          </Text>
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
          {signals.map((sig, i) => (
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

          {topStrikes.length > 0 && (
            <>
              <Text style={[styles.expandedTitle, { marginTop: spacing.md }]}>
                Top Strikes
              </Text>
              {topStrikes.map((ts, i) => (
                <View key={i} style={styles.strikeRow}>
                  <Text style={styles.strikePrice}>{formatPrice(ts.strike)}</Text>
                  <View
                    style={[
                      styles.strikeGexBar,
                      {
                        backgroundColor: ts.net_gex >= 0 ? colors.greenDim : colors.redDim,
                        width: Math.min((Math.abs(ts.net_gex) / maxStrikeGex) * 80 + 20, 120),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.strikeGexLabel,
                      { color: ts.net_gex >= 0 ? colors.green : colors.red },
                    ]}
                  >
                    {formatGex(ts.net_gex)}
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
