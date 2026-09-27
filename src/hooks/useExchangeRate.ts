import { useEffect, useState } from 'react';
import { fetchExchangeRate } from '../services/exchangeRates';
import { isExchangeRate, storageKeys, writeStored } from '../services/storage';
import type { ExchangeRate } from '../types';

export function useExchangeRate() {
  const [rate, setRate] = useState<ExchangeRate | null>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(storageKeys.rate) ?? 'null',
      );
      return isExchangeRate(value) ? value : null;
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [error, setError] = useState('');
  const [cacheError, setCacheError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    async function load() {
      try {
        const result = await fetchExchangeRate(controller.signal);
        if (!active) return;
        setRate(result);
        setStatus('success');
        setError('');
        setCacheError(
          writeStored(storageKeys.rate, result)
            ? 'This rate could not be saved for your next visit.'
            : '',
        );
      } catch (cause) {
        if (!active) return;
        setStatus('error');
        setError(
          controller.signal.aborted
            ? 'The exchange rate request timed out.'
            : cause instanceof Error
              ? cause.message
              : 'Exchange rates are unavailable.',
        );
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  return {
    rate,
    status,
    error,
    cacheError,
    retry: () => {
      setStatus('loading');
      setAttempt((value) => value + 1);
    },
  };
}
export type RateState = ReturnType<typeof useExchangeRate>;
