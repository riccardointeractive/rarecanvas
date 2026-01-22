import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addSession, checkRateLimit, resetRateLimit } from '../sessionStore';

/**
 * SECURE Admin Login API Route
 * 
 * This handles authentication server-side with:
 * 1. Password hashing with PBKDF2 (not just SHA-256)
 * 2. Session token generation
 * 3. Environment variable for password hash
 * 4. Rate limiting per IP
 * 
 * REQUIRED ENV VARIABLES:
 * - ADMIN_PASSWORD_HASH: The PBKDF2 hash of the admin password
 * - ADMIN_PASSWORD_SALT: Salt for password hashing
 */

// Configuration
const MAX_ATTEMPTS_PER_IP = 10;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hash password with PBKDF2 (more secure than plain SHA-256)
 */
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/admin/login
 * Authenticate admin user
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    const rateLimit = await checkRateLimit(ip, MAX_ATTEMPTS_PER_IP, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      const retryAfterSecs = Math.ceil((rateLimit.retryAfterMs || 0) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many attempts. Try again in ${retryAfterSecs} seconds.` 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
          }
        }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { password } = body;
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Get password hash from environment
    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    const salt = process.env.ADMIN_PASSWORD_SALT || 'digiko-default-salt-change-me';
    
    if (!storedHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set!');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Hash the provided password
    const inputHash = hashPassword(password, salt);
    
    // Timing-safe comparison to prevent timing attacks
    const storedBuffer = Buffer.from(storedHash, 'hex');
    const inputBuffer = Buffer.from(inputHash, 'hex');
    
    if (storedBuffer.length !== inputBuffer.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isValid = crypto.timingSafeEqual(storedBuffer, inputBuffer);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate session token
    const sessionToken = generateSessionToken();
    const now = Date.now();
    
    // Store session in shared store
    await addSession(sessionToken, {
      createdAt: now,
      expiresAt: now + SESSION_DURATION,
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    
    // Reset rate limit on successful login
    await resetRateLimit(ip);
    
    // Success response
    return NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: now + SESSION_DURATION,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
