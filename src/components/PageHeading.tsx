import type { ReactNode } from 'react';
import { isMonth } from '../utils/finance';
import styles from './ui.module.css';
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.pageHeading}>
      <div>
        <p className={styles.eyebrow}>YOUR MONEY, IN PERSPECTIVE</p>
        <h1 id="main-heading" tabIndex={-1}>
          {title}
        </h1>
        <p>{description}</p>
      </div>
      <div className={styles.headingActions}>{children}</div>
    </div>
  );
}
export function MonthPicker({
  month,
  onChange,
}: {
  month: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.monthPicker}>
      <span className="sr-only">Selected month</span>
      <input
        type="month"
        value={month}
        onChange={(event) => {
          if (isMonth(event.target.value)) onChange(event.target.value);
        }}
      />
    </label>
  );
}
