export type TransactionType = 'income' | 'expense';
export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  categoryId: string;
  date: string;
  description: string;
}
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}
export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limitCents: number;
}
export interface Settings {
  theme: 'dark' | 'light';
  displayCurrency: 'USD' | 'EUR';
}
export interface ExchangeRate {
  base: 'USD';
  quote: 'EUR';
  rate: number;
  date: string;
}
export type MoneyFormatter = (cents: number) => string;
