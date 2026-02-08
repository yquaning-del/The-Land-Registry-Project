// Sentry Error Tracking Configuration
// Install: npm install @sentry/nextjs

const SENTRY_DSN = process.env.SENTRY_DSN

export interface ErrorContext {
  userId?: string
  email?: string
  action?: string
  metadata?: Record<string, any>
}

// Initialize Sentry (call this in your app's entry point)
export async function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured. Error tracking disabled.')
    return
  }

  // Dynamic import to avoid issues if @sentry/nextjs is not installed
  try {
    const Sentry = await import('@sentry/nextjs')
    
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      
      // Filter out non-critical errors
      beforeSend(event, hint) {
        const error = hint.originalException as Error
        
        // Don't send rate limit errors
        if (error?.message?.includes('Rate limit')) {
          return null
        }
        
        // Don't send auth errors (user mistakes)
        if (error?.message?.includes('Invalid login credentials')) {
          return null
        }
        
        return event
      },
      
      // Ignore common browser errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        /Loading chunk \d+ failed/,
      ],
    })
    
    console.log('✅ Sentry initialized')
  } catch (error) {
    console.warn('Sentry initialization failed:', error)
  }
}

// Capture an error with context
export async function captureError(error: Error, context?: ErrorContext) {
  if (!SENTRY_DSN) {
    console.error('Error (Sentry disabled):', error, context)
    return
  }

  try {
    const Sentry = await import('@sentry/nextjs')
    
    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId, email: context.email })
      }
      
      if (context?.action) {
        scope.setTag('action', context.action)
      }
      
      if (context?.metadata) {
        scope.setExtras(context.metadata)
      }
      
      Sentry.captureException(error)
    })
  } catch (e) {
    console.error('Failed to capture error in Sentry:', e)
    console.error('Original error:', error)
  }
}

// Capture a message (for non-error events)
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
  if (!SENTRY_DSN) {
    console.log(`[${level.toUpperCase()}] ${message}`, context)
    return
  }

  try {
    const Sentry = await import('@sentry/nextjs')
    
    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId, email: context.email })
      }
      
      if (context?.action) {
        scope.setTag('action', context.action)
      }
      
      if (context?.metadata) {
        scope.setExtras(context.metadata)
      }
      
      Sentry.captureMessage(message, level)
    })
  } catch (e) {
    console.log(`[${level.toUpperCase()}] ${message}`, context)
  }
}

// Set user context for all subsequent errors
export async function setUserContext(userId: string, email?: string, metadata?: Record<string, any>) {
  if (!SENTRY_DSN) return

  try {
    const Sentry = await import('@sentry/nextjs')
    
    Sentry.setUser({
      id: userId,
      email,
      ...metadata
    })
  } catch (e) {
    // Silently fail
  }
}

// Clear user context (on logout)
export async function clearUserContext() {
  if (!SENTRY_DSN) return

  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.setUser(null)
  } catch (e) {
    // Silently fail
  }
}

// Check if Sentry is configured
export function isSentryConfigured(): boolean {
  return !!SENTRY_DSN
}

// Wrapper for API route handlers with error tracking
export function withErrorTracking<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  action: string
): T {
  return (async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      await captureError(error as Error, { action })
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }) as T
}
