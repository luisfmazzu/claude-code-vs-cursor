import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const createLogger = (): WinstonModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata({
      fillExcept: ['timestamp', 'level', 'message'],
    }),
  );

  const transports: winston.transport[] = [];

  // Console transport
  if (!isProduction) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${level}] ${message} ${stack || ''} ${metaString}`;
          }),
        ),
      }),
    );
  }

  // File transports
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format,
    }),
  );

  // Production specific transports
  if (isProduction) {
    transports.push(
      new winston.transports.Console({
        format,
      }),
    );
  }

  return {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format,
    transports,
    exitOnError: false,
  };
}; 