import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  value() {
    this.setAttribute('open', '');
  },
  configurable: true,
});
Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  value() {
    this.removeAttribute('open');
  },
  configurable: true,
});
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
