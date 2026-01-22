import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../sessionStore';

/**
 * POST /api/admin/verify-session
 * Verify that a session token is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists and is not expired
    const session = await getSession(token);
    
    if (!session) {
      return NextResponse.json(
        { valid: false, message: 'Session not found or expired' },
        { status: 401 }
      );
    }
    
    const now = Date.now();
    
    // Session is valid
    return NextResponse.json({
      valid: true,
      expiresAt: session.expiresAt,
      remainingMs: session.expiresAt - now,
    });
    
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
