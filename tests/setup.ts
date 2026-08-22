import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver. react-grid-layout's WidthProvider
// (used by GalleryGrid) needs it to measure its container; a no-op stub is
// enough since jsdom also reports 0 for offsetWidth/offsetHeight.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}
