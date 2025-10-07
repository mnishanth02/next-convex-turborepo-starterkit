/**
 * Environment Variable Validation
 *
 * This module validates required environment variables at build time.
 * Add this import to your root layout or app entry point.
 */

const requiredEnvVars = {
  // Public environment variables (accessible in browser)
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  // Add more required env vars here
} as const

// Server-only environment variables (not accessible in browser)
const serverEnvVars = {
  // NODE_ENV is always available
  NODE_ENV: process.env.NODE_ENV,
  // Add server-only env vars here
} as const

/**
 * Validates that all required environment variables are defined
 * @throws Error if any required environment variable is missing
 */
function validateEnv(): void {
  const missingVars: string[] = []

  // Check required public env vars
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingVars.push(key)
    }
  }

  // Check server-only env vars (only on server)
  if (typeof window === "undefined") {
    for (const [key, value] of Object.entries(serverEnvVars)) {
      if (!value && key !== "NODE_ENV") {
        missingVars.push(key)
      }
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map((v) => `  - ${v}`).join("\n")}\n\n` +
        `Please add these to your .env.local file or deployment environment.`
    )
  }
}

// Run validation
validateEnv()

/**
 * Type-safe environment variable access
 */
export const env = {
  // Public vars (accessible in browser and server)
  NEXT_PUBLIC_CONVEX_URL: requiredEnvVars.NEXT_PUBLIC_CONVEX_URL!,
  NEXT_PUBLIC_SITE_URL: requiredEnvVars.NEXT_PUBLIC_SITE_URL!,

  // Server-only vars (only accessible on server)
  NODE_ENV: serverEnvVars.NODE_ENV!,

  // Helper to check if we're in production
  get isProduction() {
    return this.NODE_ENV === "production"
  },

  // Helper to check if we're in development
  get isDevelopment() {
    return this.NODE_ENV === "development"
  },
} as const

// Type guard to ensure server-only access
export function getServerEnv(): typeof env & { serverOnly: true } {
  if (typeof window !== "undefined") {
    throw new Error("Server-only environment variables accessed on client side")
  }
  return { ...env, serverOnly: true }
}
