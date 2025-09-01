import "@testing-library/jest-dom";

// Ensure React is loaded from the correct location
jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return actualReact;
});

jest.mock("react-dom", () => {
  const actualReactDom = jest.requireActual("react-dom");
  return actualReactDom;
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return require("react").createElement("img", props);
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:5001";
process.env.BACKEND_URL = "http://localhost:5001";

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });
Object.defineProperty(global, "sessionStorage", { value: localStorageMock });

// Mock WebSocket
Object.defineProperty(global, "WebSocket", {
  value: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    readyState: 1,
    url: "",
    protocol: "",
    extensions: "",
    bufferedAmount: 0,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    binaryType: "blob",
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Restore console for debugging if needed
afterEach(() => {
  global.console = originalConsole;
});
