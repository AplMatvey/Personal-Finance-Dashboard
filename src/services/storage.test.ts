import { describe, expect, it, vi } from 'vitest';
import { demoTransactions } from '../data/demo';
import {
  isBudgets,
  isExchangeRate,
  isTransactions,
  readStored,
  storageKeys,
  writeStored,
} from './storage';

describe('browser storage', () => {
  it('uses demo data only when the key is absent', () => {
    expect(
      readStored(storageKeys.transactions, isTransactions, demoTransactions)
        .data,
    ).toHaveLength(20);
    localStorage.setItem(storageKeys.transactions, '[]');
    expect(
      readStored(storageKeys.transactions, isTransactions, demoTransactions)
        .data,
    ).toEqual([]);
  });
  it.each(['not json', '{"wrong":true}', '[{"id":"broken"}]'])(
    'preserves corrupt data: %s',
    (raw) => {
      localStorage.setItem(storageKeys.transactions, raw);
      const result = readStored(
        storageKeys.transactions,
        isTransactions,
        demoTransactions,
      );
      expect(result.blocked).toBe(true);
      expect(result.error).toBeTruthy();
      expect(localStorage.getItem(storageKeys.transactions)).toBe(raw);
    },
  );
  it('handles read and write errors', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(
      readStored(storageKeys.transactions, isTransactions, demoTransactions)
        .blocked,
    ).toBe(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(writeStored(storageKeys.transactions, [])).toContain(
      'only in memory',
    );
  });
  it('validates ids, integer amounts, categories and unique budget pairs', () => {
    const demo = demoTransactions();
    expect(isTransactions(demo)).toBe(true);
    expect(isTransactions([...demo, demo[0]])).toBe(false);
    expect(isTransactions([{ ...demo[0], amountCents: 0.5 }])).toBe(false);
    expect(isTransactions([{ ...demo[0], categoryId: 'food' }])).toBe(false);
    const budget = {
      id: 'one',
      categoryId: 'food',
      month: '2025-01',
      limitCents: 1000,
    };
    expect(isBudgets([budget])).toBe(true);
    expect(isBudgets([budget, { ...budget, id: 'two' }])).toBe(false);
  });
  it('rejects invalid cached rates', () => {
    expect(
      isExchangeRate({
        base: 'USD',
        quote: 'EUR',
        date: '2025-01-01',
        rate: 0.9,
      }),
    ).toBe(true);
    expect(
      isExchangeRate({
        base: 'EUR',
        quote: 'USD',
        date: '2025-01-01',
        rate: 0.9,
      }),
    ).toBe(false);
    expect(
      isExchangeRate({
        base: 'USD',
        quote: 'EUR',
        date: '2025-02-31',
        rate: -1,
      }),
    ).toBe(false);
  });
});
