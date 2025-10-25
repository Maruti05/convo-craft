type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const enabledLevels: Record<LogLevel, boolean> = {
  debug: __DEV__ === true,
  info: true,
  warn: true,
  error: true,
};

function format(level: LogLevel, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  try {
    return `${base} :: ${JSON.stringify(meta)}`;
  } catch {
    return base;
  }
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (!enabledLevels.debug) return;
    // Avoid logging secrets by policy; caller should redact
    console.log(format('debug', message, meta));
  },
  info(message: string, meta?: unknown) {
    if (!enabledLevels.info) return;
    console.log(format('info', message, meta));
  },
  warn(message: string, meta?: unknown) {
    if (!enabledLevels.warn) return;
    console.warn(format('warn', message, meta));
  },
  error(message: string, meta?: unknown) {
    if (!enabledLevels.error) return;
    console.error(format('error', message, meta));
  },
};