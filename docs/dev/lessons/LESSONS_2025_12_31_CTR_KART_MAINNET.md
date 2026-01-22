# CTR Kart Mainnet Launch - Lessons Learned
**Date:** December 31, 2025  
**Session:** CTR Kart V1.6 Platform Fee & Mainnet Launch  
**Milestone:** 🏆 FIRST RACE ON MAINNET - HISTORIC!

---

## 🎯 What We Achieved

1. **Smart Contract V1.6** - Platform fee mechanism with multi-token support
2. **Multi-Token Transactions** - Single SC call sends CTR + KLV
3. **Platform Fee Forwarding** - Contract receives KLV, forwards to owner
4. **Games Navigation** - Added to desktop/mobile menus
5. **Public Games Access** - Removed admin lock
6. **Balance Validation** - Clear user-friendly error messages
7. **Admin Panel Update** - Platform fee configuration in UI

---

## 🔥 Critical Discovery: Multi-Contract Limitation

### The Problem
Klever blockchain does NOT support mixing smart contract calls with other transaction types:

```typescript
// ❌ THIS FAILS - "Smart contract transactions do not support multi contract"
buildTransaction([
  { type: 63, payload: scPayload },      // Smart contract
  { type: 0, payload: transferPayload }, // KLV transfer
], ...)
```

### The Solution
Send BOTH tokens to the contract in a single `callValue` object:

```typescript
// ✅ THIS WORKS - Multi-token to SAME address
const callValue = {
  [entryToken.assetId]: rawAmount,  // CTR to contract
  'KLV': PLATFORM_FEE_KLV,          // KLV to contract
};

const scPayload = {
  scType: 0,
  address: config.address,
  callValue,  // Contract receives both tokens
};
```

### Contract Must Handle Both
```rust
// Get KDA tokens (entry token)
let kda_payments = self.call_value().all_kda_transfers();

// Get KLV (platform fee)  
let klv_payment = self.call_value().klv_value().clone_value();

// Forward KLV to platform owner
self.send().direct_klv(&platform_address, &klv_payment);
```

---

## 📋 Contract V1.6 Architecture

### New Storage
```rust
#[storage_mapper("platform_fee")]
fn platform_fee(&self) -> SingleValueMapper<u64>;

#[storage_mapper("platform_fee_address")]
fn platform_fee_address(&self) -> SingleValueMapper<ManagedAddress>;
```

### New Endpoints
```rust
#[endpoint(setPlatformFee)]
fn set_platform_fee(&self, fee: u64);

#[endpoint(setPlatformFeeAddress)]
fn set_platform_fee_address(&self, address: ManagedAddress);

#[view(getPlatformFeeConfig)]
fn get_platform_fee_config(&self) -> MultiValue2<u64, ManagedAddress>;
```

### payEntry Flow
1. Frontend sends `callValue: { "CTR-2N54": 500M, "KLV": 10M }`
2. Contract extracts CTR via `all_kda_transfers()`
3. Contract extracts KLV via `klv_value()`
4. Contract validates CTR >= race cost
5. Contract validates KLV >= platform fee
6. Contract forwards KLV to platform address
7. Contract stores CTR in vault
8. Contract returns race ID

---

## 🛡️ Balance Validation Pattern

Before sending transaction, validate user has enough:

```typescript
// Fetch account info
const accountRes = await fetch(`${apiBase}/v1.0/accounts/${address}`);
const account = accountData?.data?.account;

// Check KLV balance
const klvBalance = (account?.balance || 0) / 1_000_000;
if (klvBalance < totalKlvNeeded) {
  setError(`Insufficient KLV. You need at least ${totalKlvNeeded} KLV...`);
  return null;
}

// Check entry token balance
const assets = account?.assets || {};
const entryTokenBalance = (assets[entryToken.assetId]?.balance || 0) / precision;
if (entryTokenBalance < entryCost) {
  setError(`Insufficient ${entryToken.symbol}. You need ${entryCost}...`);
  return null;
}
```

**User sees:**
> "Insufficient CTR. You need 500 CTR to enter the race. You have 123.45 CTR."

---

## 🔧 Build Command Reminder

**ALWAYS use meta for smart contracts:**
```bash
cd contract-ctr-kart/meta
cargo run build
```

Output: `contract-ctr-kart/output/ctr-kart.wasm`

**NOT:**
```bash
# ❌ Wrong - doesn't produce deployable wasm
cargo build --release --target wasm32-unknown-unknown
```

---

## 📦 Files Modified in This Session

### Contract
- `contract-ctr-kart/src/lib.rs` - V1.6 with platform fee

### Frontend
- `src/app/games/ctr-kart/hooks/useKartContract.ts` - Multi-token callValue + balance validation
- `src/app/games/ctr-kart/page.tsx` - Buy CTR banner
- `src/app/games/page.tsx` - Removed lottery, LIVE badge
- `src/app/games/layout.tsx` - Public access (no admin lock)
- `src/app/admin/games/ctr-kart/page.tsx` - Platform fee settings UI
- `src/components/NavigationLinks.tsx` - Games link
- `src/components/MobileMenu.tsx` - Games link + icon

### Config
- `src/config/app.ts` - Version 1.18.0

---

## 🏆 Historic Transaction

**First race on mainnet:**
```
TX: b5eb761b305e52b8cd5f0707a03b2edd5e816d0b7e1ff1bf2ce719a6afc677a7
Block: 27562353
Player: klv1txvuxn8du0fwmsrdsthxtvxkcrwpnk32mj8x58trx9vd3fh9629qq4nytm
Race ID: 1
```

**Flow confirmed:**
1. ✅ CTR-2N54: 500,000,000 → Contract
2. ✅ KLV: 10,000,000 → Contract → Owner wallet
3. ✅ Race ID 1 returned in logs

---

## 🧠 Key Takeaways

1. **Multi-token to single address** works perfectly
2. **Multi-contract (SC + Transfer)** does NOT work on Klever
3. **Contract must forward** platform fee, can't be separate TX
4. **Balance validation** prevents confusing blockchain errors
5. **Admin UI** should expose all contract settings
6. **Build with meta** not cargo directly

---

## 📎 Related Files

- Contract: `contract-ctr-kart/src/lib.rs`
- Hook: `src/app/games/ctr-kart/hooks/useKartContract.ts`
- Admin: `src/app/admin/games/ctr-kart/page.tsx`
- Types: `src/app/games/ctr-kart/types/kart.types.ts`
- Config: `src/app/games/ctr-kart/config/kart.config.tsx`

---

## 🎮 Game Parameters (Mainnet)

| Parameter | Value |
|-----------|-------|
| Entry Token | CTR-2N54 |
| Entry Cost | 500 CTR |
| Platform Fee | 10 KLV |
| Win Reward | 25 KLV |
| Day Duration | 86400s (24h) |
| Timezone | UTC+1 |
| Max Races/Day | 50 |
| Leaderboard Size | 5 |
| Prize Distribution | 50%, 25%, 15%, 7%, 3% |

---

**Status:** ✅ COMPLETE - CTR KART LIVE ON MAINNET
