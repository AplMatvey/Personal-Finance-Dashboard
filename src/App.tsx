import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import type {
  Budget as BudgetType,
  Settings as SettingsType,
  Transaction,
} from './types';
import { demoBudgets, demoTransactions } from './data/demo';
import {
  isBudgets,
  isSettings,
  isTransactions,
  storageKeys,
} from './services/storage';
import { today } from './utils/finance';
import { useStoredState } from './hooks/useStoredState';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useOnline } from './hooks/useOnline';
import { Icon, type IconName } from './components/Icon';
import { ConfirmDialog } from './components/Dialog';
import { TransactionForm } from './components/TransactionForm';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Statistics from './pages/Statistics';
import Settings, { type StorageIssue } from './pages/Settings';
import styles from './App.module.css';
import ui from './components/ui.module.css';

const defaultSettings = (): SettingsType => ({
  theme: 'dark',
  displayCurrency: 'USD',
});
const navigation: { path: string; name: string; icon: IconName }[] = [
  { path: '/', name: 'Dashboard', icon: 'dashboard' },
  { path: '/transactions', name: 'Transactions', icon: 'transactions' },
  { path: '/budget', name: 'Budget', icon: 'budget' },
  { path: '/statistics', name: 'Statistics', icon: 'statistics' },
  { path: '/settings', name: 'Settings', icon: 'settings' },
];
export default function App() {
  const transactions = useStoredState(
    storageKeys.transactions,
    isTransactions,
    demoTransactions,
    () => [],
  );
  const budgets = useStoredState(
    storageKeys.budgets,
    isBudgets,
    demoBudgets,
    () => [],
  );
  const settings = useStoredState(
    storageKeys.settings,
    isSettings,
    defaultSettings,
  );
  const rates = useExchangeRate();
  const online = useOnline();
  const location = useLocation();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState('');
  const currency =
    settings.data.displayCurrency === 'EUR' && rates.rate ? 'EUR' : 'USD';
  function money(cents: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format((cents / 100) * (currency === 'EUR' ? rates.rate!.rate : 1));
  }
  const pageName =
    navigation.find((item) => item.path === location.pathname)?.name ??
    'Page not found';
  useEffect(() => {
    document.documentElement.dataset.theme = settings.data.theme;
  }, [settings.data.theme]);
  useEffect(() => {
    document.title = `${pageName} · FinanceFlow`;
  }, [pageName]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function saveTransaction(transaction: Transaction) {
    transactions.update((current) =>
      current.some((item) => item.id === transaction.id)
        ? current.map((item) =>
            item.id === transaction.id ? transaction : item,
          )
        : [transaction, ...current],
    );
    setNotice(
      editing === 'new'
        ? 'Transaction added. You’re all up to date.'
        : 'Transaction updated.',
    );
    setEditing(null);
  }
  function saveBudget(budget: BudgetType) {
    budgets.update((current) =>
      current.some((item) => item.id === budget.id)
        ? current.map((item) => (item.id === budget.id ? budget : item))
        : [...current, budget],
    );
    setNotice('Monthly budget saved.');
  }
  const issues: StorageIssue[] = [];
  if (transactions.error)
    issues.push({
      name: 'Transactions',
      message: transactions.error,
      reset: () => transactions.reset([]),
    });
  if (budgets.error)
    issues.push({
      name: 'Budgets',
      message: budgets.error,
      reset: () => budgets.reset([]),
    });
  if (settings.error)
    issues.push({
      name: 'Settings',
      message: settings.error,
      reset: () => settings.reset(defaultSettings()),
    });
  const transactionProps = {
    transactions: transactions.data,
    money,
    onAdd: () => setEditing('new'),
    onEdit: (transaction: Transaction) => setEditing(transaction),
    onDelete: (transaction: Transaction) => setDeleting(transaction),
  };
  const periodProps = { month, setMonth };
  return (
    <div className={styles.app}>
      <a href="#main-heading" className={styles.skipLink}>
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand} aria-label="FinanceFlow home">
          <span className={styles.logo}>
            f<span>f</span>
          </span>
          FinanceFlow<span className={styles.brandDot}>.</span>
        </Link>
        <div className={styles.workspace}>
          <span className={styles.avatar}>P</span>
          <div>
            <strong>Personal workspace</strong>
            <span>A little more peace of mind</span>
          </div>
        </div>
        <p className={styles.navLabel}>WORKSPACE</p>
        <nav aria-label="Main navigation" className={styles.navigation}>
          {navigation.map((item) => (
            <NavLink
              end={item.path === '/'}
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.localCard}>
            <Icon name="shield" size={24} />
            <h3>Just you and your money.</h3>
            <p>Your financial data stays right here, in your browser.</p>
            <Link to="/settings">
              Your data & preferences
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className={styles.profile}>
            <span className={styles.profileAvatar}>Y</span>
            <div>
              <strong>Your personal space</strong>
              <span>One day at a time.</span>
            </div>
            <span className={styles.profileDot} />
          </div>
        </div>
      </aside>
      <div className={styles.workspaceMain}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <span>Workspace</span>
            <Icon name="chevron" size={12} />
            <strong>{pageName}</strong>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.connection}>
              <i
                style={{
                  background: online ? 'var(--accent)' : 'var(--warning)',
                }}
              />
              {online ? 'Online' : 'Offline'}
            </span>
            <span className={styles.currency}>{currency}</span>
            <button
              className={ui.iconButton}
              aria-label={`Switch to ${settings.data.theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() =>
                settings.update({
                  ...settings.data,
                  theme: settings.data.theme === 'dark' ? 'light' : 'dark',
                })
              }
            >
              <Icon
                name={settings.data.theme === 'dark' ? 'sun' : 'moon'}
                size={19}
              />
            </button>
          </div>
        </header>
        <main className={styles.main}>
          {!online && (
            <div className={ui.banner} role="status">
              You’re offline. You can still manage your transactions and
              budgets.
            </div>
          )}
          {issues.length > 0 && (
            <div className={ui.banner} role="alert">
              Some changes cannot be saved. Your original saved data has been
              kept. <Link to="/settings">Review storage in Settings</Link>.
            </div>
          )}
          {settings.data.displayCurrency === 'EUR' &&
            (rates.status !== 'success' || !rates.rate) && (
              <div className={ui.banner} role="status">
                {rates.rate
                  ? `Using the saved EUR rate from ${rates.rate.date}.`
                  : 'Showing USD until a valid EUR rate is available.'}{' '}
                {rates.status === 'loading' ? (
                  'Updating rate…'
                ) : (
                  <button className={ui.textButton} onClick={rates.retry}>
                    Retry exchange rate
                  </button>
                )}
              </div>
            )}
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  {...transactionProps}
                  {...periodProps}
                  budgets={budgets.data}
                />
              }
            />
            <Route
              path="/transactions"
              element={<Transactions {...transactionProps} />}
            />
            <Route
              path="/budget"
              element={
                <Budget
                  {...periodProps}
                  budgets={budgets.data}
                  transactions={transactions.data}
                  money={money}
                  onSave={saveBudget}
                  onDelete={(id) => {
                    budgets.update((current) =>
                      current.filter((budget) => budget.id !== id),
                    );
                    setNotice('Budget removed.');
                  }}
                />
              }
            />
            <Route
              path="/statistics"
              element={
                <Statistics
                  {...periodProps}
                  transactions={transactions.data}
                  money={money}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  settings={settings.data}
                  onChange={settings.update}
                  rates={rates}
                  issues={issues}
                  onClear={() => {
                    transactions.update([]);
                    setNotice('All transactions cleared.');
                  }}
                  onDemo={() => {
                    transactions.update(demoTransactions());
                    setNotice('Demo transactions loaded.');
                  }}
                />
              }
            />
            <Route
              path="*"
              element={
                <div className={ui.empty}>
                  <p className={ui.eyebrow}>404 · A WRONG TURN</p>
                  <h1 id="main-heading" tabIndex={-1}>
                    Nothing to see here.
                  </h1>
                  <p>Let’s get you back to your finances.</p>
                  <Link className={ui.primary} to="/">
                    Back to dashboard
                  </Link>
                </div>
              }
            />
          </Routes>
          <footer className={styles.footer}>
            <span>
              FinanceFlow<span className={styles.brandDot}>.</span>{' '}
              <span className={styles.footerTagline}>
                A little more clarity, every day.
              </span>
            </span>
            <span>Made for the everyday.</span>
          </footer>
        </main>
      </div>
      <div className={styles.toastRegion} role="status" aria-live="polite">
        {notice && (
          <div className={styles.toast}>
            <Icon name="check" size={18} />
            {notice}
            <button
              className={ui.iconButton}
              onClick={() => setNotice('')}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
      {editing && (
        <TransactionForm
          transaction={editing === 'new' ? undefined : editing}
          maxAmountCents={
            Number.MAX_SAFE_INTEGER -
            transactions.data.reduce((sum, t) => sum + t.amountCents, 0) +
            (editing === 'new' ? 0 : editing.amountCents)
          }
          onSave={saveTransaction}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this transaction?"
          message={`“${deleting.description}” (${money(deleting.amountCents)}) will be permanently removed. Your totals and budgets will update too.`}
          confirmLabel="Delete transaction"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            transactions.update((current) =>
              current.filter((t) => t.id !== deleting.id),
            );
            setDeleting(null);
            setNotice('Transaction deleted.');
          }}
        />
      )}
    </div>
  );
}
