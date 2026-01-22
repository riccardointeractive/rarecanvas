import { NextRequest, NextResponse } from 'next/server';
import { removeSession, getSession } from '../sessionStore';

/**
 * POST /api/admin/logout
 * Invalidate a session token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Check if session existed before removal
    const existed = (await getSession(token)) !== undefined;
    
    // Remove session
    await removeSession(token);
    
    return NextResponse.json({
      success: true,
      message: existed ? 'Session invalidated' : 'Session already expired',
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
