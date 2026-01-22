'use client';

import { useState, useEffect } from 'react';
import { 
  authenticate, 
  isLockedOut, 
  getLockoutRemaining,
  getAttemptCount,
  MAX_LOGIN_ATTEMPTS 
} from '../utils/adminAuth.secure';

/**
 * SECURE LoginForm Component
 * 
 * Uses server-side authentication with:
 * - PBKDF2 password hashing
 * - Rate limiting per IP
 * - Secure session tokens
 * - Timing-safe comparison
 */

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginFormSecure({ onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check lockout status on mount and update countdown
  useEffect(() => {
    const checkLockout = () => {
      if (isLockedOut()) {
        setLockoutTime(getLockoutRemaining());
      } else {
        setLockoutTime(0);
      }
    };

    checkLockout();
    
    // Update countdown every second if locked out
    const interval = setInterval(() => {
      if (lockoutTime > 0) {
        const remaining = getLockoutRemaining();
        setLockoutTime(remaining);
        if (remaining === 0) {
          setError('');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTime > 0) {
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await authenticate(password);
      
      if (result.success) {
        onSuccess();
        setPassword('');
      } else {
        setError(result.message);
        setPassword('');
        
        // Check if we're now locked out
        if (isLockedOut()) {
          setLockoutTime(getLockoutRemaining());
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attemptsRemaining = MAX_LOGIN_ATTEMPTS - getAttemptCount();
  const isLocked = lockoutTime > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-info mb-4 shadow-[0_0_40px_rgba(0,102,255,0.3)]">
            <svg className="w-8 h-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-text-primary mb-2 tracking-tight">Admin Access</h1>
          <p className="text-text-secondary">Secure authentication required</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl border border-border-default p-8">
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default rounded-xl text-text-primary placeholder-gray-500 focus:outline-none focus:border-brand-primary/40 focus:bg-overlay-default transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                placeholder={isLocked ? 'Please wait...' : 'Enter admin password'}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Lockout Timer */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-xl border bg-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-amber-400">Account Temporarily Locked</div>
                  <div className="text-xs text-amber-400/60 mt-1">
                    Try again in: <span className="font-mono">{formatTime(lockoutTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocked && (
            <div className="mb-6 p-4 rounded-xl border bg-error/10 border-red-500/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-error">{error}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLocked || !password || isSubmitting}
            className="group relative w-full px-6 py-4 bg-gradient-to-r from-brand-primary to-info text-text-primary font-semibold rounded-xl transition-all duration-500 shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_50px_rgba(0,102,255,0.6)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-border-active border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : isLocked ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Access Locked
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Access Admin Panel
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </button>
        </form>

        {/* Security Info */}
        <div className="mt-6 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-xs text-success/80">
              <div className="font-semibold mb-1">Security Features</div>
              <div className="text-success/60 space-y-0.5">
                <div>• Server-side PBKDF2 password verification</div>
                <div>• {MAX_LOGIN_ATTEMPTS} attempts before 15-min lockout</div>
                <div>• Timing-safe comparison (anti-timing attack)</div>
                <div>• Session expires after 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts Counter (only show if some attempts used) */}
        {!isLocked && attemptsRemaining < MAX_LOGIN_ATTEMPTS && attemptsRemaining > 0 && (
          <div className="mt-4 text-center text-sm text-text-muted">
            {attemptsRemaining} login attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginFormSecure;
