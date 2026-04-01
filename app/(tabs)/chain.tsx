import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors, fonts, spacing, radius } from '../../src/lib/theme';
import { fetchChain } from '../../src/lib/api';
import { formatPrice, formatIV, formatPCRatio } from '../../src/lib/format';
import { ChainTable } from '../../src/components/ChainTable';
import { LoadingView, ErrorView } from '../../src/components/LoadingView';
import type { ChainResponse, ChainOption } from '../../src/lib/types';

type Symbol = 'SPY' | 'SPX' | 'QQQ' | 'IWM';
const SYMBOLS: Symbol[] = ['SPY', 'SPX', 'QQQ', 'IWM'];

export default function ChainScreen() {
  const [symbol, setSymbol] = useState<Symbol>('SPY');
  const [chainData, setChainData] = useState<ChainResponse | null>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sym: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchChain(sym);
      setChainData(data);
      if (data.expirations.length > 0) {
        setSelectedExp((prev) => prev ?? data.expirations[0]);
      }
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load chain');
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

  if (loading && !refreshing) return <LoadingView message="Loading option chain..." />;
  if (error && !chainData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView message={error} onRetry={() => load(symbol)} />
      </SafeAreaView>
    );
  }

  // Filter raw options by selected expiration — pass to ChainTable for grouping
  const filteredOptions: ChainOption[] = selectedExp
    ? (chainData?.options ?? []).filter((o) => o.expiration === selectedExp)
    : (chainData?.options ?? []);

  const spot = chainData?.spot ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Option Chain</Text>
        <View style={styles.symbolPicker}>
          {SYMBOLS.map((sym) => (
            <Pressable
              key={sym}
              style={[styles.symbolBtn, sym === symbol && styles.symbolBtnActive]}
              onPress={() => {
                if (sym !== symbol) {
                  Haptics.selectionAsync();
                  setSelectedExp(null);
                  setSymbol(sym);
                }
              }}
            >
              <Text style={[styles.symbolText, sym === symbol && styles.symbolTextActive]}>
                {sym}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Summary bar */}
      {chainData && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spot</Text>
            <Text style={styles.summaryValue}>{formatPrice(spot)}</Text>
          </View>
          {chainData.iv30 != null && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>IV30</Text>
              <Text style={[styles.summaryValue, { color: colors.amber }]}>
                {formatIV(chainData.iv30 / 100)}
              </Text>
            </View>
          )}
          {chainData.pcRatio != null && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>P/C Ratio</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      chainData.pcRatio > 1 ? colors.red : colors.green,
                  },
                ]}
              >
                {formatPCRatio(chainData.pcRatio)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Expiration tabs */}
      {chainData && chainData.expirations.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.expTabsScroll}
          contentContainerStyle={styles.expTabsContent}
        >
          {chainData.expirations.map((exp) => (
            <Pressable
              key={exp}
              style={[
                styles.expTab,
                exp === selectedExp && styles.expTabActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedExp(exp);
              }}
            >
              <Text
                style={[
                  styles.expTabText,
                  exp === selectedExp && styles.expTabTextActive,
                ]}
              >
                {exp}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Column headers */}
        <View style={styles.chainHeader}>
          <Text style={[styles.chainHeaderLabel, { color: colors.green }]}>CALLS</Text>
          <Text style={styles.chainHeaderStrike}>STRIKE</Text>
          <Text style={[styles.chainHeaderLabel, { color: colors.red }]}>PUTS</Text>
        </View>

        {filteredOptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ?? 'No option data. Check your API URL in Settings.'}
            </Text>
          </View>
        ) : (
          <ChainTable options={filteredOptions} spot={spot} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
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
  symbolBtnActive: { backgroundColor: colors.primary },
  symbolText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  symbolTextActive: { color: colors.text },
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xl,
  },
  summaryItem: {},
  summaryLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  expTabsScroll: { maxHeight: 48 },
  expTabsContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  expTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expTabActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  expTabText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  expTabTextActive: { color: colors.primary },
  scroll: { flex: 1 },
  chainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgSection,
  },
  chainHeaderLabel: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    letterSpacing: 1,
  },
  chainHeaderStrike: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fonts.size.sm,
    textAlign: 'center',
  },
});
