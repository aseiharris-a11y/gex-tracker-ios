import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors, fonts, spacing, radius } from '../../src/lib/theme';
import { fetchSqueeze } from '../../src/lib/api';
import { formatPrice } from '../../src/lib/format';
import { RegimeBadge } from '../../src/components/RegimeBadge';
import { SqueezeCard } from '../../src/components/SqueezeCard';
import { LoadingView, ErrorView } from '../../src/components/LoadingView';
import type { SqueezeScannerResponse, SqueezeSetup } from '../../src/lib/types';

type Symbol = 'SPY' | 'SPX' | 'QQQ' | 'IWM';
const SYMBOLS: Symbol[] = ['SPY', 'SPX', 'QQQ', 'IWM'];

export default function ScannerScreen() {
  const [symbol, setSymbol] = useState<Symbol>('SPY');
  const [data, setData] = useState<SqueezeScannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sym: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await fetchSqueeze(sym);
      setData(result);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load scanner');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(symbol);
  }, [symbol, load]);

  if (loading && !refreshing) return <LoadingView message="Scanning setups..." />;
  if (error && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView message={error} onRetry={() => load(symbol)} />
      </SafeAreaView>
    );
  }

  // Capitalize the lowercase regime string from the API
  const rawRegime = data?.regime ?? 'positive';
  const regime = (rawRegime.charAt(0).toUpperCase() + rawRegime.slice(1)) as 'Positive' | 'Negative';

  // Compute regime strength as a 0–100 value from distance between spot and gammaFlip
  const spot = data?.spot ?? 0;
  const gammaFlip = data?.gammaFlip ?? 0;
  const regimeStrength = gammaFlip > 0
    ? Math.min(100, Math.round(Math.abs((spot - gammaFlip) / gammaFlip) * 1000))
    : 50;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Squeeze Scanner</Text>
        <View style={styles.symbolPicker}>
          {SYMBOLS.map((sym) => (
            <Pressable
              key={sym}
              style={[styles.symbolBtn, sym === symbol && styles.symbolBtnActive]}
              onPress={() => {
                if (sym !== symbol) {
                  Haptics.selectionAsync();
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

      {/* Regime banner */}
      {data && (
        <View
          style={[
            styles.regimeBanner,
            {
              backgroundColor:
                regime === 'Positive'
                  ? colors.green + '18'
                  : colors.red + '18',
              borderBottomColor:
                regime === 'Positive' ? colors.greenDim : colors.redDim,
            },
          ]}
        >
          <RegimeBadge regime={regime} size="md" />
          <View style={styles.regimeStats}>
            <Text style={styles.regimeStatLabel}>Strength</Text>
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${regimeStrength}%`,
                    backgroundColor:
                      regime === 'Positive' ? colors.green : colors.red,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.spotBlock}>
            <Text style={styles.regimeStatLabel}>Spot</Text>
            <Text style={styles.spotValue}>{formatPrice(data.spot)}</Text>
          </View>
        </View>
      )}

      {/* Setup count badge */}
      {data && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {data.setups.length} setup{data.setups.length !== 1 ? 's' : ''} found
          </Text>
          <Text style={styles.updatedText}>
            {data.scanTime
              ? new Date(data.scanTime).toLocaleTimeString()
              : ''}
          </Text>
        </View>
      )}

      <FlatList<SqueezeSetup>
        data={data?.setups ?? []}
        keyExtractor={(item) => item.expiration}
        renderItem={({ item }) => <SqueezeCard setup={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(symbol, true);
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ?? 'No squeeze setups. Check your API URL in Settings.'}
            </Text>
          </View>
        }
      />
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
  regimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  regimeStats: {
    flex: 1,
  },
  regimeStatLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginBottom: 4,
  },
  strengthBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
    opacity: 0.8,
  },
  spotBlock: {
    alignItems: 'flex-end',
  },
  spotValue: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
  },
  updatedText: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
  },
  listContent: {
    padding: spacing.base,
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
