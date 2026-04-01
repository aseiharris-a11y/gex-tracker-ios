// ─── Number formatting utilities ────────────────────────────────────────────

/**
 * Format a GEX dollar value compactly
 * e.g. 1_500_000_000 → "$1.5B", -500_000_000 → "-$500M"
 */
export function formatGex(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(0)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * Format a price with dollar sign and 2 decimals
 */
export function formatPrice(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format a strike price (usually 0 or 2 decimals)
 */
export function formatStrike(value: number): string {
  if (value >= 1000) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format open interest with K/M suffix
 */
export function formatOI(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

/**
 * Format a percentage
 */
export function formatPct(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format DTE (days to expiration)
 */
export function formatDTE(dte: number): string {
  if (dte === 0) return '0DTE';
  if (dte === 1) return '1d';
  return `${dte}d`;
}

/**
 * Format a date string to readable form
 * Input: "2024-01-19"  Output: "Jan 19"
 */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format IV as percentage
 */
export function formatIV(iv: number): string {
  return `${(iv * 100).toFixed(1)}%`;
}

/**
 * Format P/C ratio
 */
export function formatPCRatio(ratio: number): string {
  return ratio.toFixed(2);
}

/**
 * Calculate relative distance from spot price
 */
export function pctFromSpot(strike: number, spot: number): string {
  const pct = ((strike - spot) / spot) * 100;
  return formatPct(pct);
}
