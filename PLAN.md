# FinanceFlow implementation map

The supplied document is a staged learning outline. The user's delivery request is to implement the full project in one pass, so intermediate stop/approval prompts are not part of this plan.

| Stage | Goal and files                                       | Concepts                                | Acceptance                                          |
| ----- | ---------------------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| 0     | Establish conventions in `AGENTS.md` and this plan   | Scope, architecture                     | One clear implementation map                        |
| 1     | Scaffold Vite, routes and layout in `src/App.tsx`    | Components, props, routing, CSS Modules | Five pages and 404; responsive navigation           |
| 2     | Define `src/types.ts`, demo data and Dashboard       | Types, derived state, reduce            | Totals calculated from 20 fictional transactions    |
| 3     | Build `pages/Transactions.tsx`                       | Filter, stable sort, controlled inputs  | Combined filters; separate empty states             |
| 4     | Add `components/TransactionForm.tsx`                 | Validation, events, cents               | Invalid input cannot be saved                       |
| 5     | Add edit and delete actions in App                   | Immutable updates, stable ids           | Edits keep id; deletion requires confirmation       |
| 6     | Add `services/storage.ts`, `hooks/useStoredState.ts` | Runtime validation, JSON, effects       | Persist data; preserve empty and corrupt storage    |
| 7     | Build Settings and `hooks/useOnline.ts`              | Browser APIs, CSS variables             | Theme/currency persistence; offline local work      |
| 8     | Use `components/Dialog.tsx`                          | Refs, DOM, native focus                 | Escape, Tab containment, return focus               |
| 9     | Build `pages/Budget.tsx` and BudgetProgress          | Aggregation, category/month uniqueness  | CRUD limits; derived spend and overrun              |
| 10    | Build `components/Charts.tsx`, Statistics            | Presentation data, charts               | Six months and category distribution with text      |
| 11    | Add exchange service and hook                        | HTTP, Promise, async, cancellation      | Validated live response; cache/fallback/retry       |
| 12    | Finish states and responsive CSS                     | Semantics, accessibility, media queries | No page overflow at four target widths              |
| 13    | Add `components/ErrorBoundary.tsx`                   | Render error recovery                   | Reload without deleting data                        |
| 14    | Add unit, component and browser tests                | Mocks, assertions, workflows            | Critical data and user behavior covered             |
| 15    | Review and verify all code                           | State flow, cleanup, consistency        | typecheck/lint/format/test/build and browser checks |
| 16    | Write README and capture screenshots                 | Accurate project documentation          | Real screenshots and reproducible setup             |
| 17    | Write `docs/interview-guide.md`                      | Explaining tradeoffs                    | 40 code-based questions, exercises and demo         |
| 18    | Prepare Netlify config and deployment guide          | Static hosting, origin, HTTPS           | SPA fallback included; no publication               |

The final command results and any remaining limitations are recorded in `docs/verification.md`.
