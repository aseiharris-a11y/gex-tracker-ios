import React, { createContext, useContext, useState, useCallback } from 'react';
import { setApiBase } from './api';
import type { AppSettings } from './types';

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  apiBaseUrl: 'https://gex-tracker-backend.onrender.com',
  flashAlphaApiKey: '',
  notificationsEnabled: false,
  defaultSymbol: 'SPY',
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      // Keep API client in sync
      if (patch.apiBaseUrl !== undefined) {
        setApiBase(patch.apiBaseUrl);
      }
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
