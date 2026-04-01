/**
 * API Client for GEX Tracker
 *
 * Replace API_BASE_URL with your server URL before building.
 * e.g., "http://192.168.1.100:5000" for local network
 *       "https://your-server.com" for production
 */

import type {
  GexDataResponse,
  LevelsResponse,
  ChainResponse,
  ExpirationListResponse,
  ExpirationDetail,
  SqueezeScannerResponse,
} from './types';

// ─── Configuration ──────────────────────────────────────────────────────────

let _apiBase = 'https://gex-tracker-backend.onrender.com';

export function setApiBase(url: string): void {
  _apiBase = url.replace(/\/$/, ''); // Strip trailing slash
}

export function getApiBase(): string {
  return _apiBase;
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${_apiBase}${path}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(0, 'Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/** Test connectivity to the API server */
export async function testConnection(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  const start = Date.now();
  try {
    await apiFetch<unknown>('/api/health', 5_000);
    return { ok: true, latencyMs: Date.now() - start, message: 'Connected' };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      message: (err as Error).message,
    };
  }
}

/** Fetch GEX data for a symbol (uses demo endpoint) */
export async function fetchGex(symbol: string): Promise<GexDataResponse> {
  return apiFetch<GexDataResponse>(`/api/demo/gex/${symbol.toUpperCase()}`);
}

/** Fetch key levels for a symbol */
export async function fetchLevels(symbol: string): Promise<LevelsResponse> {
  return apiFetch<LevelsResponse>(`/api/demo/levels/${symbol.toUpperCase()}`);
}

/** Fetch option chain for a symbol */
export async function fetchChain(symbol: string): Promise<ChainResponse> {
  return apiFetch<ChainResponse>(`/api/chain/${symbol.toUpperCase()}`);
}

/** Fetch expiration list for a symbol */
export async function fetchExpirations(symbol: string): Promise<ExpirationListResponse> {
  return apiFetch<ExpirationListResponse>(`/api/gex-by-expiration/${symbol.toUpperCase()}`);
}

/** Fetch detail for a specific expiration */
export async function fetchExpirationDetail(symbol: string, date: string): Promise<ExpirationDetail> {
  return apiFetch<ExpirationDetail>(`/api/gex-by-expiration/${symbol.toUpperCase()}/${date}`);
}

/** Fetch squeeze scanner data */
export async function fetchSqueeze(symbol: string): Promise<SqueezeScannerResponse> {
  return apiFetch<SqueezeScannerResponse>(`/api/squeeze-scanner/${symbol.toUpperCase()}`);
}
