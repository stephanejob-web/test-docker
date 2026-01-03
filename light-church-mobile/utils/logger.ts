/**
 * Logger utility - only logs in development mode
 * Prevents console pollution in production
 */

const isDev = __DEV__;

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
};
