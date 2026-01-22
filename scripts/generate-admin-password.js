#!/usr/bin/env node

/**
 * Admin Password Hash Generator
 * 
 * This script generates a SHA-256 hash for your admin password.
 * Use this hash in /src/app/admin/page.tsx
 * 
 * Usage:
 *   node generate-admin-password.js
 *   node generate-admin-password.js "YourPassword123!"
 */

const crypto = require('crypto');
const readline = require('readline');

function generateHash(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash;
}

function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('❌ Password must be at least 8 characters (12+ recommended)');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('⚠️  Consider adding uppercase letters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('⚠️  Consider adding lowercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('⚠️  Consider adding numbers');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('⚠️  Consider adding special characters');
  }
  
  return errors;
}

function calculateStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
  
  if (strength <= 3) return '🔴 WEAK';
  if (strength <= 5) return '🟡 MEDIUM';
  return '🟢 STRONG';
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
  console.log('\n🔐 Digiko Admin Password Hash Generator\n');
  console.log('═══════════════════════════════════════\n');
  
  // Get password from command line or prompt
  let password = process.argv[2];
  
  if (!password) {
    password = await promptPassword();
  }
  
  if (!password) {
    console.error('❌ No password provided!\n');
    process.exit(1);
  }
  
  // Validate password
  const errors = validatePassword(password);
  const strength = calculateStrength(password);
  
  console.log('\n📊 Password Analysis:');
  console.log('─────────────────────');
  console.log(`Length: ${password.length} characters`);
  console.log(`Strength: ${strength}\n`);
  
  if (errors.length > 0) {
    console.log('⚠️  Recommendations:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  // Generate hash
  const hash = generateHash(password);
  
  console.log('✅ Generated Hash:');
  console.log('─────────────────────');
  console.log(`\n${hash}\n`);
  
  console.log('📝 Next Steps:');
  console.log('─────────────────────');
  console.log('1. Copy the hash above');
  console.log('2. Open: src/app/admin/page.tsx');
  console.log('3. Find: const ADMIN_PASSWORD_HASH = "..."');
  console.log('4. Replace with your new hash');
  console.log('5. Save and restart your dev server\n');
  
  console.log('💡 Tip: Keep your password in a password manager!\n');
}

main().catch(console.error);
