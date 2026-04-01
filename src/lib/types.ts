// ─── GEX / Dashboard types (matches actual backend response) ────────────────

export interface GexStrike {
  strike: number;
  call_gex: number;
  put_gex: number;
  net_gex: number;
  call_oi: number;
  put_oi: number;
}

export interface GexDataResponse {
  symbol: string;
  underlying_price: number;
  gamma_flip: number;
  net_gex: number;
  net_gex_label: string;
  as_of: string;
  strikes: GexStrike[];
}

// ─── Key Levels ─────────────────────────────────────────────────────────────

export interface LevelsResponse {
  underlying_price: number;
  gamma_flip: number;
  call_wall: number;
  put_wall: number;
  max_positive_gamma: number;
  max_negative_gamma: number;
  highest_oi_strike: number;
  zero_dte_magnet: number;
}

// ─── Option Chain ───────────────────────────────────────────────────────────

export interface ChainOption {
  symbol: string;
  expiration: string;
  type: 'C' | 'P';
  strike: number;
  bid: number;
  ask: number;
  last: number;
  change: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
}

export interface ChainResponse {
  symbol: string;
  spot: number;
  iv30: number;
  pcRatio: number;
  expirations: string[];
  options: ChainOption[];
}

// ─── Expirations ─────────────────────────────────────────────────────────────

export interface ExpirationSummary {
  date: string;
  dte: number;
  callOI: number;
  putOI: number;
  totalVolume: number;
  pcRatio: number;
  netGex: number;
  gammaFlip: number;
}

export interface ExpirationDetail {
  gexData: GexDataResponse;
  levelsData: LevelsResponse;
  summary: {
    callOI: number;
    putOI: number;
    pcRatio: number;
    totalVolume: number;
    dte: number;
    numStrikes: number;
  };
  spot: number;
}

export interface ExpirationListResponse {
  spot: number;
  expirations: ExpirationSummary[];
}

// ─── Squeeze Scanner ─────────────────────────────────────────────────────────

export interface SqueezeSetup {
  expiration: string;
  dte: number;
  squeezeScore: number;
  condition: 'loaded_spring' | 'at_trigger' | 'post_break' | 'no_setup';
  dealerAction: 'selling_rallies' | 'chasing_higher';
  distanceToTrigger: number;
  spotBelow: boolean;
  gammaFlip: number;
  pcRatio: number;
  gexAboveCeiling: number;
  negGammaCeiling: {
    strike: number;
    gex: number;
    label: string;
  };
  callWall: {
    strike: number;
    gex: number;
  };
  allStrikes: GexStrike[];
}

export interface QuarterlyOpex {
  nextDate: string;
  label: string;
  daysAway: number;
  isToday: boolean;
}

export interface JpmCollarEstimate {
  putStrike: number | null;
  callStrike: number | null;
  estimatedFromOI: boolean;
}

export interface SqueezeScannerResponse {
  symbol: string;
  spot: number;
  scanTime: string;
  regime: string;
  gammaFlip: number;
  setups: SqueezeSetup[];
  allSetups: number;
  quarterlyOpex: QuarterlyOpex;
  jpmCollarEstimate: JpmCollarEstimate;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  apiBaseUrl: string;
  flashAlphaApiKey: string;
  notificationsEnabled: boolean;
  defaultSymbol: 'SPY' | 'SPX' | 'QQQ' | 'IWM';
}
