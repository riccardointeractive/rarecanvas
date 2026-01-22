/**
 * SECURE Admin Authentication Utilities
 * 
 * SECURITY IMPROVEMENTS:
 * 1. Password hash stored in environment variable (not in code!)
 * 2. Salted hashing with crypto.randomBytes
 * 3. Unique session tokens with expiration
 * 4. Server-side validation via API route
 * 
 * SETUP REQUIRED:
 * 1. Add ADMIN_PASSWORD_HASH to .env.local
 * 2. Add ADMIN_SESSION_SECRET to .env.local
 * 
 * Generate new hash: node scripts/generate-admin-password-secure.js
 */

// ============================================================================
// Types
// ============================================================================

import { debugWarn } from '@/utils/debugMode';

export interface SessionData {
  token: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  message: string;
  sessionToken?: string;
}

// ============================================================================
// Configuration
// ============================================================================

// Session expires after 24 hours
export const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Maximum login attempts before lockout
export const MAX_LOGIN_ATTEMPTS = 5;

// Lockout duration: 15 minutes (increased from 5)
export const LOCKOUT_DURATION = 15 * 60 * 1000;

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'digiko_admin_session',
  ATTEMPTS: 'digiko_admin_attempts',
  LOCKOUT_UNTIL: 'digiko_admin_lockout',
} as const;

// ============================================================================
// Client-Side Session Management
// ============================================================================

/**
 * Check if current session is valid
 * Validates both local storage AND verifies with server
 */
export async function isSessionValid(): Promise<boolean> {
  const session = getLocalSession();
  
  if (!session) return false;
  
  // Check local expiration first (fast path)
  if (Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }
  
  // Verify with server (secure path)
  try {
    const response = await fetch('/api/admin/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: session.token }),
    });
    
    // If server explicitly says invalid, clear session and deny access
    if (response.status === 401) {
      // 🔒 SECURITY: Don't trust client-side session if server rejects it
      debugWarn('Server rejected session - clearing local session');
      clearSession();
      return false;
    }
    
    if (!response.ok) {
      // Server error (5xx) - be cautious, deny access
      debugWarn('Server error during verification - denying access for safety');
      return false;
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch {
    // If server is unreachable, don't trust client-side session
    // 🔒 SECURITY: Fail closed, not open
    debugWarn('Could not verify session with server - denying access for safety');
    return false;
  }
}

/**
 * Synchronous session check for initial render
 * Use isSessionValid() for secure verification
 */
export function isSessionValidSync(): boolean {
  const session = getLocalSession();
  if (!session) return false;
  return Date.now() < session.expiresAt;
}

/**
 * Get session from local storage
 */
function getLocalSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;
    
    const session = JSON.parse(stored) as SessionData;
    
    // Validate session structure
    if (!session.token || !session.createdAt || !session.expiresAt) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Save session to local storage
 */
export function saveSession(sessionToken: string): void {
  const session: SessionData = {
    token: sessionToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };
  
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  
  // Clear any lockout state on successful login
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
}

/**
 * Clear session from local storage
 */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Get current session token
 */
export function getSessionToken(): string | null {
  const session = getLocalSession();
  return session?.token ?? null;
}

// ============================================================================
// Rate Limiting (Client-Side Tracking)
// ============================================================================

/**
 * Check if user is locked out
 */
export function isLockedOut(): boolean {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  if (!lockoutUntil) return false;
  
  const until = parseInt(lockoutUntil, 10);
  if (Date.now() > until) {
    // Lockout expired, clear it
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    return false;
  }
  
  return true;
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutRemaining(): number {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  if (!lockoutUntil) return 0;
  
  const until = parseInt(lockoutUntil, 10);
  const remaining = until - Date.now();
  
  return Math.max(0, Math.ceil(remaining / 1000));
}

/**
 * Get current attempt count
 */
export function getAttemptCount(): number {
  const attempts = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  return attempts ? parseInt(attempts, 10) : 0;
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(): { isLocked: boolean; attemptsRemaining: number } {
  const currentAttempts = getAttemptCount() + 1;
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, currentAttempts.toString());
  
  if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
    return { isLocked: true, attemptsRemaining: 0 };
  }
  
  return { isLocked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS - currentAttempts };
}

/**
 * Reset attempt counter (on successful login)
 */
export function resetAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
}

// ============================================================================
// Authentication (Server-Side)
// ============================================================================

/**
 * Authenticate with server
 * Password is sent to server for secure hashing and comparison
 */
export async function authenticate(password: string): Promise<AuthResult> {
  // Check lockout first
  if (isLockedOut()) {
    const remaining = getLockoutRemaining();
    return {
      success: false,
      message: `Too many failed attempts. Please wait ${Math.ceil(remaining / 60)} minutes.`,
    };
  }
  
  if (!password) {
    return { success: false, message: 'Password is required' };
  }
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      const { isLocked, attemptsRemaining } = recordFailedAttempt();
      
      if (isLocked) {
        return {
          success: false,
          message: 'Too many failed attempts. Account locked for 15 minutes.',
        };
      }
      
      return {
        success: false,
        message: `Incorrect password. ${attemptsRemaining} attempts remaining.`,
      };
    }
    
    // Success - save session token
    if (data.sessionToken) {
      saveSession(data.sessionToken);
      resetAttempts();
      
      return {
        success: true,
        message: 'Authentication successful',
        sessionToken: data.sessionToken,
      };
    }
    
    return { success: false, message: 'Invalid server response' };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

/**
 * Logout - clear session both locally and on server
 */
export async function logout(): Promise<void> {
  const token = getSessionToken();
  
  // Clear local session immediately
  clearSession();
  
  // Notify server to invalidate session
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Ignore server errors during logout - local session is cleared
    }
  }
}
