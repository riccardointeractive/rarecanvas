# DIGIKO DEX V5 - Public Pair Creation & Unlimited Pools

## Overview

V5 transforms the Digiko DEX from an owner-managed pair system to a fully permissionless DEX where anyone can create trading pairs and provide liquidity from the start.

## Evolution History

| Version | Key Features |
|---------|-------------|
| V1-V2 | Owner-only liquidity, single pairs |
| V3 | Community liquidity with fee distribution |
| V3.1 | Pending liquidity system (two-step deposits) |
| V4 | Single-transaction mint (KLV+KDA together) |
| **V5** | **Public pair creation, unlimited pools, permissionless initialization** |

---

## V5 Changes Summary

### 1. Public Pair Creation
- **Before:** `#[only_owner]` on `createPair`
- **After:** Anyone can call `createPair`
- Track pair creator for potential future governance

### 2. Unlimited Pairs
- **Before:** Hardcoded 50 pair view functions (`getPairInfoPair1`...`getPairInfoPair50`)
- **After:** Generic `getPairInfo(pair_id)` only - no limit
- Frontend queries with `getRegisteredPairIds()` and iterates

### 3. Permissionless Pool Initialization
- **Before:** Owner must add liquidity separately, then call `ownerInitializeLiquidity`
- **After:** First `mint()` caller sets the price ratio (like Uniswap)
- No more `ownerAddLiquidityA/B` required

### 4. Pair Deletion
- **New:** `deletePair(pair_id)` endpoint
- Only works when both reserves are 0
- Only pair creator or contract owner can delete
- Cleans up all storage for that pair

### 5. Owner Share Attribution
- **Before:** Owner must call special functions to get `owner_shares`
- **After:** Owner can optionally mark their liquidity for special fee treatment
- Or: Owner liquidity tracked by address, not by special storage

---

## New Endpoints

### `createPair` (Now Public)
```rust
#[endpoint(createPair)]
fn create_pair(
    &self,
    token_a: TokenIdentifier,
    token_b: TokenIdentifier,
    token_a_is_klv: bool,
    token_b_is_klv: bool,
    fee_percent: u64,
) -> u64
```
- Validates tokens are different
- Validates fee is 1-10%
- Validates not both tokens are KLV
- Creates pair with empty reserves
- Stores `pair_creator(pair_id) = caller`
- Returns `pair_id`

### `deletePair` (New)
```rust
#[endpoint(deletePair)]
fn delete_pair(&self, pair_id: u64)
```
- Requires: `reserve_a == 0 && reserve_b == 0`
- Requires: caller is pair creator OR contract owner
- Clears all storage for the pair
- Removes from `registered_pair_ids`

### `setInitialPrice` (Optional - Alternative to auto-detection)
```rust
#[endpoint(setInitialPrice)]
fn set_initial_price(&self, pair_id: u64, price_ratio_a_to_b: u64)
```
- Only works when both reserves are 0
- Only callable by pair creator
- Sets a "target ratio" for the first LP
- Alternative: Just let first `mint()` set the ratio naturally

---

## Modified `mint()` Behavior

```rust
#[endpoint(mint)]
#[payable("*")]
fn mint(&self, pair_id: u64, min_lp_shares: BigUint) -> BigUint
```

### When Pool is Empty (New Behavior)
```rust
if reserve_a == 0 && reserve_b == 0 {
    // First LP sets the ratio
    // Shares = sqrt(amount_a * amount_b) - MINIMUM_LIQUIDITY
    let product = &amount_a * &amount_b;
    let sqrt_shares = product.sqrt();
    require!(sqrt_shares > MINIMUM_LIQUIDITY, "Initial liquidity too small");
    new_shares = sqrt_shares - MINIMUM_LIQUIDITY;
    
    // No refunds on first mint - user decides the ratio
    used_a = amount_a;
    used_b = amount_b;
}
```

### When Pool Has Liquidity (Existing Behavior)
```rust
else {
    // Match to pool ratio, refund excess
    // (Existing V4 logic)
}
```

---

## Removed Components

### Removed Endpoints
```rust
// These owner-specific functions are REMOVED:
#[only_owner] fn owner_add_liquidity_a()
#[only_owner] fn owner_add_liquidity_a_klv()
#[only_owner] fn owner_add_liquidity_b()
#[only_owner] fn owner_add_liquidity_b_klv()
#[only_owner] fn owner_initialize_liquidity()
#[only_owner] fn owner_recalculate_shares()
```

### Removed View Functions
```rust
// All hardcoded pair views REMOVED:
fn get_pair_info_pair_1() -> ...  // REMOVED
fn get_pair_info_pair_2() -> ...  // REMOVED
// ... through pair 50
fn get_pair_info_pair_50() -> ... // REMOVED
```

### Keep These Owner Functions
```rust
// Keep for migration - owner needs to withdraw existing owner_shares
#[only_owner] fn owner_remove_liquidity()  // KEEP - for V4→V5 migration
#[only_owner] fn owner_claim_fees()        // KEEP - claim platform fees
#[only_owner] fn set_pair_active()         // KEEP - admin control
#[only_owner] fn set_pair_fee()            // KEEP - admin control
```

---

## New Storage

```rust
// Track who created each pair
#[storage_mapper("pair_creator")]
fn pair_creator(&self, pair_id: u64) -> SingleValueMapper<ManagedAddress>;

// Optional: Track if pair allows public liquidity or is "owner-only" pool
// (Not needed for V5 basic implementation)
```

---

## V5 "Idiot-Proofing" - Edge Case Protection

### 🚨 Critical Fixes

#### 1. Pending Deposits Before Deletion (FIXED)
**Problem:** If users have pending deposits and pair creator deletes the pair, funds are lost.
**Solution:** Track `pair_pending_user_count`. Delete requires count = 0.

```rust
// New storage
pair_pending_user_count(pair_id) -> u64

// All deposit functions increment when user goes 0 -> >0
// All withdraw/finalize functions decrement when user goes >0 -> 0
// deletePair() now requires: pending_users == 0
```

#### 2. Wrong is_klv Flag Detection (FIXED)
**Problem:** User creates pair with `token_a_is_klv=false` but token_a is actually "KLV". Pair is permanently broken.
**Solution:** Validate flags at creation time.

```rust
if !token_a_is_klv {
    require!(token_a != "KLV", "token_a is KLV but flag is false");
}
```

#### 3. Slippage Protection on Swaps (ADDED)
**Problem:** No min_output parameter = front-running, sandwich attacks.
**Solution:** All swap functions now require `min_output` parameter.

```rust
// BEFORE (V4)
fn swap_a_to_b(pair_id: u64)

// AFTER (V5)
fn swap_a_to_b(pair_id: u64, min_output: BigUint)
```

### ⚠️ Important Additions

#### 4. Duplicate Pair Detection (VIEW FUNCTION)
**Problem:** Multiple pairs for same token combination = liquidity fragmentation.
**Solution:** `findPairsByTokens()` view to check before creating.

```rust
#[view(findPairsByTokens)]
fn find_pairs_by_tokens(token_a, token_b) -> Vec<pair_id>
// Returns ALL pairs with this token combination (either order)
```

#### 5. Swap Quote Functions (ADDED)
**Problem:** Users can't preview swap output before committing.
**Solution:** View functions for quoting swaps.

```rust
#[view(quoteSwap)]
fn quote_swap(pair_id, input_amount, is_a_to_b) -> (output_after_fee, fee_amount)

#[view(quoteSwapReverse)]
fn quote_swap_reverse(pair_id, desired_output, is_a_to_b) -> (required_input, fee_amount)
```

#### 6. First Liquidity Preview (ADDED)
**Problem:** First LP sets price but can't preview shares/ratio.
**Solution:** View functions for first liquidity.

```rust
#[view(previewFirstLiquidity)]
fn preview_first_liquidity(pair_id, amount_a, amount_b) -> shares

#[view(previewFirstPrice)]
fn preview_first_price(amount_a, amount_b) -> price_ratio
```

#### 7. Safe Deletion Check (ADDED)
**Problem:** Creator doesn't know if pair can be deleted.
**Solution:** `canDeletePair()` view function.

```rust
#[view(canDeletePair)]
fn can_delete_pair(pair_id) -> bool
// True if: reserves=0, no LPs, no pending, no fees
```

### 🟢 Already Protected (Unchanged)

- ✅ Same token pairs blocked
- ✅ Both tokens KLV blocked
- ✅ Fee range 1-10% enforced
- ✅ Minimum liquidity on first deposit (MINIMUM_LIQUIDITY = 1000)
- ✅ Remove more shares than owned blocked
- ✅ Pair active check on all operations

### 🟡 NOT Protected (By Design)

- **Wrong price on first LP:** User sets ratio - UI should warn
- **Duplicate pairs:** Allowed but findPairsByTokens() helps
- **Large amounts:** User responsibility
- **Low liquidity swaps:** quoteSwap() shows impact

The fee distribution model is **simplified** from V3/V4:

- **Total swap fee:** 1% (configurable per pair)
- **ALL LPs:** Earn 0.9% of fees (proportional to shares)
- **Contract owner:** Earns 0.1% platform fee (from all swaps)

### V5 Simplification: No More "Owner Shares"

In V4, owner had special `owner_shares` that earned the full 1% rate. In V5:
- Owner is just another LP
- Everyone uses `mint()` to add liquidity
- Everyone earns the same 0.9% LP rate
- Owner still gets 0.1% platform cut from all fees

### Migration Before Upgrade
Before upgrading to V5 on mainnet:
1. Owner calls `ownerRemoveLiquidity()` to withdraw existing owner_shares
2. After upgrade, owner can add liquidity via `mint()` as a regular LP

---

## ⚠️ Breaking Changes (Frontend Update Required)

### Swap Function Signatures Changed
All swap functions now require `min_output` parameter for slippage protection:

```rust
// V4 (OLD)
swapAtoB(pair_id: u64)
swapBtoA(pair_id: u64)
swapKlvToB(pair_id: u64)
swapKlvToA(pair_id: u64)

// V5 (NEW)
swapAtoB(pair_id: u64, min_output: BigUint)
swapBtoA(pair_id: u64, min_output: BigUint)
swapKlvToB(pair_id: u64, min_output: BigUint)
swapKlvToA(pair_id: u64, min_output: BigUint)
```

**Frontend Must:**
1. Use `quoteSwap()` to get expected output
2. Calculate `min_output = expected * (1 - slippage_tolerance)` (e.g., 0.5% slippage)
3. Pass `min_output` to swap functions

### New View Functions Available
```rust
quoteSwap(pair_id, input_amount, is_a_to_b) -> (output, fee)
quoteSwapReverse(pair_id, desired_output, is_a_to_b) -> (required_input, fee)
findPairsByTokens(token_a, token_b) -> [pair_ids]
canDeletePair(pair_id) -> bool
getPendingUserCount(pair_id) -> u64
previewFirstLiquidity(pair_id, amount_a, amount_b) -> shares
previewFirstPrice(amount_a, amount_b) -> price_ratio
```

---

## Migration Strategy

### Option A: Contract Upgrade (Recommended)
1. Upgrade existing contract with V5 code
2. Existing pairs keep working
3. Owner shares remain as-is
4. New pairs get new behavior

### Option B: New Contract Deployment
1. Deploy fresh V5 contract
2. Migrate liquidity from V4
3. Frontend switches to new contract

### Migration Notes
- Existing pairs don't have `pair_creator` set - default to contract owner
- Existing hardcoded views can be kept for backward compatibility (optional)
- V4's `mint()` already handles empty pools - just need to remove owner requirement

---

## Frontend Changes

### Create Pair UI
New screen/modal for users to create pairs:
```
┌─────────────────────────────────────────────────────────────┐
│  ➕ Create Trading Pair                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Token A                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Select token ▾]  or  [Enter Asset ID]              │   │
│  │ ☐ This is native KLV                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Token B                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Select token ▾]  or  [Enter Asset ID]              │   │
│  │ ☐ This is native KLV                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Swap Fee: [1%] ←────────────────────→ [10%]               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Create Pair                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ After creating, add initial liquidity to set the price │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pool List View
- Show all pairs with their reserves
- Filter: "My Pairs" (pairs I created)
- Show "Created by: [address]" in pair details

### First Liquidity Warning
When adding to empty pool:
```
⚠️ This pool has no liquidity yet.
   The amounts you provide will set the initial price:
   1 TOKEN_A = X TOKEN_B
   
   Make sure this matches the desired market price!
```

---

## Security Considerations

### Spam Prevention
- Consider minimum initial liquidity requirement
- Consider fee for pair creation (optional)
- Rate limit on pair creation (optional)

### Pair Deletion Safety
- Only when liquidity is 0 (no funds at risk)
- Only by creator or owner
- Cannot delete active pairs with pending LPs

### Price Manipulation on Empty Pools
- First LP sets price - this is intentional
- Warning in UI about setting correct price
- Arbitrageurs will correct mispriced pools

---

## Testing Checklist

### Unit Tests
- [ ] Create pair as non-owner
- [ ] Create pair with various token combinations
- [ ] Mint to empty pool (first LP)
- [ ] Mint to pool with liquidity
- [ ] Delete empty pair
- [ ] Cannot delete pair with liquidity
- [ ] Fee distribution unchanged
- [ ] Owner shares still work for existing pairs

### Integration Tests
- [ ] Full flow: create → mint (empty) → swap → remove
- [ ] Multiple pairs with same tokens (if allowed)
- [ ] Pair creator vs contract owner permissions

---

## Summary

V5 transforms Digiko DEX into a fully permissionless platform:
- Anyone can create trading pairs
- No limit on number of pairs
- First LP sets the price naturally
- Empty pairs can be cleaned up
- Fee distribution remains fair

This enables organic growth of the DEX ecosystem while maintaining the security and fee structure that benefits both the platform and community LPs.
