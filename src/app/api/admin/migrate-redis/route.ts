/**
 * Redis Key Migration API
 * 
 * POST /api/admin/migrate-redis
 * 
 * One-time migration to rename old Redis keys to new `digiko:` prefixed format.
 * Run once after deploying the Redis cleanup update.
 * 
 * This endpoint is idempotent - safe to run multiple times.
 */

import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

// Key mappings: old -> new
const KEY_MIGRATIONS: Record<string, string> = {
  'maintenance-config': 'digiko:maintenance',
  'factory-projects': 'digiko:factory',
  'swap:mainnet:list': 'digiko:swap:mainnet:list',
  'swap:mainnet:lastSync': 'digiko:swap:mainnet:lastSync',
  'swap:testnet:list': 'digiko:swap:testnet:list',
  'swap:testnet:lastSync': 'digiko:swap:testnet:lastSync',
};

interface MigrationResult {
  key: string;
  newKey: string;
  status: 'migrated' | 'not_found' | 'already_exists' | 'error';
  message?: string;
}

export async function POST() {
  const redis = getRedis();
  
  if (!redis) {
    return NextResponse.json(
      { success: false, error: 'Redis not configured' },
      { status: 500 }
    );
  }
  
  const results: MigrationResult[] = [];
  
  for (const [oldKey, newKey] of Object.entries(KEY_MIGRATIONS)) {
    try {
      // Check if new key already exists
      const newExists = await redis.exists(newKey);
      if (newExists) {
        results.push({
          key: oldKey,
          newKey,
          status: 'already_exists',
          message: 'New key already has data, skipping'
        });
        continue;
      }
      
      // Check if old key exists
      const oldExists = await redis.exists(oldKey);
      if (!oldExists) {
        results.push({
          key: oldKey,
          newKey,
          status: 'not_found',
          message: 'Old key not found, nothing to migrate'
        });
        continue;
      }
      
      // Get the type of the old key to handle differently
      const keyType = await redis.type(oldKey);
      
      if (keyType === 'list') {
        // For lists, get all items and push to new key
        const items = await redis.lrange(oldKey, 0, -1);
        if (items.length > 0) {
          // Push all items to new list
          for (const item of items) {
            await redis.rpush(newKey, item);
          }
        }
      } else {
        // For strings/JSON, use RENAME (atomic)
        // But RENAME fails if dest exists, so we use GET/SET/DEL
        const value = await redis.get(oldKey);
        if (value !== null) {
          await redis.set(newKey, value);
        }
      }
      
      // Delete old key
      await redis.del(oldKey);
      
      results.push({
        key: oldKey,
        newKey,
        status: 'migrated',
        message: `Successfully migrated (${keyType})`
      });
      
    } catch (error) {
      results.push({
        key: oldKey,
        newKey,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Also clean up any stale sync locks (they auto-expire but let's be thorough)
  try {
    await redis.del('swap:mainnet:syncLock');
    await redis.del('swap:testnet:syncLock');
  } catch {
    // Ignore errors for lock cleanup
  }
  
  const migrated = results.filter(r => r.status === 'migrated').length;
  const skipped = results.filter(r => r.status === 'already_exists' || r.status === 'not_found').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  return NextResponse.json({
    success: errors === 0,
    summary: {
      total: results.length,
      migrated,
      skipped,
      errors
    },
    results
  });
}

// GET - Show migration status without making changes
export async function GET() {
  const redis = getRedis();
  
  if (!redis) {
    return NextResponse.json(
      { success: false, error: 'Redis not configured' },
      { status: 500 }
    );
  }
  
  const status: Record<string, { oldExists: boolean; newExists: boolean }> = {};
  
  for (const [oldKey, newKey] of Object.entries(KEY_MIGRATIONS)) {
    try {
      const oldExists = await redis.exists(oldKey) > 0;
      const newExists = await redis.exists(newKey) > 0;
      status[oldKey] = { oldExists, newExists };
    } catch {
      status[oldKey] = { oldExists: false, newExists: false };
    }
  }
  
  const needsMigration = Object.values(status).some(s => s.oldExists && !s.newExists);
  
  return NextResponse.json({
    success: true,
    needsMigration,
    keys: status,
    instructions: needsMigration 
      ? 'POST to this endpoint to run migration'
      : 'All keys already migrated or no old keys found'
  });
}
