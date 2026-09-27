import { useState } from 'react';
import type { Settings as SettingsType } from '../types';
import type { RateState } from '../hooks/useExchangeRate';
import { PageHeading } from '../components/PageHeading';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import styles from '../components/ui.module.css';

export interface StorageIssue {
  name: string;
  message: string;
  reset: () => void;
}
export default function Settings({
  settings,
  onChange,
  rates,
  onClear,
  onDemo,
  issues,
}: {
  settings: SettingsType;
  onChange: (settings: SettingsType) => void;
  rates: RateState;
  onClear: () => void;
  onDemo: () => void;
  issues: StorageIssue[];
}) {
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    label: string;
    action: () => void;
  } | null>(null);
  return (
    <>
      <PageHeading
        title="A space that feels like yours."
        description="A few small preferences to make FinanceFlow work for you."
      />
      <div className={styles.settingsStack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Look & feel</h2>
              <p>Find your comfortable view.</p>
            </div>
            <Icon name="sun" />
          </div>
          <div className={styles.settingsRow}>
            <div>
              <h3>Appearance</h3>
              <p>Choose a light or dark workspace.</p>
            </div>
            <label>
              <span className="sr-only">Theme</span>
              <select
                value={settings.theme}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    theme: event.target.value as SettingsType['theme'],
                  })
                }
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Currency</h2>
              <p>The same money, a different perspective.</p>
            </div>
            <Icon name="transactions" />
          </div>
          <div className={styles.settingsRow}>
            <div>
              <h3>Display currency</h3>
              <p>Transactions and budget limits are always entered in USD.</p>
            </div>
            <label>
              <span className="sr-only">Display currency</span>
              <select
                value={settings.displayCurrency}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    displayCurrency: event.target
                      .value as SettingsType['displayCurrency'],
                  })
                }
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </label>
          </div>
          <div className={styles.rateBox}>
            <div>
              <h3>Daily reference rate</h3>
              {rates.rate && (
                <p>
                  1 USD = {rates.rate.rate.toFixed(4)} EUR{' '}
                  <span className={styles.muted}>· {rates.rate.date}</span>
                </p>
              )}
              {rates.status === 'loading' && (
                <p role="status">
                  Updating exchange rate…
                  {rates.rate ? ' Showing the saved rate for now.' : ''}
                </p>
              )}
              {rates.status === 'error' && (
                <p role="alert" className={styles.negative}>
                  {rates.error}{' '}
                  {rates.rate
                    ? 'Using the last saved rate.'
                    : 'No rate available. Amounts are displayed in USD.'}
                </p>
              )}
              {rates.cacheError && <p role="alert">{rates.cacheError}</p>}
              <p className={styles.muted}>
                Source:{' '}
                <a
                  href="https://frankfurter.dev/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Frankfurter
                </a>
                . Daily reference data, not live trading prices.
              </p>
            </div>
            <button
              className={styles.secondary}
              disabled={rates.status === 'loading'}
              onClick={rates.retry}
            >
              {rates.status === 'error' ? 'Retry' : 'Refresh rate'}
            </button>
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Your data</h2>
              <p>Stored in this browser. Always under your control.</p>
            </div>
            <Icon name="shield" />
          </div>
          <div className={styles.settingsRow}>
            <div>
              <h3>Try the demo</h3>
              <p>
                Replace transactions with 20 fictional examples. Budgets and
                preferences stay as they are.
              </p>
            </div>
            <button
              className={styles.secondary}
              onClick={() =>
                setConfirmation({
                  title: 'Replace transactions with demo data?',
                  message:
                    'All current transactions will be replaced by fictional examples. This cannot be undone. Your budgets and settings will stay as they are.',
                  label: 'Load demo data',
                  action: onDemo,
                })
              }
            >
              Load demo data
            </button>
          </div>
          <div className={styles.settingsRow}>
            <div>
              <h3>Start fresh</h3>
              <p>
                Delete every transaction. Your budgets and preferences will
                stay.
              </p>
            </div>
            <button
              className={styles.dangerOutline}
              onClick={() =>
                setConfirmation({
                  title: 'Clear all transactions?',
                  message:
                    'Every transaction will be deleted from this browser. This cannot be undone. Budgets and settings will stay as they are.',
                  label: 'Clear all transactions',
                  action: onClear,
                })
              }
            >
              Clear all transactions
            </button>
          </div>
          {issues.map((issue) => (
            <div className={styles.settingsRow} key={issue.name}>
              <div>
                <h3>{issue.name} storage needs attention</h3>
                <p>{issue.message}</p>
              </div>
              <button
                className={styles.dangerOutline}
                onClick={() =>
                  setConfirmation({
                    title: `Reset ${issue.name.toLowerCase()}?`,
                    message: `This explicitly replaces the saved ${issue.name.toLowerCase()} with its empty or default value. Any unreadable original data in this set will be lost.`,
                    label: 'Reset saved data',
                    action: issue.reset,
                  })
                }
              >
                Reset {issue.name.toLowerCase()}
              </button>
            </div>
          ))}
        </section>
        <p className={styles.footnote}>
          <Icon name="shield" size={16} />
          No bank connections. No account needed. Your financial data stays in
          this browser.
        </p>
      </div>
      {confirmation && (
        <ConfirmDialog
          title={confirmation.title}
          message={confirmation.message}
          confirmLabel={confirmation.label}
          onClose={() => setConfirmation(null)}
          onConfirm={() => {
            confirmation.action();
            setConfirmation(null);
          }}
        />
      )}
    </>
  );
}
