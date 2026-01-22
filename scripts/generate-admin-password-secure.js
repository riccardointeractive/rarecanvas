#!/usr/bin/env node

/**
 * SECURE Admin Password Hash Generator
 * 
 * This generates a PBKDF2 hash (much more secure than SHA-256)
 * 
 * Usage:
 *   node scripts/generate-admin-password-secure.js
 *   node scripts/generate-admin-password-secure.js "YourSecurePassword123!"
 * 
 * The output should be added to your .env.local file:
 *   ADMIN_PASSWORD_HASH=<generated_hash>
 *   ADMIN_PASSWORD_SALT=<generated_salt>
 */

const crypto = require('crypto');
const readline = require('readline');

// PBKDF2 configuration
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

function generateHash(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
}

function validatePassword(password) {
  const errors = [];
  const warnings = [];
  
  if (password.length < 12) {
    errors.push('❌ Password must be at least 12 characters');
  }
  if (password.length < 16) {
    warnings.push('⚠️  Consider using 16+ characters for better security');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('❌ Must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('❌ Must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('❌ Must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    warnings.push('⚠️  Consider adding special characters');
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    'password', 'admin', '12345', 'qwerty', 'digiko',
    'letmein', 'welcome', 'monkey', 'dragon'
  ];
  
  const lowerPassword = password.toLowerCase();
  for (const pattern of weakPatterns) {
    if (lowerPassword.includes(pattern)) {
      errors.push(`❌ Password contains weak pattern: "${pattern}"`);
    }
  }
  
  return { errors, warnings };
}

function calculateStrength(password) {
  let score = 0;
  
  // Length scoring
  if (password.length >= 12) score += 2;
  if (password.length >= 16) score += 2;
  if (password.length >= 20) score += 2;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;
  
  // Bonus for mixed case adjacent
  if (/[a-z][A-Z]|[A-Z][a-z]/.test(password)) score += 1;
  
  // No repeating characters
  if (!/(.)\1{2,}/.test(password)) score += 1;
  
  if (score <= 4) return { level: 'WEAK', emoji: '🔴' };
  if (score <= 7) return { level: 'MEDIUM', emoji: '🟡' };
  if (score <= 10) return { level: 'STRONG', emoji: '🟢' };
  return { level: 'EXCELLENT', emoji: '🔵' };
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter your admin password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log('\n🔐 DIGIKO SECURE Admin Password Generator\n');
  console.log('═══════════════════════════════════════════\n');
  console.log('This generates a PBKDF2 hash (100,000 iterations)');
  console.log('which is MUCH more secure than plain SHA-256.\n');
  
  // Get password from command line or prompt
  let password = process.argv[2];
  
  if (!password) {
    password = await promptPassword();
  }
  
  if (!password) {
    console.error('❌ No password provided!\n');
    process.exit(1);
  }
  
  console.log('\n');
  
  // Validate password
  const { errors, warnings } = validatePassword(password);
  const strength = calculateStrength(password);
  
  console.log('📊 Password Analysis:');
  console.log('─────────────────────');
  console.log(`Length: ${password.length} characters`);
  console.log(`Strength: ${strength.emoji} ${strength.level}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix):');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings (recommended):');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('🚫 Password does not meet security requirements.');
    console.log('   Please choose a stronger password.\n');
    process.exit(1);
  }
  
  // Generate salt and hash
  const salt = generateSalt();
  const hash = generateHash(password, salt);
  
  console.log('✅ Secure Credentials Generated!');
  console.log('═══════════════════════════════════════════\n');
  
  console.log('Add these to your .env.local file:\n');
  console.log('─────────────────────────────────────────────');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`ADMIN_PASSWORD_SALT=${salt}`);
  console.log('─────────────────────────────────────────────\n');
  
  console.log('📝 Setup Steps:');
  console.log('───────────────');
  console.log('1. Copy both lines above');
  console.log('2. Open (or create) .env.local in project root');
  console.log('3. Paste the lines and save');
  console.log('4. Restart your dev server: npm run dev');
  console.log('5. For production: Add to Vercel Environment Variables\n');
  
  console.log('🔒 Security Notes:');
  console.log('──────────────────');
  console.log('• NEVER commit .env.local to git');
  console.log('• Store your password in a password manager');
  console.log('• The hash uses PBKDF2 with 100,000 iterations');
  console.log('• Each password gets a unique random salt');
  console.log('• The password is NOT stored anywhere in code\n');
  
  console.log('💡 Tip: Run this script again if you need to change the password.\n');
}

main().catch(console.error);
