# Klever Smart Contracts - Critical Reference for Digiko

**Source:** Official Klever Smart Contract Documentation (2,537 lines)  
**Saved:** `docs/klever-smart-contracts-reference.txt`  
**Date:** December 1, 2025

---

## 🔥 **CRITICAL DISCOVERY: Why Our Contract Bug Happened**

### The Payment Handling Mystery - SOLVED!

**From the docs (Line 224):**
> "On the Klever network, it is not possible to simultaneously send KLV and any KDA token."

**Call Value API Functions:**

```rust
// ❌ What we were using (WRONG for KLV!)
self.call_value().single_kda()
// Returns single KDA payment
// FAILS for native KLV transfers!

// ✅ What we should use for KLV
self.call_value().klv_value()
// Returns the amount of KLV transferred
// Returns 0 for KDA transfers

// ✅ Or use this to accept BOTH
self.call_value().klv_or_single_kda()
// Accepts EITHER KLV or any single KDA token
```

**This explains our Nov 30 - Dec 1 debugging marathon!**
- Our swap contract used `single_kda()` for all payments
- Works fine for DGKO → KLV swaps (DGKO is KDA)
- FAILS for KLV → DGKO swaps (KLV is native, not KDA!)
- Fix: Use `klv_value()` for KLV payments

---

## 📚 **Table of Contents**

1. [Payment Handling (KLV vs KDA)](#payment-handling)
2. [Call Value API Reference](#call-value-api)
3. [Contract Endpoints](#contract-endpoints)
4. [Querying Contracts](#querying-contracts)
5. [Storage Mappers](#storage-mappers)
6. [Crypto API](#crypto-api)
7. [Common Patterns](#common-patterns)

---

## 💰 **Payment Handling (KLV vs KDA)**

### Receiving Payments in Endpoints

**For KLV only:**
```rust
#[endpoint]
#[payable("KLV")]
fn accept_klv_only(&self) {
    let klv_amount = self.call_value().klv_value();
    // ... handle KLV payment
}
```

**For any KDA token:**
```rust
#[endpoint]
#[payable("*")]
fn accept_any_kda(&self) {
    let payment = self.call_value().single_kda();
    // Returns: KdaTokenPayment {
    //   token_identifier: TokenIdentifier,
    //   token_nonce: u64,
    //   amount: BigUint
    // }
}
```

**For KLV OR KDA (Recommended for flexibility):**
```rust
#[endpoint]
#[payable("*")]
fn accept_klv_or_kda(&self) {
    let payment = self.call_value().klv_or_single_kda();
    // Returns: KlvOrKdaTokenPayment
    // Can be either KLV or any KDA token
}
```

**For specific token:**
```rust
#[endpoint]
#[payable("DGKO")]  // Hardcoded token ID
fn accept_dgko_only(&self) {
    let payment = self.call_value().single_kda();
    require!(
        payment.token_identifier == TokenIdentifier::from("DGKO"),
        "Only DGKO accepted"
    );
}
```

---

## 🔧 **Call Value API Reference**

All functions accessible via `self.call_value()`:

### `klv_value()`
```rust
klv_value() -> BigUint
```
- Returns amount of KLV transferred
- Returns 0 for KDA transfers
- **Use for:** Native KLV payments only

### `single_kda()`
```rust
single_kda() -> KdaTokenPayment
```
- Returns single KDA token payment
- **Errors** if no transfer or multi-transfer
- **Errors** for native KLV (not KDA!)
- **Use for:** Single KDA token payments

### `klv_or_single_kda()`
```rust
klv_or_single_kda() -> KlvOrKdaTokenPayment
```
- Accepts KLV OR any single KDA token
- **Use for:** Flexible payment acceptance
- **Best practice** for multi-token support

### `all_kda_transfers()`
```rust
all_kda_transfers() -> ManagedVec<KdaTokenPayment>
```
- Returns ALL KDA transfers
- **Use for:** Multi-token payments

### `multi_kda<N>()`
```rust
multi_kda<const N: usize>() -> [KdaTokenPayment; N]
```
- Returns exactly N KDA transfers
- **Errors** if count differs from N
- **Use for:** Fixed multi-token payments

**Example:**
```rust
let [payment_a, payment_b, payment_c] = self.call_value().multi_kda();
```

---

## 🎯 **Contract Endpoints**

### Endpoint Types

**`#[init]` - Constructor:**
```rust
#[init]
fn constructor(
    &self,
    param1: u32,
    param2: BigUint
) {
    // Called once during deployment
    // Called again during upgrades
}
```

**`#[endpoint]` - Public method:**
```rust
#[endpoint]
fn public_method(&self) {
    // Callable externally
}

#[endpoint(customName)]
fn snake_case_method(&self) {
    // Callable as "customName"
}
```

**`#[view]` - Read-only method:**
```rust
#[view(getData)]
fn get_data(&self) -> u32 {
    // Read-only (convention, not enforced)
    // Queryable from frontend
    0
}
```

**Private methods:**
```rust
fn private_helper(&self, value: &BigUint) {
    // Not callable externally
    // No annotation needed
}
```

---

## 🔍 **Querying Contracts**

### View Functions (Read-Only)

**Define in contract:**
```rust
#[view(getUserStake)]
fn get_user_stake(&self, user: ManagedAddress) -> BigUint {
    self.stakes(&user).get()
}

#[view(getTotalStaked)]
fn get_total_staked(&self) -> BigUint {
    self.total_staked().get()
}

#[view(getRewardRate)]
fn get_reward_rate(&self) -> u64 {
    self.reward_rate().get()
}
```

**Query from frontend:**

**Option 1: Using Proxy API**
```typescript
// POST https://api.mainnet.klever.org/v1.0/sc/query
{
  "scAddress": "klv1qqq...contract",
  "funcName": "getUserStake",
  "arguments": [
    // User address encoded as bytes
  ]
}
```

**Option 2: Using Node Server**
```typescript
// POST https://node.mainnet.klever.finance/vm/query
{
  "scAddress": "klv1qqq...contract",
  "funcName": "getTotalStaked",
  "args": []
}
```

---

## 💾 **Storage Mappers**

### Common Storage Patterns

**Single Value:**
```rust
#[view(getSum)]
#[storage_mapper("sum")]
fn sum(&self) -> SingleValueMapper<BigUint>;

// Usage:
self.sum().set(value);
let value = self.sum().get();
```

**Map (Address → Value):**
```rust
#[storage_mapper("stakes")]
fn stakes(&self) -> MapMapper<ManagedAddress, BigUint>;

// Usage:
self.stakes(&user).set(amount);
let amount = self.stakes(&user).get();
```

**Set:**
```rust
#[storage_mapper("stakers")]
fn stakers(&self) -> UnorderedSetMapper<ManagedAddress>;

// Usage:
self.stakers().insert(user);
let contains = self.stakers().contains(&user);
```

---

## 🔐 **Crypto API**

Accessible via `self.crypto()`:

**Hashing:**
```rust
// SHA256
let hash = self.crypto().sha256(&data);

// Keccak256
let hash = self.crypto().keccak256(&data);

// RIPEMD160
let hash = self.crypto().ripemd160(&data);
```

**Signature Verification:**
```rust
// Ed25519
let valid = self.crypto().verify_ed25519_legacy_managed(
    &key, 
    &message, 
    &signature
);

// Secp256k1
let valid = self.crypto().verify_secp256k1(
    &key, 
    &message, 
    &signature
);
```

---

## 🎪 **Common Patterns for Digiko**

### Pattern 1: Staking with KDA Token

```rust
#[endpoint]
#[payable("*")]
fn stake(&self) {
    let payment = self.call_value().single_kda();
    let caller = self.blockchain().get_caller();
    
    // Validate token
    require!(
        payment.token_identifier == TokenIdentifier::from("DGKO"),
        "Only DGKO can be staked"
    );
    
    // Update stake
    self.stakes(&caller).update(|stake| {
        *stake += payment.amount.clone();
    });
    
    // Update total
    self.total_staked().update(|total| {
        *total += payment.amount;
    });
}
```

### Pattern 2: Swap (KLV → KDA or KDA → KLV)

```rust
#[endpoint]
#[payable("*")]
fn swap(&self) {
    let payment = self.call_value().klv_or_single_kda();
    let caller = self.blockchain().get_caller();
    
    match payment.token_identifier {
        // Native KLV payment
        KlvOrKdaTokenIdentifier::klv() => {
            let klv_amount = payment.amount;
            // Calculate DGKO to send
            let dgko_amount = self.calculate_swap_output(&klv_amount);
            // Send DGKO to user
            self.send().direct_kda(
                &caller,
                &TokenIdentifier::from("DGKO"),
                0,
                &dgko_amount
            );
        },
        // KDA token payment (DGKO)
        KlvOrKdaTokenIdentifier::kda(token_id) => {
            require!(token_id == TokenIdentifier::from("DGKO"), "Only DGKO");
            let dgko_amount = payment.amount;
            // Calculate KLV to send
            let klv_amount = self.calculate_swap_output(&dgko_amount);
            // Send KLV to user
            self.send().direct_klv(&caller, &klv_amount);
        }
    }
}
```

### Pattern 3: Query User Data

```rust
#[view(getUserInfo)]
fn get_user_info(&self, user: ManagedAddress) -> MultiValue3<BigUint, BigUint, u64> {
    let stake = self.stakes(&user).get();
    let rewards = self.calculate_rewards(&user);
    let last_claim = self.last_claim(&user).get();
    
    (stake, rewards, last_claim).into()
}
```

---

## 🚨 **Critical Learnings**

### 1. KLV vs KDA Payment Handling

**Always remember:**
- Native KLV ≠ KDA token
- Use `klv_value()` for KLV
- Use `single_kda()` for KDA tokens
- Use `klv_or_single_kda()` for both

### 2. Payment Validation

**Check BEFORE processing:**
```rust
let payment = self.call_value().single_kda();

require!(
    payment.token_identifier == expected_token,
    "Wrong token"
);

require!(
    payment.amount >= minimum_amount,
    "Amount too low"
);
```

### 3. Query Functions

**Make data accessible:**
```rust
// ✅ Good - public query
#[view(getUserStake)]
fn get_user_stake(&self, user: ManagedAddress) -> BigUint {
    self.stakes(&user).get()
}

// ❌ Bad - no way to query
fn get_user_stake(&self, user: ManagedAddress) -> BigUint {
    self.stakes(&user).get()
}
```

---

## 🎯 **Digiko Contracts Review**

### DGKO Staking Contract

**Current implementation:**
```rust
// Needs #[view] functions to be queryable!
#[view(getUserStake)]
fn get_user_stake(&self, user: ManagedAddress) -> BigUint;

#[view(getTotalStaked)]
fn get_total_staked(&self) -> BigUint;

#[view(getRewardRate)]
fn get_reward_rate(&self) -> u64;
```

**Action items:**
1. Verify view functions exist
2. Test querying via Proxy API
3. Document available queries

### Swap Contract

**Fixed implementation:**
```rust
#[endpoint]
#[payable("*")]
fn swap(&self) {
    // ✅ Now uses klv_value() for KLV
    // ✅ Uses single_kda() for DGKO
    // Both directions work!
}
```

**Action items:**
1. Add view functions for pool reserves
2. Add view function for quote calculation
3. Enable frontend querying

---

## 📚 **Related Documentation**

**Internal:**
- `docs/dev/CONTRACT_DEVELOPMENT.md` - Contract deployment
- `docs/dev/LESSONS_2025_12_01.md` - KLV vs KDA bug discovery
- `docs/dev/KLEVER_PROXY_SMART_CONTRACTS.md` - Query via HTTP
- `docs/dev/KLEVER_NODE_SERVER_API.md` - VM query endpoint

**External:**
- Full reference: `docs/klever-smart-contracts-reference.txt`
- Klever documentation website
- MCP AI integration guide

---

## 🎉 **Key Takeaways**

1. **Payment Handling is Critical**
   - KLV ≠ KDA
   - Use correct `call_value()` function
   - Our bug came from using wrong function

2. **View Functions Enable Queries**
   - Mark with `#[view]`
   - Queryable via Proxy/Node API
   - Essential for frontend integration

3. **Storage Mappers are Powerful**
   - Type-safe storage access
   - Automatic serialization
   - Clean, readable code

4. **Comprehensive API Available**
   - Call Value API - Payment handling
   - Blockchain API - Chain data
   - Crypto API - Hashing, signing
   - Send API - Token transfers

---

**Status:** ✅ Complete reference extracted  
**Source:** 2,537 lines of official Klever docs  
**Impact:** Explains past bugs, enables future features  
**Next:** Add view functions to existing contracts
