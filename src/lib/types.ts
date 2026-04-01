// ─── GEX / Dashboard types ─────────────────────────────────────────────────

export interface GexDataResponse {
  symbol: string;
  spot: number;
  gammaFlip: number;
  netGex: number;
  regime: 'Positive' | 'Negative';
  callGex: number;
  putGex: number;
  strikes: StrikeGex[];
  lastUpdated: string;
}

export interface StrikeGex {
  strike: number;
  netGex: number;
  callGex: number;
  putGex: number;
}

// ─── Key Levels ─────────────────────────────────────────────────────────────

export interface KeyLevel {
  price: number;
  label: string;
  type: 'support' | 'resistance' | 'flip' | 'wall';
}

export interface LevelsResponse {
  symbol: string;
  spot: number;
  levels: KeyLevel[];
}

// ─── Option Chain ───────────────────────────────────────────────────────────

export interface ChainResponse {
  symbol: string;
  spot: number;
  iv30?: number;
  pcRatio?: number;
  expirations: string[];
  options: OptionRow[];
}

export interface OptionRow {
  strike: number;
  expiration: string;
  callOI: number;
  putOI: number;
  callVolume: number;
  putVolume: number;
  callGamma: number;
  putGamma: number;
  callIV?: number;
  putIV?: number;
  callDelta?: number;
  putDelta?: number;
  isATM?: boolean;
}

// ─── Expirations ─────────────────────────────────────────────────────────────

export interface ExpirationSummary {
  date: string;
  dte: number;
  callOI: number;
  putOI: number;
  netGex: number;
  pcRatio?: number;
}

export interface ExpirationDetail {
  date: string;
  dte: number;
  spot: number;
  callGex: number;
  putGex: number;
  netGex: number;
  gammaFlip: number;
  strikes: StrikeGex[];
  topStrikes: StrikeGex[];
}

export interface ExpirationListResponse {
  symbol: string;
  expirations: ExpirationSummary[];
}

// ─── Squeeze Scanner ─────────────────────────────────────────────────────────

export interface SqueezeSignal {
  name: string;
  active: boolean;
  description?: string;
}

export interface SqueezeSetup {
  expiration: string;
  dte: number;
  score: number; // 0-100
  condition: 'Extreme' | 'High' | 'Moderate' | 'Low';
  regime: 'Positive' | 'Negative';
  keyLevel: number;
  gammaFlip: number;
  dealerAction: string;
  signals: SqueezeSignal[];
  topStrikes: Array<{ strike: number; gex: number }>;
}

export interface SqueezeScannerResponse {
  symbol: string;
  regime: 'Positive' | 'Negative';
  regimeStrength: number;
  spot: number;
  setups: SqueezeSetup[];
  lastUpdated: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  apiBaseUrl: string;
  flashAlphaApiKey: string;
  notificationsEnabled: boolean;
  defaultSymbol: 'SPY' | 'SPX' | 'QQQ' | 'IWM';
}
