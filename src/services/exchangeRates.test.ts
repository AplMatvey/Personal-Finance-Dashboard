import { describe, expect, it, vi } from 'vitest';
import { fetchExchangeRate } from './exchangeRates';

describe('exchange rates', () => {
  it('fetches and validates a USD/EUR rate', async () => {
    const rate = { base: 'USD', quote: 'EUR', rate: 0.9, date: '2025-01-01' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => rate }),
    );
    expect(await fetchExchangeRate()).toEqual(rate);
  });
  it('rejects HTTP failures even when fetch resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    await expect(fetchExchangeRate()).rejects.toThrow('HTTP 503');
  });
  it.each([
    null,
    {},
    { base: 'USD', quote: 'EUR', rate: 0, date: '2025-01-01' },
    { base: 'USD', quote: 'EUR', rate: '0.9', date: '2025-01-01' },
  ])('rejects missing or invalid rates', async (data) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => data }),
    );
    await expect(fetchExchangeRate()).rejects.toThrow('invalid response');
  });
  it('passes through request cancellation', async () => {
    const controller = new AbortController();
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    vi.stubGlobal('fetch', fetchMock);
    controller.abort();
    await expect(fetchExchangeRate(controller.signal)).rejects.toThrow(
      'Aborted',
    );
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      signal: controller.signal,
    });
  });
});
