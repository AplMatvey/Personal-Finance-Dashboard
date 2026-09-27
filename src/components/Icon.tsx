import type { CSSProperties } from 'react';
const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  transactions: 'M4 7h15m-4-4 4 4-4 4 M20 17H5m4-4-4 4 4 4',
  budget:
    'M3 6a2 2 0 0 1 2-2h14v4H5a2 2 0 0 1-2-2v12a2 2 0 0 0 2 2h16V8H5 M16 12h5v4h-5z',
  statistics: 'M4 20V10m8 10V4m8 16v-7',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  plus: 'M12 5v14M5 12h14',
  arrowUp: 'M7 17 17 7M7 7h10v10',
  arrowDown: 'M7 7 17 17M7 17h10V7',
  arrowRight: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
  close: 'm6 6 12 12M6 18 18 6',
  edit: 'm15 4 5 5M4 20l5-1L21 7l-5-5L4 14z',
  trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  food: 'M5 3v7m4-7v7M3 3v5a4 4 0 0 0 8 0V3M7 12v9M19 3c-4 3-4 8 0 8v10M19 3v8',
  transport:
    'M5 16H3v-6l3-6h12l3 6v6h-2M7 16h10M3 10h18M5 19v-5h3v5zm11 0v-5h3v5z',
  housing: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
  entertainment: 'M4 4h16v16H4zM4 9h16M9 4v5M15 4v5m-5 4 5 3-5 3z',
  health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  other: 'M4 4h16v16H4zM8 12h8',
  salary: 'M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 11v4h4v-4',
  freelance: 'M3 4h18v13H3zM8 21h8m-4-4v4',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11',
  check: 'm5 12 4 4L19 6',
  shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z m-4 9 3 3 5-6',
  calendar: 'M4 5h16v16H4zM8 3v4m8-4v4M4 10h16',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
