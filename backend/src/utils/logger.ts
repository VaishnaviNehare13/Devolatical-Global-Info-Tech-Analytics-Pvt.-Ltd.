/**
 * Lightweight application logging utility.
 * Formats console output with ISO timestamps and log levels.
 *
 * MIGRATION TO WINSTON / PINO:
 * To replace this console wrapper with a library like Winston or Pino in the future:
 * 1. Install the library (e.g., `npm install winston`).
 * 2. Import the library at the top of this file.
 * 3. Configure the logger instance (transports, formatters, files, etc.).
 * 4. Replace the internal console implementations of the logger object below
 *    with calls to the Winston/Pino instance (e.g., `winstonInstance.info(message, ...meta)`).
 *
 * Since all files import this custom logger abstraction, you won't need to
 * modify imports or log calls anywhere else in the application.
 */
export const logger = {
  info: (message: string, ...meta: unknown[]): void => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]): void => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]): void => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  debug: (message: string, ...meta: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, ...meta);
    }
  },
};
