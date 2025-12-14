import { createLogger, format, transports } from 'winston';
import { config } from './config';

const activeFormat = config.NODE_ENV === 'production' ? format.json() : format.prettyPrint();

/**
 * Application-wide logger instance for the Next.js' server-side code.
 */
export const logger = createLogger({
  level: config.LOGGER_LEVEL,
  format: format.combine(format.timestamp(), activeFormat),
  transports: [new transports.Console({ format: format.simple() })],
});
