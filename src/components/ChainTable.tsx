import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../lib/theme';
import { formatOI, formatIV } from '../lib/format';
import type { ChainOption } from '../lib/types';

interface ChainTableProps {
  options: ChainOption[];
  spot: number;
}

/** A merged call+put row for display, keyed by strike */
interface StrikeRow {
  strike: number;
  expiration: string;
  call?: ChainOption;
  put?: ChainOption;
}

const COL_W = {
  strike: 72,
  oi: 60,
  volume: 56,
  iv: 52,
};

function HeaderCell({
  label,
  width,
  align = 'right',
}: {
  label: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <Text style={[styles.headerCell, { width, textAlign: align }]}>{label}</Text>
  );
}

function DataCell({
  value,
  width,
  color,
  mono = true,
}: {
  value: string;
  width: number;
  color?: string;
  mono?: boolean;
}) {
  return (
    <Text
      style={[
        styles.dataCell,
        { width, color: color ?? colors.text, fontFamily: mono ? fonts.mono : fonts.body },
      ]}
    >
      {value}
    </Text>
  );
}

/** Group a flat array of ChainOption into per-strike rows */
function groupByStrike(options: ChainOption[]): StrikeRow[] {
  const map = new Map<number, StrikeRow>();

  for (const opt of options) {
    if (!map.has(opt.strike)) {
      map.set(opt.strike, { strike: opt.strike, expiration: opt.expiration });
    }
    const row = map.get(opt.strike)!;
    if (opt.type === 'C') {
      row.call = opt;
    } else {
      row.put = opt;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.strike - a.strike);
}

export function ChainTable({ options, spot }: ChainTableProps) {
  const rows = groupByStrike(options);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        {/* Column headers */}
        <View style={styles.headerRow}>
          {/* Call side */}
          <HeaderCell label="C-OI" width={COL_W.oi} />
          <HeaderCell label="C-Vol" width={COL_W.volume} />
          <HeaderCell label="C-IV" width={COL_W.iv} />
          {/* Strike */}
          <HeaderCell label="STRIKE" width={COL_W.strike} align="center" />
          {/* Put side */}
          <HeaderCell label="P-IV" width={COL_W.iv} align="left" />
          <HeaderCell label="P-Vol" width={COL_W.volume} align="left" />
          <HeaderCell label="P-OI" width={COL_W.oi} align="left" />
        </View>

        {/* Data rows */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
          {rows.map((row) => {
            const isATM = Math.abs(row.strike - spot) < spot * 0.003;
            return (
              <View
                key={`${row.strike}-${row.expiration}`}
                style={[styles.dataRow, isATM && styles.atmRow]}
              >
                {/* Call side — green tint */}
                <DataCell
                  value={row.call != null ? formatOI(row.call.openInterest) : '—'}
                  width={COL_W.oi}
                  color={colors.green}
                />
                <DataCell
                  value={row.call != null ? formatOI(row.call.volume) : '—'}
                  width={COL_W.volume}
                  color={colors.green}
                />
                <DataCell
                  value={row.call?.iv != null ? formatIV(row.call.iv) : '—'}
                  width={COL_W.iv}
                  color={colors.green}
                />
                {/* Strike */}
                <Text
                  style={[
                    styles.strikeCell,
                    isATM && { color: colors.primary, fontWeight: fonts.weight.bold },
                  ]}
                >
                  {row.strike >= 1000
                    ? row.strike.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    : row.strike.toFixed(2)}
                  {isATM ? ' ●' : ''}
                </Text>
                {/* Put side — red tint */}
                <DataCell
                  value={row.put?.iv != null ? formatIV(row.put.iv) : '—'}
                  width={COL_W.iv}
                  color={colors.red}
                />
                <DataCell
                  value={row.put != null ? formatOI(row.put.volume) : '—'}
                  width={COL_W.volume}
                  color={colors.red}
                />
                <DataCell
                  value={row.put != null ? formatOI(row.put.openInterest) : '—'}
                  width={COL_W.oi}
                  color={colors.red}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '55',
  },
  atmRow: {
    backgroundColor: colors.primary + '11',
    borderBottomColor: colors.primary + '33',
  },
  dataCell: {
    fontSize: fonts.size.xs,
    textAlign: 'right',
  },
  strikeCell: {
    width: COL_W.strike,
    fontSize: fonts.size.sm,
    fontFamily: fonts.mono,
    color: colors.text,
    textAlign: 'center',
    fontWeight: fonts.weight.semibold,
  },
});
