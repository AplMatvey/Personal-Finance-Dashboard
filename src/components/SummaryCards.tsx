import type { MoneyFormatter, Transaction } from '../types';
import { inMonth, monthLabel, totals } from '../utils/finance';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export function SummaryCards({
  transactions,
  month,
  money,
}: {
  transactions: Transaction[];
  month: string;
  money: MoneyFormatter;
}) {
  const all = totals(transactions);
  const monthly = totals(inMonth(transactions, month));
  const cards: {
    title: string;
    value: number;
    icon: IconName;
    caption: string;
  }[] = [
    {
      title: 'Total balance',
      value: all.balance,
      icon: 'budget',
      caption: 'Across all your transactions',
    },
    {
      title: 'Income',
      value: monthly.income,
      icon: 'arrowDown',
      caption: monthLabel(month),
    },
    {
      title: 'Expenses',
      value: monthly.expense,
      icon: 'arrowUp',
      caption: monthLabel(month),
    },
    {
      title: 'Net savings',
      value: monthly.balance,
      icon: 'statistics',
      caption: 'Income minus expenses this month',
    },
  ];
  return (
    <div className={styles.summaryGrid}>
      {cards.map((card, index) => (
        <section
          className={`${styles.summaryCard} ${index === 0 ? styles.featuredCard : ''}`}
          key={card.title}
        >
          <div className={styles.summaryTitle}>
            <span>{card.title}</span>
            <Icon name={card.icon} size={19} />
          </div>
          <p className={styles.summaryValue}>{money(card.value)}</p>
          <p className={styles.summaryCaption}>{card.caption}</p>
        </section>
      ))}
    </div>
  );
}
