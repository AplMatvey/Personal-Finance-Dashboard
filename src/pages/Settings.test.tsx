import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Settings from './Settings';

describe('preferences', () => {
  it('changes theme and currency through labeled controls', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <Settings
        settings={{ theme: 'dark', displayCurrency: 'USD' }}
        onChange={change}
        rates={{
          rate: null,
          status: 'error',
          error: 'Unavailable',
          cacheError: '',
          retry: vi.fn(),
        }}
        onClear={vi.fn()}
        onDemo={vi.fn()}
        issues={[]}
      />,
    );
    await user.selectOptions(screen.getByLabelText('Theme'), 'light');
    expect(change).toHaveBeenCalledWith({
      theme: 'light',
      displayCurrency: 'USD',
    });
    await user.selectOptions(screen.getByLabelText('Display currency'), 'EUR');
    expect(change).toHaveBeenCalledWith({
      theme: 'dark',
      displayCurrency: 'EUR',
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Amounts are displayed in USD',
    );
  });
});
