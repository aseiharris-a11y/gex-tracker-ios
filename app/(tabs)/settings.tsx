import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

import { colors, fonts, spacing, radius } from '../../src/lib/theme';
import { testConnection } from '../../src/lib/api';
import { useSettings } from '../../src/lib/SettingsContext';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  const [apiUrl, setApiUrl] = useState(settings.apiBaseUrl);
  const [apiKey, setApiKey] = useState(settings.flashAlphaApiKey);
  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'ok' | 'fail'
  >('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({
      apiBaseUrl: apiUrl.trim(),
      flashAlphaApiKey: apiKey.trim(),
    });
    Alert.alert('Saved', 'Settings saved. Restart the app to apply changes.');
  };

  const handleTestConnection = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTestStatus('testing');
    setTestMessage('Testing...');

    // Temporarily set the URL for testing
    const { setApiBase } = await import('../../src/lib/api');
    setApiBase(apiUrl.trim());

    const result = await testConnection();
    if (result.ok) {
      setTestStatus('ok');
      setTestMessage(`Connected (${result.latencyMs}ms)`);
    } else {
      setTestStatus('fail');
      setTestMessage(result.message);
    }
  };

  const testStatusColor =
    testStatus === 'ok'
      ? colors.green
      : testStatus === 'fail'
      ? colors.red
      : colors.textMuted;

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? '1';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* API Server Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Server</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Server URL</Text>
            <TextInput
              style={styles.textInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://192.168.1.100:5000"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
            />
            <Text style={styles.fieldHint}>
              Your GEX Tracker server address. Use your local IP for home network
              or a public URL for cloud deployments.
            </Text>
          </View>

          {/* Test button + status */}
          <Pressable
            style={[styles.button, testStatus === 'testing' && styles.buttonDisabled]}
            onPress={handleTestConnection}
            disabled={testStatus === 'testing'}
          >
            <Text style={styles.buttonText}>
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Text>
          </Pressable>

          {testStatus !== 'idle' && (
            <View style={[styles.statusRow, { borderColor: testStatusColor + '44' }]}>
              <View style={[styles.statusDot, { backgroundColor: testStatusColor }]} />
              <Text style={[styles.statusText, { color: testStatusColor }]}>
                {testMessage}
              </Text>
            </View>
          )}
        </View>

        {/* FlashAlpha API Key */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FlashAlpha Integration</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>API Key</Text>
            <TextInput
              style={styles.textInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="your-flashalpha-api-key"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              returnKeyType="done"
            />
            <Text style={styles.fieldHint}>
              Optional: Required for live options data. Get your key at flashalpha.com.
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.fieldHint}>
                Alerts for regime changes and key level breaks
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                updateSettings({ notificationsEnabled: val });
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Default Symbol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Symbol</Text>
          <View style={styles.symbolGrid}>
            {(['SPY', 'SPX', 'QQQ', 'IWM'] as const).map((sym) => (
              <Pressable
                key={sym}
                style={[
                  styles.symbolOption,
                  settings.defaultSymbol === sym && styles.symbolOptionActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateSettings({ defaultSymbol: sym });
                }}
              >
                <Text
                  style={[
                    styles.symbolOptionText,
                    settings.defaultSymbol === sym && styles.symbolOptionTextActive,
                  ]}
                >
                  {sym}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save button */}
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </Pressable>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>GEX Tracker</Text>
          <Text style={styles.appInfoVersion}>
            Version {version} (Build {buildNumber})
          </Text>
          <Text style={styles.appInfoNote}>
            Gamma Exposure Analytics for Options Traders
          </Text>

          <View style={styles.divider} />

          <Text style={styles.disclaimer}>
            This app is for informational purposes only. Options trading involves
            significant risk. GEX data is derived from publicly available market
            data and should not be considered financial advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
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
  scroll: { flex: 1 },
  content: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.base,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.size.sm,
    color: colors.text,
    fontFamily: fonts.mono,
  },
  fieldHint: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fonts.size.sm,
    fontFamily: fonts.mono,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleLabel: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  symbolGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  symbolOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  symbolOptionActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  symbolOptionText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },
  symbolOptionTextActive: {
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveButtonText: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  appInfo: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  appInfoTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  appInfoVersion: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    fontFamily: fonts.mono,
  },
  appInfoNote: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  disclaimer: {
    fontSize: fonts.size.xs,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
});
