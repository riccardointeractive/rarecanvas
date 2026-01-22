import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { isValidSession } from '@/app/api/admin/sessionStore';

/**
 * Maintenance Config API
 * 
 * GET: Fetch current maintenance configuration (public)
 * POST: Update maintenance configuration (admin only - AUTHENTICATED)
 * 
 * Uses shared Redis client from @/lib/redis for cross-device persistence.
 */

/**
 * Check if request has valid admin session
 */
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (await isValidSession(token)) return true;
  }
  
  // Check cookie
  const sessionToken = request.cookies.get('digiko_admin_session')?.value;
  if (sessionToken && await isValidSession(sessionToken)) return true;
  
  return false;
}

const CONFIG_KEY = 'digiko:maintenance';

// Default config
const DEFAULT_CONFIG = {
  pages: {
    staking: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    swap: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    dashboard: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    games: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    dgko: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    babydgko: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
    documentation: { enabled: false, endTime: null, reason: 'This feature is temporarily undergoing maintenance.', showCountdown: true },
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// GET - Fetch maintenance config
export async function GET() {
  const redis = getRedis();
  
  if (!redis) {
    return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
  }
  
  try {
    const config = await redis.get(CONFIG_KEY);
    
    if (!config) {
      return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
    }
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error reading maintenance config:', error);
    return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
  }
}

// POST - Update maintenance config (ADMIN ONLY)
export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!await isAdminRequest(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const redis = getRedis();
  
  if (!redis) {
    return NextResponse.json(
      { success: false, error: 'Redis not configured' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    
    if (!body.pages) {
      return NextResponse.json(
        { success: false, error: 'Invalid config: missing pages' },
        { status: 400 }
      );
    }

    const config = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(CONFIG_KEY, config);
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error writing maintenance config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to write config.' },
      { status: 500 }
    );
  }
}
