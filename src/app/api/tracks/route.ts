/**
 * Custom Tracks API
 * Save and load custom tracks from Redis
 * 
 * GET - Public (game needs to load tracks)
 * POST/PUT/DELETE - Admin only (requires valid session)
 */

import { debugLog } from '@/utils/debugMode';
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { isValidSession } from '@/app/api/admin/sessionStore';

const TRACKS_KEY = 'ctr-kart:custom-tracks';

/**
 * Check if request has valid admin session
 */
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  debugLog('[Tracks API] Auth header:', authHeader ? 'present' : 'missing');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const valid = await isValidSession(token);
    debugLog('[Tracks API] Bearer token valid:', valid);
    if (valid) {
      return true;
    }
  }
  
  // Check cookie
  const sessionToken = request.cookies.get('digiko_admin_session')?.value;
  debugLog('[Tracks API] Cookie present:', sessionToken ? 'yes' : 'no');
  
  if (sessionToken) {
    const valid = await isValidSession(sessionToken);
    debugLog('[Tracks API] Cookie session valid:', valid);
    if (valid) {
      return true;
    }
  }
  
  // List all cookies for debugging
  const allCookies = request.cookies.getAll();
  debugLog('[Tracks API] All cookies:', allCookies.map(c => c.name));
  
  return false;
}

interface CircuitStyle {
  outerBorderColor: string;
  innerBorderColor: string;
  trackColor: string;
  startLineColor: string;
  backgroundColor1: string;
  backgroundColor2: string;
  backgroundColor3: string;
  backgroundImage?: string;
  backgroundOpacity: number;
  glowIntensity: number;
}

interface CustomTrack {
  id: string;
  name: string;
  description: string;
  waypoints: Array<{ x: number; y: number; width: number }>;
  pieces?: Array<{ id: string; type: string; gridX: number; gridY: number; rotation: number }>;
  style?: CircuitStyle;
  createdAt: number;
  updatedAt: number;
}

// GET - List all tracks or get specific track
export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not available' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('id');

  try {
    if (trackId) {
      // Get specific track
      const track = await redis.hget(TRACKS_KEY, trackId);
      if (!track) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      }
      return NextResponse.json({ track: typeof track === 'string' ? JSON.parse(track) : track });
    } else {
      // List all tracks
      const allTracks = await redis.hgetall(TRACKS_KEY);
      const tracks: CustomTrack[] = [];
      
      if (allTracks) {
        for (const [, value] of Object.entries(allTracks)) {
          try {
            const track = typeof value === 'string' ? JSON.parse(value) : value;
            tracks.push(track);
          } catch {
            // Skip invalid entries
          }
        }
      }
      
      // Sort by updatedAt desc
      tracks.sort((a, b) => b.updatedAt - a.updatedAt);
      
      return NextResponse.json({ tracks });
    }
  } catch (error) {
    console.error('[Tracks API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

// POST - Save new track (Admin only)
export async function POST(request: NextRequest) {
  // Auth check
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not available' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, description, waypoints, pieces, style } = body;

    if (!name || !waypoints || waypoints.length < 3) {
      return NextResponse.json({ error: 'Invalid track data. Need name and at least 3 waypoints.' }, { status: 400 });
    }

    const now = Date.now();
    const track: CustomTrack = {
      id: `track-${now}`,
      name,
      description: description || '',
      waypoints,
      pieces: pieces || undefined,
      style: style || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await redis.hset(TRACKS_KEY, { [track.id]: JSON.stringify(track) });

    return NextResponse.json({ track, message: 'Track saved successfully' });
  } catch (error) {
    console.error('[Tracks API] Error:', error);
    return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
  }
}

// PUT - Update existing track (Admin only)
export async function PUT(request: NextRequest) {
  // Auth check
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('id');
    const body = await request.json();
    const { name, description, waypoints, pieces, style } = body;

    const id = trackId || body.id;
    if (!id) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const existing = await redis.hget(TRACKS_KEY, id);
    if (!existing) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    const existingTrack = typeof existing === 'string' ? JSON.parse(existing) : existing;
    const updatedTrack: CustomTrack = {
      ...existingTrack,
      name: name || existingTrack.name,
      description: description ?? existingTrack.description,
      waypoints: waypoints || existingTrack.waypoints,
      pieces: pieces || existingTrack.pieces,
      style: style || existingTrack.style,
      updatedAt: Date.now(),
    };

    await redis.hset(TRACKS_KEY, { [id]: JSON.stringify(updatedTrack) });

    return NextResponse.json({ track: updatedTrack, message: 'Track updated successfully' });
  } catch (error) {
    console.error('[Tracks API] Error:', error);
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  }
}

// DELETE - Delete track (Admin only)
export async function DELETE(request: NextRequest) {
  // Auth check
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not available' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('id');

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
  }

  try {
    await redis.hdel(TRACKS_KEY, trackId);
    return NextResponse.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('[Tracks API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}
