import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import 'vitest-canvas-mock';

// Mock ResizeObserver
class MockResizeObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

// Update global definitions
global.ResizeObserver = MockResizeObserver;
(global.DOMRect as any) = class DOMRect {
  bottom = 0;
  height = 100;
  left = 0;
  right = 0;
  top = 0;
  width = 100;
  x = 0;
  y = 0;
  toJSON() {
    return {};
  }
};

// Mock window methods
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(global.IntersectionObserver as any) = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};
