import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { formatGex, formatStrike } from '../lib/format';
import type { StrikeGex } from '../lib/types';

interface GexBarChartProps {
  strikes: StrikeGex[];
  spot: number;
  height?: number;
}

const CHART_WIDTH = 340;
const BAR_WIDTH = 18;
const PADDING = { top: 16, bottom: 40, left: 4, right: 4 };

export function GexBarChart({ strikes, spot, height = 220 }: GexBarChartProps) {
  const filtered = useMemo(() => {
    // Only show strikes within ±8% of spot
    const low = spot * 0.92;
    const high = spot * 1.08;
    return strikes
      .filter((s) => s.strike >= low && s.strike <= high)
      .sort((a, b) => a.strike - b.strike);
  }, [strikes, spot]);

  const maxAbs = useMemo(() => {
    const max = Math.max(...filtered.map((s) => Math.abs(s.netGex)));
    return max === 0 ? 1 : max;
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No strike data available</Text>
      </View>
    );
  }

  const plotH = height - PADDING.top - PADDING.bottom;
  const midY = PADDING.top + plotH / 2;
  const barGap = 4;
  const totalWidth = Math.max(
    CHART_WIDTH,
    filtered.length * (BAR_WIDTH + barGap) + 32,
  );

  const bars = filtered.map((s, i) => {
    const x = PADDING.left + 16 + i * (BAR_WIDTH + barGap);
    const normalized = s.netGex / maxAbs;
    const barHeight = Math.abs(normalized) * (plotH / 2) * 0.9;
    const y = s.netGex >= 0 ? midY - barHeight : midY;
    const fill = s.netGex >= 0 ? colors.green : colors.red;
    const isATM = Math.abs(s.strike - spot) < spot * 0.003;

    return { ...s, x, y, barHeight, fill, isATM };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GEX by Strike</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={totalWidth} height={height + 10}>
          {/* Zero line */}
          <Line
            x1={0}
            y1={midY}
            x2={totalWidth}
            y2={midY}
            stroke={colors.border}
            strokeWidth={1}
          />

          {/* Bars */}
          {bars.map((bar) => (
            <G key={bar.strike}>
              <Rect
                x={bar.x}
                y={bar.y}
                width={BAR_WIDTH}
                height={Math.max(bar.barHeight, 2)}
                fill={bar.fill}
                opacity={0.85}
                rx={2}
              />
              {/* ATM marker */}
              {bar.isATM && (
                <Rect
                  x={bar.x - 1}
                  y={PADDING.top}
                  width={BAR_WIDTH + 2}
                  height={plotH}
                  fill={colors.primary}
                  opacity={0.12}
                  rx={2}
                />
              )}
              {/* Strike label */}
              <SvgText
                x={bar.x + BAR_WIDTH / 2}
                y={height - 4}
                fontSize={9}
                fill={bar.isATM ? colors.primary : colors.textDim}
                textAnchor="middle"
                fontFamily={fonts.mono}
              >
                {bar.strike >= 1000
                  ? String(Math.round(bar.strike))
                  : bar.strike.toFixed(0)}
              </SvgText>
            </G>
          ))}

          {/* Spot line */}
          {(() => {
            const spotBar = bars.find((b) => b.isATM) ?? bars[Math.floor(bars.length / 2)];
            const spotX = spotBar.x + BAR_WIDTH / 2;
            return (
              <Line
                x1={spotX}
                y1={PADDING.top}
                x2={spotX}
                y2={height - PADDING.bottom}
                stroke={colors.primary}
                strokeWidth={1}
                strokeDasharray="4,3"
              />
            );
          })()}

          {/* Y-axis labels */}
          <SvgText
            x={4}
            y={PADDING.top + 8}
            fontSize={9}
            fill={colors.textDim}
            fontFamily={fonts.mono}
          >
            {formatGex(maxAbs)}
          </SvgText>
          <SvgText
            x={4}
            y={height - PADDING.bottom - 4}
            fontSize={9}
            fill={colors.textDim}
            fontFamily={fonts.mono}
          >
            {formatGex(-maxAbs)}
          </SvgText>
        </Svg>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
          <Text style={styles.legendText}>Long Gamma</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
          <Text style={styles.legendText}>Short Gamma</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Spot</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fonts.size.sm,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
  },
});
