/**
 * Centralized server-side logger
 * Logs to console in development, structured JSON in production.
 * Set SENTRY_DSN in environment to enable Sentry error reporting.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for log aggregators (Logtail, Datadog, etc.)
    console[level](JSON.stringify(entry));
  } else {
    console[level](`[${level.toUpperCase()}]`, message, context ?? '');
  }

  // Sentry integration placeholder
  if (level === 'error' && process.env.SENTRY_DSN) {
    // TODO: import * as Sentry from '@sentry/nextjs';
    // Sentry.captureMessage(message, { level, extra: context });
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

export function logPaymentFailure(
  orderId: string,
  orderNumber: string,
  reason?: string,
  context?: LogContext
) {
  logger.error('Payment failure', {
    order_id: orderId,
    order_number: orderNumber,
    failure_reason: reason ?? 'unknown',
    ...context,
  });
}

export function logPaymentSuccess(orderId: string, orderNumber: string, paymentId: string) {
  logger.info('Payment success', {
    order_id: orderId,
    order_number: orderNumber,
    razorpay_payment_id: paymentId,
  });
}
