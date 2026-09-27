import { isExchangeRate } from './storage';
import type { ExchangeRate } from '../types';

export const exchangeRateUrl = 'https://api.frankfurter.dev/v2/rate/USD/EUR';
export async function fetchExchangeRate(
  signal?: AbortSignal,
): Promise<ExchangeRate> {
  const response = await fetch(exchangeRateUrl, { signal });
  if (!response.ok)
    throw new Error(`Exchange rate request failed (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  if (!isExchangeRate(data))
    throw new Error('The exchange rate service returned an invalid response.');
  return data;
}
