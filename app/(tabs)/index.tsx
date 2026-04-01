import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors, fonts, spacing, radius } from '../../src/lib/theme';
import { fetchGex, fetchLevels } from '../../src/lib/api';
import { formatPrice, formatGex } from '../../src/lib/format';
import { KpiCard } from '../../src/components/KpiCard';
import { RegimeBadge } from '../../src/components/RegimeBadge';
import { KeyLevels } from '../../src/components/KeyLevels';
import { GexBarChart } from '../../src/components/GexBarChart';
import { LoadingView, ErrorView } from '../../src/components/LoadingView';
import type { GexDataResponse, LevelsResponse } from '../../src/lib/types';

type Symbol = 'SPY' | 'SPX' | 'QQQ' | 'IWM';
const SYMBOLS: Symbol[] = ['SPY', 'SPX', 'QQQ', 'IWM'];

export default function DashboardScreen() {
  const [symbol, setSymbol] = useState<Symbol>('SPY');
  const [gexData, setGexData] = useState<GexDataResponse | null>(null);
  const [levelsData, setLevelsData] = useState<LevelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sym: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [gex, levels] = await Promise.all([
        fetchGex(sym),
        fetchLevels(sym),
      ]);
      setGexData(gex);
      setLevelsData(levels);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(symbol);
  }, [symbol, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(symbol, true);
  }, [symbol, load]);

  const changeSymbol = (sym: Symbol) => {
    if (sym === symbol) return;
    Haptics.selectionAsync();
    setSymbol(sym);
  };

  if (loading && !refreshing) {
    return <LoadingView message={`Loading ${symbol} data...`} />;
  }

  if (error && !gexData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView message={error} onRetry={() => load(symbol)} />
      </SafeAreaView>
    );
  }

  // Map real API response fields
  const spot = gexData?.underlying_price ?? 0;
  const gammaFlip = gexData?.gamma_flip ?? 0;
  const netGex = gexData?.net_gex ?? 0;
  const netGexLabel = gexData?.net_gex_label ?? formatGex(netGex);
  const regime = spot > gammaFlip ? 'Positive' : 'Negative';

  // Compute call/put GEX totals from strikes array
  const callGex = (gexData?.strikes ?? []).reduce((sum, s) => sum + (s.call_gex ?? 0), 0);
  const putGex = (gexData?.strikes ?? []).reduce((sum, s) => sum + (s.put_gex ?? 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>GEX Tracker</Text>
          <Text style={styles.lastUpdated}>
            {gexData?.as_of
              ? new Date(gexData.as_of).toLocaleTimeString()
              : 'Live'}
          </Text>
        </View>
        {/* Symbol picker */}
        <View style={styles.symbolPicker}>
          {SYMBOLS.map((sym) => (
            <Pressable
              key={sym}
              style={[styles.symbolBtn, sym === symbol && styles.symbolBtnActive]}
              onPress={() => changeSymbol(sym)}
            >
              <Text
                style={[
                  styles.symbolText,
                  sym === symbol && styles.symbolTextActive,
                ]}
              >
                {sym}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Error banner (when we have data but refresh failed) */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠ {error}</Text>
          </View>
        )}

        {/* Regime badge */}
        <View style={styles.regimeRow}>
          <RegimeBadge regime={regime} size="md" />
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KpiCard
              label="Spot Price"
              value={formatPrice(spot)}
              accent="neutral"
            />
            <View style={styles.kpiGap} />
            <KpiCard
              label="Gamma Flip"
              value={formatPrice(gammaFlip)}
              subtext={
                spot > gammaFlip
                  ? `+${((spot - gammaFlip) / gammaFlip * 100).toFixed(2)}% above`
                  : `${((spot - gammaFlip) / gammaFlip * 100).toFixed(2)}% below`
              }
              accent="primary"
            />
          </View>
          <View style={[styles.kpiRow, { marginTop: spacing.sm }]}>
            <KpiCard
              label="Net GEX"
              value={netGexLabel}
              accent={netGex >= 0 ? 'green' : 'red'}
            />
            <View style={styles.kpiGap} />
            <KpiCard
              label="Regime"
              value={regime}
              subtext={`Call: ${formatGex(callGex)}`}
              accent={regime === 'Positive' ? 'green' : 'red'}
            />
          </View>
        </View>

        {/* Key Levels */}
        {levelsData && (
          <View style={styles.section}>
            <KeyLevels levels={levelsData} spot={spot} />
          </View>
        )}

        {/* GEX Bar Chart */}
        {gexData && (gexData.strikes?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <GexBarChart strikes={gexData.strikes} spot={spot} />
          </View>
        )}

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Call GEX</Text>
            <Text style={[styles.summaryValue, { color: colors.green }]}>
              {formatGex(callGex)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Put GEX</Text>
            <Text style={[styles.summaryValue, { color: colors.red }]}>
              {formatGex(putGex)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Symbol</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {symbol}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appName: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  lastUpdated: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginTop: 2,
  },
  symbolPicker: {
    flexDirection: 'row',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
  },
  symbolBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  symbolBtnActive: {
    backgroundColor: colors.primary,
  },
  symbolText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  symbolTextActive: {
    color: colors.text,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  errorBanner: {
    backgroundColor: colors.redDim + '33',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.red + '55',
  },
  errorBannerText: {
    color: colors.red,
    fontSize: fonts.size.xs,
  },
  regimeRow: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  kpiGrid: {
    marginBottom: spacing.base,
  },
  kpiRow: {
    flexDirection: 'row',
  },
  kpiGap: {
    width: spacing.sm,
  },
  section: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});
