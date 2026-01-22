# DIGIKO DEX V3 - Community Liquidity Pool

## Overview

V3 transforms the Digiko DEX from a single-owner liquidity model to a community liquidity pool where anyone can become a Liquidity Provider (LP) and earn swap fees.

## Current State (V2)

- Only owner can add/remove liquidity
- Owner receives 100% of the 1% swap fee
- No LP tracking or share system

## Target State (V3)

- **Anyone can add liquidity** and become an LP
- **Fee distribution:**
  - Owner's liquidity: 1% fee reward (full rate)
  - Other LP's liquidity: 0.9% to LP, 0.1% to owner
- **LP Management Panel** for users to:
  - View their liquidity positions
  - Add more liquidity
  - Remove liquidity at any time
  - Claim earned fees

---

## Fee Distribution Model

### Example Calculation

Pool state:
- Total reserves: 1000 DGKO / 100 KLV
- Owner contributed: 300 DGKO / 30 KLV (30% ownership)
- LP1 contributed: 400 DGKO / 40 KLV (40% ownership)
- LP2 contributed: 300 DGKO / 30 KLV (30% ownership)

A swap generates **10 DGKO** in fees (1% of output):

**Distribution:**
1. Owner's share of fees from their liquidity: 10 × 30% × 1.0 = **3.0 DGKO**
2. Owner's cut from LP fees (10%): 10 × 70% × 0.1 = **0.7 DGKO**
3. LP1's share: 10 × 70% × 0.9 × (40/70) = **3.6 DGKO**
4. LP2's share: 10 × 70% × 0.9 × (30/70) = **2.7 DGKO**

**Total:** 3.0 + 0.7 + 3.6 + 2.7 = 10.0 DGKO ✓

### Formula

For a fee amount `F`:
- Let `owner_pct = owner_shares / total_shares`
- Let `lp_pct = lp_shares / total_shares` (where `lp_shares = total_shares - owner_shares`)

**Owner receives:**
```
owner_fee = F × owner_pct × 1.0 + F × lp_pct × 0.1
          = F × (owner_pct + 0.1 × lp_pct)
          = F × (owner_pct + 0.1 × (1 - owner_pct))
          = F × (0.9 × owner_pct + 0.1)
```

**LPs collectively receive:**
```
lp_fee = F × lp_pct × 0.9
       = F × (1 - owner_pct) × 0.9
```

**Each LP i with `shares_i` receives:**
```
lp_i_fee = lp_fee × (shares_i / lp_shares)
         = F × (1 - owner_pct) × 0.9 × (shares_i / lp_shares)
```

---

## Share System Design

### Adding Liquidity

**First LP (empty pool):**
```
shares = sqrt(amount_a × amount_b)
```
This is the standard AMM approach (geometric mean).

**Subsequent LPs:**
```
share_price = total_reserves_value / total_shares
new_shares = added_value / share_price
           = added_value × total_shares / total_reserves_value
```

For proportional deposits (same ratio as pool):
```
new_shares = min(
  amount_a × total_shares / reserve_a,
  amount_b × total_shares / reserve_b
)
```

### Removing Liquidity

```
amount_a = shares × reserve_a / total_shares
amount_b = shares × reserve_b / total_shares
```

LP receives proportional tokens based on their share of the pool.

### Fee Tracking (Index-based)

Instead of tracking fees per user explicitly, use a **cumulative fee index**:

```
fee_per_share_a += fee_to_lps_a / total_lp_shares
fee_per_share_b += fee_to_lps_b / total_lp_shares
```

When LP joins, record their `entry_fee_index`:
```
lp_entry_index_a[address] = fee_per_share_a
lp_entry_index_b[address] = fee_per_share_b
```

When LP claims:
```
earned_a = (fee_per_share_a - lp_entry_index_a) × lp_shares
earned_b = (fee_per_share_b - lp_entry_index_b) × lp_shares
lp_entry_index_a = fee_per_share_a  // Reset
lp_entry_index_b = fee_per_share_b
```

---

## Smart Contract Storage

### New Storage Mappers

```rust
// === Share Tracking ===
#[storage_mapper("owner_shares")]
fn owner_shares(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("lp_shares")]
fn lp_shares(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[storage_mapper("total_lp_shares")]
fn total_lp_shares(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("lp_list")]
fn lp_list(&self, pair_id: u64) -> UnorderedSetMapper<ManagedAddress>;

// === Fee Tracking ===
#[storage_mapper("owner_unclaimed_fees_a")]
fn owner_unclaimed_fees_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("owner_unclaimed_fees_b")]
fn owner_unclaimed_fees_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("fee_per_share_a")]
fn fee_per_share_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("fee_per_share_b")]
fn fee_per_share_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

#[storage_mapper("lp_entry_index_a")]
fn lp_entry_index_a(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[storage_mapper("lp_entry_index_b")]
fn lp_entry_index_b(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
```

### New Endpoints

```rust
// === Public Liquidity Functions ===
#[endpoint(addLiquidity)]
#[payable("*")]
fn add_liquidity(&self, pair_id: u64, min_shares: BigUint);

#[endpoint(addLiquidityKlv)]
#[payable("KLV")]
fn add_liquidity_klv(&self, pair_id: u64, min_shares: BigUint);

#[endpoint(removeLiquidity)]
fn remove_liquidity(&self, pair_id: u64, shares: BigUint, min_a: BigUint, min_b: BigUint);

#[endpoint(claimLpFees)]
fn claim_lp_fees(&self, pair_id: u64);

// === View Functions ===
#[view(getLpPosition)]
fn get_lp_position(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue4<BigUint, BigUint, BigUint, BigUint>;
// Returns: (shares, pending_fees_a, pending_fees_b, share_of_pool_pct)

#[view(getLpList)]
fn get_lp_list(&self, pair_id: u64) -> MultiValueEncoded<ManagedAddress>;

#[view(getTotalShares)]
fn get_total_shares(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint>;
// Returns: (owner_shares, total_lp_shares)
```

---

## Modified Swap Logic

The swap functions need to distribute fees according to the new model:

```rust
fn distribute_fees(&self, pair_id: u64, fee_amount: &BigUint, is_token_a: bool) {
    let owner_shares = self.owner_shares(pair_id).get();
    let total_lp_shares = self.total_lp_shares(pair_id).get();
    let total_shares = &owner_shares + &total_lp_shares;
    
    if total_shares == BigUint::zero() {
        return; // No one to distribute to
    }
    
    // Calculate owner's portion
    // owner_fee = F × (0.9 × owner_pct + 0.1)
    // Using integer math with PRECISION_FACTOR for accuracy
    let precision = BigUint::from(1_000_000u64);
    let owner_pct = &owner_shares * &precision / &total_shares;
    let owner_portion = fee_amount * (&owner_pct * 9u64 / 10u64 + &precision / 10u64) / &precision;
    
    // LP portion = fee - owner_portion
    let lp_portion = fee_amount - &owner_portion;
    
    // Add to owner's unclaimed fees
    if is_token_a {
        self.owner_unclaimed_fees_a(pair_id).update(|f| *f += &owner_portion);
        
        // Update fee_per_share for LPs
        if total_lp_shares > BigUint::zero() {
            let fee_per_share_increase = &lp_portion * &precision / &total_lp_shares;
            self.fee_per_share_a(pair_id).update(|f| *f += fee_per_share_increase);
        }
    } else {
        self.owner_unclaimed_fees_b(pair_id).update(|f| *f += &owner_portion);
        
        if total_lp_shares > BigUint::zero() {
            let fee_per_share_increase = &lp_portion * &precision / &total_lp_shares;
            self.fee_per_share_b(pair_id).update(|f| *f += fee_per_share_increase);
        }
    }
}
```

---

## Frontend Components

### LP Management Panel (Swap Page)

New section on the swap page:

```
┌─────────────────────────────────────────────────────────────┐
│  💧 Liquidity Provider                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Position                                              │
│  ┌─────────────────────┬─────────────────────┐             │
│  │ DGKO Provided       │ KLV Provided        │             │
│  │ 1,234.5678         │ 456.789012          │             │
│  └─────────────────────┴─────────────────────┘             │
│                                                             │
│  Pool Share: 2.45%                                          │
│                                                             │
│  Unclaimed Fees                                             │
│  ┌─────────────────────┬─────────────────────┐             │
│  │ DGKO               │ KLV                 │             │
│  │ 12.3456            │ 1.2345              │             │
│  └─────────────────────┴─────────────────────┘             │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Add Liquidity│ │ Remove       │ │ Claim Fees   │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Add Liquidity Modal

Two-sided liquidity addition:
- User inputs one token amount
- System calculates matching amount for the other token
- Shows expected LP shares
- Shows estimated APR based on recent volume

### Remove Liquidity Modal

- Slider or input for % to remove
- Shows exact token amounts they'll receive
- Warning about price impact if large withdrawal

---

## Migration Strategy

### Phase 1: Deploy V3 Contract
1. Deploy new contract with all V3 features
2. Keep V2 running in parallel initially
3. Test thoroughly on testnet first

### Phase 2: Migrate Liquidity
1. Owner withdraws liquidity from V2
2. Owner adds liquidity to V3 (recorded as owner_shares)
3. Existing fees in V2 claimed

### Phase 3: Enable Public LP
1. Announce community liquidity is open
2. Frontend directs all swaps to V3
3. V2 deprecated but kept read-only

### Phase 4: Sunset V2
1. After all activity moves to V3
2. V2 contract disabled

---

## Security Considerations

### Reentrancy Protection
- All state changes before external calls
- Use checks-effects-interactions pattern

### Integer Overflow
- Use BigUint for all amounts
- Precision factors for percentage calculations

### Front-running Protection
- `min_shares` parameter on add liquidity
- `min_a` and `min_b` on remove liquidity
- Slippage protection on swaps (existing)

### LP Share Manipulation
- First depositor gets shares = sqrt(a×b) to prevent dust attacks
- Minimum liquidity lock on first deposit (burn small amount)

### Fee Calculation Precision
- Use 1e18 or 1e6 precision for fee_per_share
- Round down for user claims (contract keeps dust)

---

## Testing Plan

### Unit Tests
1. Share calculation on deposit
2. Share burning on withdrawal
3. Fee distribution accuracy
4. Multi-LP fee proportions
5. Owner vs LP fee rates

### Integration Tests
1. Full swap cycle with fee distribution
2. Add/remove liquidity sequences
3. Fee claiming flow
4. Edge cases (empty pool, single LP, etc.)

### Mainnet Testing
1. Small-scale test with real tokens
2. Verify fee calculations match expected
3. Test under various pool states

---

## Timeline

- **Week 1:** Smart contract development
- **Week 2:** Frontend LP panel development
- **Week 3:** Testnet deployment and testing
- **Week 4:** Security review and bug fixes
- **Week 5:** Mainnet deployment and migration
- **Week 6:** Public LP launch announcement

---

## Summary

V3 Community Liquidity represents a major milestone for Digiko DEX:
- Transforms from single-owner to community-owned liquidity
- Introduces fair fee distribution model
- Maintains owner incentive (10% of LP fees + full rate on own liquidity)
- Provides professional LP management interface
- Sets foundation for future multi-pair expansion

This upgrade aligns with DeFi best practices while maintaining the unique Digiko fee structure that rewards both the platform and its community.
