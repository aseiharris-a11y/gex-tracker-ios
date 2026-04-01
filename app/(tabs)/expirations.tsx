import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors, fonts, spacing, radius } from '../../src/lib/theme';
import { fetchExpirations, fetchExpirationDetail } from '../../src/lib/api';
import { formatDateShort, formatGex, formatOI } from '../../src/lib/format';
import { ExpirationRow } from '../../src/components/ExpirationRow';
import { GexBarChart } from '../../src/components/GexBarChart';
import { LoadingView, ErrorView } from '../../src/components/LoadingView';
import type { ExpirationSummary, ExpirationDetail } from '../../src/lib/types';

type Symbol = 'SPY' | 'SPX' | 'QQQ' | 'IWM';
const SYMBOLS: Symbol[] = ['SPY', 'SPX', 'QQQ', 'IWM'];

interface ExpirationSection {
  title: string;
  data: ExpirationSummary[];
}

function groupExpirations(expirations: ExpirationSummary[]): ExpirationSection[] {
  const thisWeek: ExpirationSummary[] = [];
  const nextWeek: ExpirationSummary[] = [];
  const monthly: ExpirationSummary[] = [];

  expirations.forEach((exp) => {
    if (exp.dte <= 7) thisWeek.push(exp);
    else if (exp.dte <= 14) nextWeek.push(exp);
    else monthly.push(exp);
  });

  const sections: ExpirationSection[] = [];
  if (thisWeek.length > 0) sections.push({ title: 'This Week', data: thisWeek });
  if (nextWeek.length > 0) sections.push({ title: 'Next Week', data: nextWeek });
  if (monthly.length > 0) sections.push({ title: 'Monthly & Beyond', data: monthly });
  return sections;
}

export default function ExpirationsScreen() {
  const [symbol, setSymbol] = useState<Symbol>('SPY');
  const [sections, setSections] = useState<ExpirationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail modal state
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExpirationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [spot, setSpot] = useState(0);

  const load = useCallback(async (sym: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchExpirations(sym);
      setSections(groupExpirations(data.expirations));
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load expirations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(symbol);
  }, [symbol, load]);

  const openDetail = async (date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailDate(date);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await fetchExpirationDetail(symbol, date);
      setDetail(d);
      setSpot(d.spot);
    } catch (_) {
      // Show modal with partial data
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailDate(null);
    setDetail(null);
  };

  if (loading && !refreshing) return <LoadingView message="Loading expirations..." />;
  if (error && sections.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView message={error} onRetry={() => load(symbol)} />
      </SafeAreaView>
    );
  }

  // Derived values from ExpirationDetail
  const detailNetGex = detail?.gexData?.net_gex ?? 0;
  const detailGammaFlip = detail?.levelsData?.gamma_flip ?? 0;
  const detailStrikes = detail?.gexData?.strikes ?? [];
  // Top strikes sorted by |net_gex| descending
  const topStrikes = [...detailStrikes]
    .sort((a, b) => Math.abs(b.net_gex) - Math.abs(a.net_gex))
    .slice(0, 10);
  // Compute call/put GEX totals from strikes
  const detailCallGex = detailStrikes.reduce((sum, s) => sum + (s.call_gex ?? 0), 0);
  const detailPutGex = detailStrikes.reduce((sum, s) => sum + (s.put_gex ?? 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expirations</Text>
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

      {/* Column labels */}
      <View style={styles.columnHeader}>
        <Text style={[styles.colLabel, { flex: 2 }]}>Date</Text>
        <Text style={[styles.colLabel, { flex: 1.5, textAlign: 'center' }]}>C-OI</Text>
        <Text style={[styles.colLabel, { flex: 1.5, textAlign: 'center' }]}>P-OI</Text>
        <Text style={[styles.colLabel, { flex: 2, textAlign: 'right' }]}>Net GEX</Text>
        <View style={{ width: spacing.xl }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <ExpirationRow item={item} onPress={() => openDetail(item.date)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
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
              No expiration data. Check your API URL in Settings.
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
      />

      {/* Detail Modal */}
      <Modal
        visible={!!detailDate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {detailDate ? formatDateShort(detailDate) : ''}
            </Text>
            <Pressable onPress={closeDetail} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>

          {detailLoading ? (
            <LoadingView message="Loading detail..." />
          ) : detail ? (
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
              {/* KPI strip */}
              <View style={styles.kpiStrip}>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Net GEX</Text>
                  <Text
                    style={[
                      styles.kpiValue,
                      { color: detailNetGex >= 0 ? colors.green : colors.red },
                    ]}
                  >
                    {formatGex(detailNetGex)}
                  </Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Call GEX</Text>
                  <Text style={[styles.kpiValue, { color: colors.green }]}>
                    {formatGex(detailCallGex)}
                  </Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Put GEX</Text>
                  <Text style={[styles.kpiValue, { color: colors.red }]}>
                    {formatGex(detailPutGex)}
                  </Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Gamma Flip</Text>
                  <Text style={[styles.kpiValue, { color: colors.primary }]}>
                    ${detailGammaFlip.toFixed(0)}
                  </Text>
                </View>
              </View>

              {/* Mini GEX chart */}
              {detailStrikes.length > 0 && (
                <View style={styles.chartSection}>
                  <GexBarChart strikes={detailStrikes} spot={detail.spot} height={180} />
                </View>
              )}

              {/* Top strikes table */}
              {topStrikes.length > 0 && (
                <View style={styles.topStrikesSection}>
                  <Text style={styles.topStrikesTitle}>Top Strikes</Text>
                  {topStrikes.map((s, i) => (
                    <View key={i} style={styles.strikeRow}>
                      <Text style={styles.strikePriceText}>${s.strike.toFixed(0)}</Text>
                      <View
                        style={[
                          styles.strikeBar,
                          {
                            backgroundColor: s.net_gex >= 0 ? colors.greenDim : colors.redDim,
                            flex: Math.min(
                              Math.abs(s.net_gex) / (Math.abs(topStrikes[0]?.net_gex ?? 1) || 1),
                              1,
                            ),
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.strikeGexText,
                          { color: s.net_gex >= 0 ? colors.green : colors.red },
                        ]}
                      >
                        {formatGex(s.net_gex)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No detail data available</Text>
            </View>
          )}
        </View>
      </Modal>
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
  columnHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgSection,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  colLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    backgroundColor: colors.bgMuted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  closeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  closeBtnText: {
    fontSize: fonts.size.md,
    color: colors.primary,
    fontWeight: fonts.weight.semibold,
  },
  modalScroll: { flex: 1 },
  modalContent: {
    padding: spacing.base,
  },
  kpiStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  kpiItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.md,
  },
  kpiLabel: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    fontFamily: fonts.mono,
  },
  chartSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  topStrikesSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.md,
  },
  topStrikesTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  strikePriceText: {
    width: 64,
    fontSize: fonts.size.sm,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  strikeBar: {
    height: 8,
    borderRadius: 4,
    minWidth: 20,
    opacity: 0.7,
  },
  strikeGexText: {
    fontSize: fonts.size.xs,
    fontFamily: fonts.mono,
    marginLeft: spacing.xs,
    minWidth: 60,
  },
});
