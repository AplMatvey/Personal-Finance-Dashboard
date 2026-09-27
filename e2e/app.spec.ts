import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://api.frankfurter.dev/**', (route) =>
    route.fulfill({
      json: { base: 'USD', quote: 'EUR', rate: 0.9, date: '2025-01-01' },
    }),
  );
});

test('transaction lifecycle updates pages, survives reload, and respects dialog focus', async ({
  page,
}) => {
  await page.goto('/transactions');
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await expect(page.getByLabel('Type', { exact: true }).last()).toBeFocused();
  await page.getByLabel('Amount (USD)').fill('420.50');
  await page.getByLabel('Description').fill('Browser test groceries');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add transaction' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Browser test groceries', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Browser test groceries', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Budget', exact: true }).click();
  await expect(
    page.getByRole('progressbar', { name: 'Food budget used' }),
  ).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByText(/over budget/)).toBeVisible();
  await page.getByRole('link', { name: 'Statistics', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Spending breakdown' }),
  ).toBeVisible();
  await page.goto('/transactions');
  await page.getByLabel('Search transactions').fill('Browser test');
  await page
    .getByRole('button', { name: 'Edit Browser test groceries', exact: true })
    .click();
  await page.getByLabel('Amount (USD)').fill('32.75');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.reload();
  await page.getByLabel('Search transactions').fill('Browser test');
  await expect(page.getByRole('cell', { name: /32.75/ })).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete Browser test groceries' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Delete Browser test groceries' }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Delete Browser test groceries' })
    .click();
  await page
    .getByRole('button', { name: 'Delete transaction', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'No matching transactions' }),
  ).toBeVisible();
  await expect(page.locator('#main-heading')).toBeFocused();
});

test('dialog traps Tab and discards a cancelled draft', async ({ page }) => {
  await page.goto('/transactions');
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await page.getByLabel('Description').fill('Unsaved draft');
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(
        () => document.activeElement?.closest('dialog') !== null,
      ),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await expect(page.getByLabel('Description')).toHaveValue('');
});

test('preferences persist and clearing transactions keeps them empty', async ({
  page,
}) => {
  await page.goto('/settings');
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  await page.getByLabel('Display currency').selectOption('EUR');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page
    .getByRole('button', { name: 'Clear all transactions', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear all transactions', exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel('Display currency')).toHaveValue('EUR');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A clean slate' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('financeflow.transactions.v1')!),
    ),
  ).toEqual([]);
});

test('API failure falls back to USD and corrupt storage is preserved until reset', async ({
  page,
}) => {
  await page.route('https://api.frankfurter.dev/**', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('financeflow.rate.v1');
    localStorage.setItem('financeflow.transactions.v1', 'broken');
    localStorage.setItem(
      'financeflow.settings.v1',
      JSON.stringify({ theme: 'dark', displayCurrency: 'EUR' }),
    );
  });
  await page.goto('/settings');
  await expect(
    page.getByText('No rate available.', { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem('financeflow.transactions.v1'),
    ),
  ).toBe('broken');
  await page
    .getByRole('button', { name: 'Reset transactions', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Reset saved data', exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem('financeflow.transactions.v1'),
    ),
  ).toBe('[]');
});

test('all routes fit desktop, tablet and mobile widths', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      '/',
      '/transactions',
      '/budget',
      '/statistics',
      '/settings',
      '/missing',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('budgets can be created, edited and removed without touching transactions', async ({
  page,
}) => {
  await page.goto('/budget');
  await page.getByRole('button', { name: 'Add budget', exact: true }).click();
  await page.getByLabel('Category', { exact: true }).selectOption('health');
  await page.getByLabel('Monthly limit (USD)').fill('20');
  await page.getByRole('button', { name: 'Save budget' }).click();
  await expect(
    page.getByRole('progressbar', { name: 'Health budget used' }),
  ).toHaveAttribute('aria-valuenow', '100');
  await page.getByRole('button', { name: 'Edit Health budget' }).click();
  await page.getByLabel('Monthly limit (USD)').fill('100');
  await page.getByRole('button', { name: 'Save budget' }).click();
  await page.reload();
  await expect(
    page.getByRole('progressbar', { name: 'Health budget used' }),
  ).toHaveAttribute('aria-valuenow', '35');
  const before = await page.evaluate(() =>
    localStorage.getItem('financeflow.transactions.v1'),
  );
  await page.getByRole('button', { name: 'Delete Health budget' }).click();
  await page
    .getByRole('button', { name: 'Remove budget', exact: true })
    .click();
  await expect(
    page.getByRole('progressbar', { name: 'Health budget used' }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      localStorage.getItem('financeflow.transactions.v1'),
    ),
  ).toBe(before);
});

test('local editing remains available offline and failed storage writes are visible', async ({
  page,
  context,
}) => {
  await page.goto('/transactions');
  await context.setOffline(true);
  await expect(
    page.getByText('You’re offline.', { exact: false }),
  ).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await page.getByLabel('Amount (USD)').fill('9.99');
  await page.getByLabel('Description').fill('Offline coffee');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add transaction' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Offline coffee', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Some changes cannot be saved.', { exact: false }),
  ).toBeVisible();
});

test('light theme handles long descriptions and large amounts on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/settings');
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await page.getByLabel('Amount (USD)').fill('99999999999.99');
  await page.getByLabel('Description').fill('A'.repeat(120));
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add transaction' })
    .click();
  for (const path of [
    '/',
    '/transactions',
    '/budget',
    '/statistics',
    '/settings',
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('capture real application screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'docs/screenshots/dashboard-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({
    path: 'docs/screenshots/dashboard-mobile.png',
    fullPage: true,
  });
});
