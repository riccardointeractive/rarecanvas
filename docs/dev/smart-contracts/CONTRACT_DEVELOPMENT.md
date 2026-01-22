# SMART CONTRACT DEVELOPMENT GUIDE

## Overview

This guide documents the development, building, and deployment of Klever smart contracts for the Digiko ecosystem. It covers the DGKO/KLV DEX swap contract development, deployment, and **frontend integration challenges**.

**Status Update (2025-11-27):** The DEX smart contract is successfully deployed and functional on mainnet via Kleverscan. However, programmatic invocation from the frontend remains blocked due to Klever Web SDK limitations. See [Frontend Integration Challenges](#frontend-integration-challenges) for details.

---

## Contract Structure

```
contract/
├── src/
│   └── lib.rs              # Main contract logic
├── wasm/
│   ├── src/
│   │   └── lib.rs          # WASM endpoints definition
│   └── Cargo.toml          # WASM package config
├── meta/
│   ├── src/
│   │   └── main.rs         # Meta crate entry point
│   └── Cargo.toml          # Meta package config
├── output/
│   ├── digiko-swap.wasm    # Compiled contract bytecode
│   ├── digiko-swap.abi.json # Contract interface
│   └── *.json              # Build artifacts
├── Cargo.toml              # Main contract package
├── multicontract.toml      # Multi-contract configuration
├── README.md               # Contract documentation
├── INTEGRATION.md          # Frontend integration guide
└── SUMMARY.md              # Quick overview
```

---

## Development Environment Setup

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Klever SC tools
cargo install klever-sc-meta --force
```

### Verify Installation

```bash
rustc --version
cargo --version
sc-meta --version  # Note: Binary is 'sc-meta', not 'klever-sc-meta'
```

**CRITICAL:** The package is called `klever-sc-meta` but the executable is `sc-meta`.

---

## Building Contracts

### ⚠️ CRITICAL: Correct Build Process

**ONLY ONE CORRECT WAY to build Klever contracts:**

```bash
cd contract/meta
cargo run build
```

**DO NOT USE:**
```bash
# ❌ WRONG - This builds a library, NOT a WASM contract!
cd contract
cargo build --release --target=wasm32-unknown-unknown
# Result: Creates .rlib file in target/, NOT a deployable .wasm
```

### Why the Meta Build System is Required

Klever contracts use a **meta crate build system** that:
- ✅ Generates proper WASM bytecode
- ✅ Creates ABI JSON for frontend integration
- ✅ Produces contract metadata
- ✅ Optimizes for blockchain deployment
- ✅ Validates contract structure

**Regular cargo build does NOT do any of this!**

### Build Process

```bash
cd contract/meta
cargo run build
```

This generates in `contract/output/`:
- `digiko-swap.wasm` - Contract bytecode for deployment (~5-6 KB)
- `digiko-swap.abi.json` - Contract interface for frontend integration
- `digiko-swap.imports.json` - Import analysis
- `digiko-swap.kleversc.json` - Klever-specific metadata

### Clean Build

```bash
cd contract/meta
cargo run clean
cargo run build
```

### Verify Build Success

```bash
# Check output directory
ls -lh ../output/

# Should see:
# digiko-swap.wasm         ~5-6 KB
# digiko-swap.abi.json     ~2-3 KB  
# digiko-swap.imports.json
# digiko-swap.kleversc.json
```

**If you don't see a .wasm file, you used the wrong build command!**

### Build Artifacts Location

All build outputs go to `contract/output/` directory. 

**NOT** to `contract/target/` - that's for regular Rust builds!

---

## Configuration Files

### 1. multicontract.toml

Defines contract names for the build system:

```toml
[settings]
main = "digiko-swap"

[contracts.digiko-swap]
name = "digiko-swap"
add-unlabelled = true
```

**CRITICAL:** Must match the contract name. Controls output filenames.

### 2. contract/Cargo.toml

Main contract package configuration:

```toml
[package]
name = "digiko-swap"
version = "0.1.0"
edition = "2021"
publish = false

[lib]
path = "src/lib.rs"

[dependencies]
klever-sc = { version = "0.45.0" }

[dev-dependencies]
klever-sc-scenario = { version = "0.45.0" }

[profile.release]
codegen-units = 1
opt-level = "z"
lto = true
debug = false
panic = "abort"
overflow-checks = false
```

### 3. contract/wasm/Cargo.toml

WASM package configuration:

```toml
[package]
name = "digiko-swap-wasm"
version = "0.0.0"
edition = "2021"
publish = false

[lib]
crate-type = ["cdylib"]

[dependencies.digiko-swap]
path = ".."

[dependencies.klever-sc-wasm-adapter]
version = "0.45.0"
```

**CRITICAL:** Package name must end with `-wasm` and match the contract name.

---

## 🚨 CRITICAL: Native Tokens vs KDA Tokens

**Last Updated:** December 1, 2025  
**Importance:** ⭐⭐⭐⭐⭐ CRITICAL - Wrong usage causes contract failures

### The Distinction

Klever blockchain has TWO types of tokens with DIFFERENT handling in smart contracts:

| Token Type | Examples | Payment Method | Annotation | Use Case |
|------------|----------|----------------|------------|----------|
| **Native Token** | KLV | `klv_value()` | `#[payable("KLV")]` | Blockchain base currency |
| **KDA Tokens** | DGKO-CXVJ, USDT, etc. | `single_kda()` | `#[payable("*")]` | Secondary tokens |

### Code Examples

#### For Native KLV (CORRECT)

```rust
#[payable("KLV")]  // Only accept KLV
#[endpoint(swapKlvToDgko)]
fn swap_klv_to_dgko(&self) {
    // ✅ CORRECT - Use klv_value() for native KLV
    let klv_in = self.call_value().klv_value().clone_value();
    
    require!(klv_in > 0u64, "Must send KLV tokens");
    
    // No token verification needed - annotation ensures it's KLV
    // ... rest of function
}
```

#### For KDA Tokens (CORRECT)

```rust
#[payable("*")]  // Accept any KDA token
#[endpoint(swapDgkoToKlv)]  
fn swap_dgko_to_klv(&self) {
    // ✅ CORRECT - Use single_kda() for KDA tokens
    let payment = self.call_value().single_kda();
    let dgko_in = payment.amount;
    
    require!(dgko_in > 0u64, "Must send DGKO tokens");
    
    // Verify specific token
    let dgko_token_id = TokenIdentifier::from("DGKO-CXVJ");
    require!(payment.token_identifier == dgko_token_id, "Must send DGKO tokens");
    
    // ... rest of function
}
```

#### WRONG - Using single_kda() for Native KLV

```rust
#[payable("*")]
#[endpoint(swapKlvToDgko)]
fn swap_klv_to_dgko(&self) {
    // ❌ WRONG - single_kda() does NOT work for native KLV!
    let payment = self.call_value().single_kda();
    let klv_in = payment.amount;
    
    // This will FAIL with:
    // "validation error: invalid argument: VMUserError - (incorrect number of KDA transfers)"
}
```

### Why This Matters

**Native KLV:**
- Built into the blockchain protocol
- Like ETH on Ethereum
- Has special handling by the VM
- **Must use** `klv_value()` method

**KDA Tokens:**
- Secondary tokens on Klever
- Like ERC-20 on Ethereum  
- Standard token handling
- **Must use** `single_kda()` or `all_kda_transfers()` methods

**Using the wrong method causes blockchain validation errors!**

### Type Handling

**Important:** `klv_value()` returns `ManagedRef<BigUint>`, not a plain `BigUint`.

```rust
// ❌ WRONG - Cannot use ManagedRef directly
let klv_in = self.call_value().klv_value();
require!(klv_in > 0u64, "Must send KLV");  // Compilation error!

// ✅ CORRECT - Clone to owned value
let klv_in = self.call_value().klv_value().clone_value();
require!(klv_in > 0u64, "Must send KLV");  // Works!
```

The `.clone_value()` method converts `ManagedRef<BigUint>` to an owned `BigUint` that can be used in operations.

### Return Types Comparison

```rust
// Native KLV
let amount = self.call_value().klv_value().clone_value();
// Type: BigUint
// Just the amount, no token identifier

// KDA Token
let payment = self.call_value().single_kda();
// Type: KdaTokenPayment
// Includes: payment.token_identifier and payment.amount
```

### Real-World Impact

**Bug Case Study (December 1, 2025):**

The Digiko DEX swap contract had a critical bug where `swapKlvToDgko` used `single_kda()` instead of `klv_value()`:

- **Result:** 100% failure rate for KLV → DGKO swaps
- **Error:** "incorrect number of KDA transfers"  
- **Impact:** Zero successful KLV swaps since contract deployment
- **Fix:** Changed to `klv_value().clone_value()`
- **Outcome:** Full bi-directional DEX functionality restored

**This single method call difference made an entire swap direction completely non-functional!**

### Checklist for Token Handling

When writing functions that receive tokens:

- [ ] Determine if receiving native KLV or KDA tokens
- [ ] Use correct payment method:
  - Native KLV → `klv_value().clone_value()`
  - KDA tokens → `single_kda()` or `all_kda_transfers()`
- [ ] Use appropriate annotation:
  - Native KLV only → `#[payable("KLV")]`
  - Specific KDA token → `#[payable("DGKO-CXVJ")]`
  - Any KDA token → `#[payable("*")]`
- [ ] Remember to clone ManagedRef if using klv_value()
- [ ] Test with actual transactions on testnet/mainnet

---

## Configuration Files

Meta crate configuration:

```toml
[package]
name = "digiko-swap-meta"
version = "0.1.0"
edition = "2021"
publish = false

[dependencies.digiko-swap]
path = ".."

[dependencies]
klever-sc-meta = "0.45.0"

[dev-dependencies]
klever-sc-scenario = "0.45.0"
```

### 5. contract/meta/src/main.rs

Meta crate entry point:

```rust
fn main() {
    klever_sc_meta::cli_main::<digiko_swap::AbiProvider>();
}
```

**CRITICAL:** Must reference the correct module name (use underscores, not hyphens).

### 6. contract/wasm/src/lib.rs

WASM endpoints definition:

```rust
#![no_main]

klever_sc_wasm_adapter::endpoints! {
    digiko_swap
    (
        init
        upgrade
        swapDgkoToUsdt
        swapUsdtToDgko
        addLiquidity
        removeLiquidity
        setFeeCollector
        getDgkoReserve
        getUsdtReserve
        getPrice
        calculateOutput
    )
}
```

---

## Lessons Learned

### Issue 1: Event Parameter Constraints

**Problem:** Klever smart contracts only allow **1 non-indexed data argument** in events.

**Error:**
```
error: custom attribute panicked
  --> contract/src/lib.rs:15:1
   |
   = help: message: only 1 data argument allowed in event log
```

**Solution:** Make all event parameters indexed:

```rust
// ❌ WRONG - Multiple non-indexed parameters
#[event("swap")]
fn swap_event(
    &self,
    #[indexed] user: &ManagedAddress,
    #[indexed] token_in: &TokenIdentifier,
    amount_in: &BigUint,              // ❌ Not indexed
    #[indexed] token_out: &TokenIdentifier,
    amount_out: &BigUint,             // ❌ Not indexed
);

// ✅ CORRECT - All parameters indexed
#[event("swap")]
fn swap_event(
    &self,
    #[indexed] user: &ManagedAddress,
    #[indexed] token_in: &TokenIdentifier,
    #[indexed] token_out: &TokenIdentifier,
    #[indexed] amount_in: &BigUint,
    #[indexed] amount_out: &BigUint,
);
```

### Issue 2: Configuration Synchronization

**Problem:** Changing contract name requires updating 5 different files.

**Files to Update:**
1. `contract/Cargo.toml` - `name = "digiko-swap"`
2. `contract/wasm/Cargo.toml` - `name = "digiko-swap-wasm"` and dependency name
3. `contract/meta/Cargo.toml` - `name = "digiko-swap-meta"` and dependency name
4. `contract/meta/src/main.rs` - `digiko_swap::AbiProvider`
5. `contract/multicontract.toml` - `main = "digiko-swap"` and contract name
6. `contract/wasm/src/lib.rs` - `digiko_swap` in endpoints macro

**Checklist:**
- [ ] Main Cargo.toml package name
- [ ] WASM Cargo.toml package name and dependency
- [ ] Meta Cargo.toml package name and dependency
- [ ] Meta main.rs module reference
- [ ] multicontract.toml contract name
- [ ] WASM lib.rs endpoints macro

### Issue 3: Build Tool Discovery

**Problem:** The executable binary name differs from the package name.

**Package:** `klever-sc-meta`  
**Binary:** `sc-meta`

**Correct Usage:**
```bash
# Install
cargo install klever-sc-meta

# Use (note different name)
sc-meta --version
cd contract/meta
cargo run build
```

### Issue 4: Clean Builds

**Problem:** Old build artifacts can persist even after changing configuration.

**Solution:** Always clean before building after configuration changes:

```bash
cd contract/meta
cargo run clean
cargo run build
```

### Issue 5: Event Parameter Order

**Problem:** Changing event signature requires updating all event calls.

**Example:** After reordering event parameters, function calls must match:

```rust
// Event definition
#[event("swap")]
fn swap_event(
    &self,
    #[indexed] user: &ManagedAddress,
    #[indexed] token_in: &TokenIdentifier,
    #[indexed] token_out: &TokenIdentifier,  // Moved up
    #[indexed] amount_in: &BigUint,
    #[indexed] amount_out: &BigUint,
);

// Function call must match
self.swap_event(&caller, &dgko_token_id, &usdt_token_id, &dgko_in, &usdt_out);
                                         // ^^^^^^^^^^^^^^^^ Order matters
```

**Fix:** Compiler will show exact required order. Follow the help message.

---

## Common Errors & Solutions

### Error: "command not found: klever-sc-meta"

**Cause:** Binary is named `sc-meta`, not `klever-sc-meta`

**Solution:** Use `sc-meta` instead

### Error: "Found 0 contract crates"

**Cause:** Wrong command or directory

**Solutions:**
1. Use `cd contract/meta && cargo run build` (not `sc-meta all build`)
2. Check you're in the correct directory
3. Verify `multicontract.toml` exists

### Error: "no matching package named 'counter'"

**Cause:** Old package references in configuration files

**Solution:** Update all 6 configuration files (see Issue 2)

### Error: "only 1 data argument allowed in event log"

**Cause:** Multiple non-indexed parameters in event

**Solution:** Add `#[indexed]` to all event parameters (see Issue 1)

### Error: "arguments to this method are incorrect"

**Cause:** Event parameter order changed but function calls not updated

**Solution:** Follow compiler help message to swap arguments

---

## Token Precision Reference

**CRITICAL:** Klever tokens have different decimal precisions:

| Token | Decimals | Precision | Example |
|-------|----------|-----------|---------|
| DGKO  | 4        | 10,000    | 1 DGKO = 10,000 base units |
| USDT  | 6        | 1,000,000 | 1 USDT = 1,000,000 base units |
| KLV   | 6        | 1,000,000 | 1 KLV = 1,000,000 base units |

**When initializing pools:**
```rust
// 100,000 DGKO = 100,000 * 10,000 = 1,000,000,000,000 base units
let dgko_reserve = 1_000_000_000_000u64;

// 40 USDT = 40 * 1,000,000 = 40,000,000 base units
let usdt_reserve = 40_000_000u64;
```

---

## Deployment Guide

### Testnet Deployment

### Mainnet Deployment (Complete Workflow)

**Deployed Contract:**
- **Address:** `klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h`
- **Trading Pair:** DGKO-CXVJ / KLV
- **Initial Pool:** 100,000 DGKO + 20,000 KLV
- **Price:** 1 DGKO = 0.2 KLV
- **Status:** ✅ Live and operational

**Via Kleverscan (Recommended):**

1. **Navigate to Kleverscan**
   - URL: https://kleverscan.org (mainnet)
   - Connect Klever Wallet Extension
   - Ensure wallet is on **MAINNET**

2. **Start Deployment**
   - Click **"Create Transaction"** (top menu)
   - Select: **"Smart Contract"**
   - Choose Operation: **"Deploy"**

3. **Upload Contract Files**
   - **Contract Binary (.wasm):** Upload `digiko-swap.wasm`
   - **Contract ABI (.json):** Upload `digiko-swap.abi.json`
   - Both files required for deployment

4. **Configure Properties**
   All properties should be set to `true` (default):
   - **Upgradable:** `true` (allows future improvements)
   - **Readable:** `true` (enables view functions)
   - **Payable:** `true` (accepts token payments)
   - **Payable by SC:** `true` (other contracts can pay)

5. **Set Constructor Arguments**
   - **Argument 1 (dgko_reserve):** `1000000000000` (100,000 DGKO with 4 decimals)
   - **Argument 2 (klv_reserve):** `20000000000` (20,000 KLV with 6 decimals)
   - Arguments must match contract's `init` function

6. **Optional: Send Initial Tokens**
   - Click **"Add Token"** to send tokens during deployment
   - Or add liquidity later via `addLiquidity` function

7. **Set Gas and Deploy**
   - **KApp Fee:** `100000000` (100 KLV)
   - Click **"Create Transaction"**
   - Confirm in wallet popup
   - Save contract address from transaction details

### Adding Liquidity

**Via Kleverscan Invoke:**

1. **Create Transaction** → **Smart Contract** → **Invoke**
2. **Contract Address:** Paste deployed address
3. **Function:** Select `addLiquidity`
4. **Tokens to Send:**
   - Click **"Add Token"**
   - Token 1: `DGKO-CXVJ` → `1000000000000`
   - Click **"Add Token"** again
   - Token 2: `KLV` → `20000000000`
5. **KApp Fee:** `50000000`
6. **Create Transaction** → Confirm

### Testing Swaps

**Swap DGKO to KLV:**
1. Function: `swapDgkoToKlv`
2. Send: `DGKO-CXVJ` → `1000000` (100 DGKO test)
3. Gas: `30000000`
4. Receive: ~19.98 KLV

**Swap KLV to DGKO:**
1. Function: `swapKlvToDgko`
2. Send: `KLV` → `10000000` (10 KLV test)
3. Gas: `30000000`
4. Receive: ~49.75 DGKO

### Using Klever CLI (Alternative)

```bash
# Deploy contract
klever-cli contract deploy \
  --wasm-path ./contract/output/digiko-swap.wasm \
  --network mainnet \
  --gas-limit 100000000 \
  --args "1000000000000" "20000000000"

# Add liquidity
klever-cli contract call \
  --contract YOUR_CONTRACT_ADDRESS \
  --function addLiquidity \
  --transfers "DGKO-CXVJ:1000000000000,KLV:20000000000" \
  --gas-limit 50000000
```

### Using Klever Web Interface (Alternative)

1. Go to Klever Wallet
2. Navigate to Smart Contracts → Deploy
3. Upload `contract/output/digiko-swap.wasm`
4. Set gas limit: 100,000,000
5. Add constructor arguments: `["1000000000000", "20000000000"]`
6. Confirm transaction

### Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address saved and documented
- [ ] Initial liquidity added via `addLiquidity()`
- [ ] Verify reserves with `getDgkoReserve()` and `getKlvReserve()`
- [ ] Test swap functionality with small amounts
- [ ] Update frontend config with contract address
- [ ] Document contract address in public docs
- [ ] Announce to community

### Testnet Deployment Notes

**Token Availability Issues:**
- USDT doesn't exist as KDA on KleverChain (only ERC-20/TRC-20)
- KFI extremely difficult to obtain on testnet
- Token creation costs 20,000 KLV but faucet only gives 500 KLV
- Many mainnet tokens don't exist on testnet

**Recommendation:**
Deploy directly to mainnet with real tokens (DGKO-CXVJ and KLV) for testing. Start with small liquidity amounts and scale up after verification.

**Testnet Faucet:**
- URL: https://testnet.kleverscan.org
- Provides: 500 KLV (insufficient for custom tokens)
- Alternative: Use only native tokens (KLV/KFI) on testnet

---

## Frontend Integration

See `contract/INTEGRATION.md` for detailed frontend integration guide.

**Key Changes Needed:**
1. Update `src/app/swap/config/swap.config.tsx` with contract address
2. Create `useContractReserves.ts` hook for blockchain data
3. Update `useSwapExecution.ts` to use SmartContract transactions
4. Add `SmartContractPayload` type to Klever types

**Transaction Structure:**
```typescript
// OLD (broken)
type: TransactionType.Transfer,
payload: { amount, receiver: poolAddress, kda: 'DGKO-CXVJ' }

// NEW (working)
type: TransactionType.SmartContract,
payload: {
  scType: 0, // Call
  contractAddress: SWAP_CONTRACT_ADDRESS,
  functionName: 'swapDgkoToUsdt',
  amount: inputAmount,
  kda: 'DGKO-CXVJ'
}
```

---

## ABI Encoding for Function Calls

**Official patterns validated by Klever team (Dec 4, 2025)**  
**Complete guide:** See `ABI_ENCODING_GUIDE.md` for comprehensive reference

### Quick Overview

When calling smart contract functions from the frontend, you need to encode the function name and parameters properly. Klever uses a specific ABI encoding format.

### Pattern 1: Functions WITHOUT Parameters (Our Swap Functions)

**Most common pattern. Used when function only needs payment (callValue).**

```typescript
// Example: swapKlvToDgko()
const functionName = 'swapKlvToDgko';
const metadata = Buffer.from(functionName).toString('base64');

// Transaction structure
{
  type: TransactionType.SmartContract,
  payload: {
    scType: 0, // Invoke
    address: CONTRACT_ADDRESS,
    callValue: [
      {
        asset: 'KLV',
        value: 100000000,
        kdaRoyalties: 0,
        klvRoyalties: 0,
      }
    ],
  },
  metadata: [metadata], // Just the function name
}
```

**Our contract functions are parameterless:**
```rust
#[endpoint(swapKlvToDgko)]
#[payable("KLV")]
fn swap_klv_to_dgko(&self) {
    let payment = self.call_value().klv_value().clone_value();
    // No parameters - only uses payment
}
```

### Pattern 2: Functions WITH Parameters (Future Admin Functions)

**For functions like addLiquidity(dgkoAmount: u64, klvAmount: u64)**

```typescript
import { abiEncoder } from '@klever/sdk';

const functionName = 'addLiquidity';
const dgkoAmount = 1000000; // 100 DGKO (4 decimals)
const klvAmount = 500000000; // 500 KLV (6 decimals)

const txData = Buffer.from(
  functionName +
  '@' + abiEncoder.encodeABIValue(dgkoAmount, 'u64', false) +
  '@' + abiEncoder.encodeABIValue(klvAmount, 'u64', false),
  'utf8',
).toString('base64');

// Transaction structure
{
  type: TransactionType.SmartContract,
  payload: {
    scType: 0,
    address: CONTRACT_ADDRESS,
  },
  metadata: [txData], // Function name + encoded parameters
}
```

### Key Principles

1. **Function name** → Encode to base64
2. **No parameters** → Just function name in metadata
3. **With parameters** → Use `@` separator + `abiEncoder.encodeABIValue()`
4. **Payment** → Goes in `callValue`, NOT in parameters

### Common Parameter Types

```typescript
// Numbers (token amounts, timestamps)
abiEncoder.encodeABIValue(1000000, 'u64', false)

// Text (IDs, metadata)
abiEncoder.encodeABIValue('campaign-123', 'String', false)

// Addresses (wallet addresses)
abiEncoder.encodeABIValue('klv1...', 'Address', false)

// Tokens (asset identifiers)
abiEncoder.encodeABIValue('DGKO-CXVJ', 'TokenIdentifier', false)
```

### Reference Implementation

**Official Example:** [Klever Crowdfunding dApp](https://github.com/klever-io/kc-kapp-crowdfunding)

Study this repository for:
- Real working code
- Parameter encoding examples
- Error handling patterns
- Complete transaction flow

### Resources

**Internal:**
- `ABI_ENCODING_GUIDE.md` - Comprehensive encoding reference
- `COMPLETE_SWAP_ADMIN_DOCUMENTATION.md` - Admin function examples
- `KLEVER_INTEGRATION.md` - SDK patterns

**External:**
- [Klever Forum Thread](https://forum.klever.org/t/smart-contract-function-executes-successfully-but-does-not-transfer-tokens/4155/4)
- [Crowdfunding dApp](https://github.com/klever-io/kc-kapp-crowdfunding)

---

## Security Considerations

1. **Owner-only functions:** Use `#[only_owner]` attribute for administrative functions
2. **Pool protection:** 50% max swap size prevents pool draining
3. **Input validation:** Always validate amounts > 0
4. **Token verification:** Verify correct token IDs in payable functions
5. **Reserve checks:** Ensure sufficient reserves before transfers
6. **Event logging:** Emit events for all state changes for transparency

---

## Testing Workflow

### Local Testing

1. Build contract: `cd contract/meta && cargo run build`
2. Verify output files exist in `contract/output/`
3. Check contract size (should be ~5-6KB)

### Testnet Testing

1. Deploy to testnet
2. Add initial liquidity
3. Test DGKO→USDT swap
4. Test USDT→DGKO swap
5. Verify reserves update correctly
6. Check transaction history on Kleverscan
7. Test edge cases (insufficient liquidity, exceeding 50% limit)

### Frontend Testing

1. Update swap config with testnet contract address
2. Test UI swap flow
3. Verify transaction building
4. Check error handling
5. Validate reserve updates

---

## Version History

### v1.0.0 - Initial DEX Swap Contract
- AMM implementation with constant product formula
- DGKO/USDT token pair support
- Swap functions: `swapDgkoToUsdt()`, `swapUsdtToDgko()`
- Liquidity management: `addLiquidity()`, `removeLiquidity()`
- View functions for reserves and price calculations
- Event logging for all swaps
- Security features: owner-only liquidity, 50% max swap size

---

## Resources

### Official Documentation
- [Klever Smart Contracts](https://klever.finance/smart-contracts/)
- [Klever SDK Documentation](https://klever.finance/developers/)
- [Klever Forum](https://forum.klever.org/)

### Internal Documentation
- `contract/README.md` - Contract overview and deployment
- `contract/INTEGRATION.md` - Frontend integration guide
- `contract/SUMMARY.md` - Quick reference
- `contract/src/lib.rs` - Contract source code with inline docs

### Development Tools
- Rust: https://www.rust-lang.org/
- Klever SC Framework: https://github.com/klever-io/klever-vm-sdk-rs
- Kleverscan Testnet: https://testnet.kleverscan.org/

---

## Kleverscan Deployment Workflow (Detailed)

### Understanding Kleverscan Operations

**Deploy vs Invoke:**
- **Deploy:** Used ONLY for initial contract deployment
  - Uploads WASM and ABI files
  - Creates new contract with unique address
  - Sets contract properties (upgradable, readable, payable)
  - Calls constructor (`init` function)
  
- **Invoke:** Used for ALL function calls on deployed contracts
  - Calls specific functions by name
  - Can send tokens as payment (for payable functions)
  - Requires contract address

### Deploy Operation Workflow

1. **Create Transaction** → **Smart Contract** → **Deploy**

2. **Upload Files Section:**
   - **Contract Binary (.wasm):** Required - the compiled contract bytecode
   - **Contract ABI (.json):** Required - contract interface definition
   - Both generated in `contract/output/` after build

3. **Properties Section:**
   ```
   Upgradable: true     # Allows owner to upgrade contract
   Readable: true       # Enables view/query functions  
   Payable: true        # Contract can receive token payments
   Payable by SC: true  # Other contracts can pay this contract
   ```
   *All should be `true` for full functionality*

4. **Arguments Section:**
   - Based on contract's `init` function parameters
   - Must match parameter count and types
   - Use proper decimal precision for token amounts
   - Example: `["1000000000000", "20000000000"]`

5. **Tokens to Send (Optional):**
   - Can send initial tokens during deployment
   - Or send later via `addLiquidity` function
   - Use "Add Token" button for each token

6. **Gas/Fee:**
   - **KApp Fee:** Amount of KLV for gas
   - Deployment typically needs 100 KLV
   - Will be returned if unused

### Invoke Operation Workflow

1. **Create Transaction** → **Smart Contract** → **Invoke**

2. **Contract Address:**
   - Paste deployed contract address
   - Format: `klv1qqqqq...`
   - Get from deployment transaction

3. **Function Dropdown:**
   - Lists all available contract functions
   - Select function to call (e.g., `addLiquidity`, `swapDgkoToKlv`)
   - Dropdown populated from contract ABI

4. **Arguments (if function requires):**
   - Some functions need parameters
   - Example: `removeLiquidity(dgko_amount, klv_amount)`
   - Leave empty for functions with no parameters

5. **Tokens to Send:**
   - For payable functions like `addLiquidity` or swap functions
   - Click **"Add Token"** for each token to send
   - Select token from dropdown
   - Enter amount with proper decimals
   - Example: Send 100,000 DGKO = `1000000000000` (4 decimals)

6. **Gas/Fee:**
   - Function calls need less gas than deployment
   - 30-50 KLV typically sufficient
   - Adjust based on function complexity

### Common Deployment Errors

**Error: "validation error: invalid argument: tokenize failed"**
- **Cause:** Trying to send tokens incorrectly
- **Solution:** Use "Invoke" operation, add tokens via "Add Token" button
- **Details:** Multi-token transfers require specific format

**Error: "function does not accept KDA payment"**
- **Cause:** Sending tokens to non-payable function or wrong operation
- **Solution:** 
  - Check function is `#[payable("*")]` in contract
  - Ensure using "Invoke" operation, not "Deploy"
  - Verify ABI matches deployed contract

**Error: "VMExecutionFailed"**
- **Cause:** Contract logic rejected the transaction
- **Common reasons:**
  - Insufficient reserves in pool
  - Exceeds 50% swap limit
  - Wrong token ID sent
  - Amount is zero
  - Not contract owner (for owner-only functions)

**Error: "no matching package named [name]"**
- **Cause:** Configuration files not synchronized
- **Solution:** Check all 6 files have matching names:
  1. `contract/Cargo.toml` - package name
  2. `contract/wasm/Cargo.toml` - package name + dependency
  3. `contract/meta/Cargo.toml` - package name + dependency  
  4. `contract/meta/src/main.rs` - module reference (use underscores)
  5. `contract/multicontract.toml` - contract name
  6. `contract/wasm/src/lib.rs` - endpoints macro module name

**Error: "only 1 data argument allowed in event log"**
- **Cause:** Klever events only allow ONE non-indexed parameter
- **Solution:** Mark all event parameters with `#[indexed]` attribute
- **Example:**
  ```rust
  #[event("swap")]
  fn swap_event(
      &self,
      #[indexed] user: &ManagedAddress,
      #[indexed] token_in: &TokenIdentifier,
      #[indexed] token_out: &TokenIdentifier,
      #[indexed] amount_in: &BigUint,    // Must be indexed!
      #[indexed] amount_out: &BigUint,   // Must be indexed!
  );
  ```

**Error: "Contract properties unclear"**
- **Solution:** Always set all properties to `true`:
  ```
  upgradable: true
  readable: true  
  payable: true
  payableBySC: true
  ```

**Error: "Missing ABI file"**
- **Cause:** Only uploaded WASM without ABI
- **Solution:** Both files required during deployment
- **Files needed:**
  - `digiko-swap.wasm` (bytecode)
  - `digiko-swap.abi.json` (interface)

**Error: "Insufficient KLV for gas"**
- **Cause:** Wallet doesn't have enough KLV
- **Solution:** Ensure wallet has 100+ KLV for deployment
- **Note:** Unused gas is returned after transaction

### Token Decimal Precision

**Critical:** Always account for token decimals when entering amounts!

| Token | Decimals | Display Amount | Blockchain Amount |
|-------|----------|----------------|-------------------|
| DGKO-CXVJ | 4 | 100,000 | 1000000000000 |
| DGKO-CXVJ | 4 | 100 | 1000000 |
| KLV | 6 | 20,000 | 20000000000 |
| KLV | 6 | 10 | 10000000 |
| USDT | 6 | 40 | 40000000 |

**Formula:** `blockchain_amount = display_amount × 10^decimals`

### Kleverscan UI Gotchas

1. **No "Payable" indicator on functions**
   - UI doesn't show which functions accept payments
   - Must know from contract code or documentation

2. **Dropdown may not show all functions**
   - Sometimes need to refresh page
   - Or re-upload ABI if functions missing

3. **"Add Token" button resets**
   - After adding one token, button reappears for next
   - Can add multiple tokens for multi-transfer

4. **Arguments must be strings**
   - Even for numbers, enter as strings
   - Example: `"1000000000000"` not `1000000000000`

5. **No transaction preview**
   - Can't see calculated output before confirming
   - Use view functions to estimate first

### Deployment Security Checklist

**Before Deploying:**
- [ ] Contract audited and tested locally
- [ ] All configuration files synchronized
- [ ] Constructor arguments calculated correctly
- [ ] Sufficient KLV in wallet for gas
- [ ] Connected to correct network (mainnet vs testnet)

**During Deployment:**
- [ ] Uploaded both WASM and ABI files
- [ ] Set all properties to `true`
- [ ] Double-checked constructor arguments
- [ ] Reviewed gas limit (100 KLV minimum)
- [ ] Saved transaction hash

**After Deployment:**
- [ ] Saved contract address securely
- [ ] Verified deployment on Kleverscan
- [ ] Tested view functions work
- [ ] Added initial liquidity with small amounts
- [ ] Tested swap functions with small amounts
- [ ] Monitored first transactions for errors
- [ ] Documented contract address everywhere
- [ ] Updated frontend configuration

---

## Troubleshooting Commands

```bash
# Verify Rust installation
rustc --version
cargo --version

# Check WASM target
rustup target list | grep wasm32

# Verify build tools
sc-meta --version

# Clean all build artifacts
cd contract
rm -rf target/
rm -rf meta/target/
rm -rf wasm/target/
rm -f Cargo.lock meta/Cargo.lock wasm/Cargo.lock

# Fresh build
cd meta
cargo run clean
cargo run build

# Check output files
ls -lh ../output/

# Verify contract has correct token IDs
grep "DGKO-CXVJ" src/lib.rs
grep '"KLV"' src/lib.rs

# Check wasm file size (should be ~5-6KB)
ls -lh output/digiko-swap.wasm
```

---

## Frontend Integration Challenges

### Problem Overview

**Goal:** Programmatically invoke the deployed DEX smart contract from the Next.js frontend to enable user-friendly token swaps.

**Status:** **BLOCKED** - Klever Web SDK does not support SmartContract transaction type.

**Contract Status:** ✅ Deployed and functional on mainnet via Kleverscan  
**Manual Testing:** ✅ Swaps work perfectly when invoked through Kleverscan UI  
**Programmatic Invocation:** ❌ Cannot build SmartContract transactions with @klever/sdk-web

### Root Cause

The Klever Web SDK (`@klever/sdk-web` v1.5.1) only supports the following transaction types through `web.buildTransaction()`:
- Transfer
- Freeze (staking)
- Unfreeze (unstaking)
- Withdraw
- Claim

**SmartContract type (23) is NOT supported** in the web SDK, despite being a valid transaction type in the Klever blockchain protocol.

### Evidence

1. **Web SDK Test:**
```typescript
await web.buildTransaction([{
  type: 23, // SmartContract
  payload: { address: CONTRACT_ADDRESS, callFunction: 'swapDgkoToKlv', ... }
}]);
// Result: 400 Bad Request from node.mainnet.klever.org/transaction/send
```

2. **Documentation Gap:**
- Klever docs, GitHub, npm, and forums have ZERO examples of programmatic smart contract invocation
- All smart contract interactions shown are via Kleverscan UI only
- GO SDK and Node SDK have smart contract support, but NOT the Web SDK

3. **Working Comparison:**
```typescript
// ✅ WORKS - Staking uses Freeze transaction
await web.buildTransaction([{
  type: TransactionType.Freeze,
  payload: { amount: 1000000, kda: 'DGKO-CXVJ' }
}]);

// ❌ FAILS - SmartContract type not implemented
await web.buildTransaction([{
  type: 23, // SmartContract
  payload: { address: CONTRACT_ADDRESS, ... }
}]);
```

### Integration Attempts Timeline

#### Attempt 1: Direct Web SDK Invocation
**Approach:** Use `web.buildTransaction()` with SmartContract type  
**Result:** 400 Bad Request - SDK doesn't support the transaction type  
**Duration:** 30 minutes

#### Attempt 2: Backend Node SDK Transaction Building
**Approach:** Build unsigned transaction on backend using @klever/sdk-node, sign on frontend  
**Challenge:** Node SDK installation issues (postinstall script broken)  
**Result:** Installed with `--ignore-scripts` flag  
**Duration:** 1 hour

#### Attempt 3: Manual Protobuf Encoding
**Approach:** Manually construct protobuf bytes for SmartContract transaction  
**Challenges:**
- Unknown protobuf schema for SmartContract parameter
- CallData field encoding unclear (base64 string vs JSON bytes vs protobuf binary)
- ChainID format confusion (string vs base64 vs bytes)
- Sender/Address encoding (Uint8Array vs base64 vs hex)

**Attempts Made:**
1. JSON with base64 CallData → Extension popup failed to decode
2. Protobuf-style structure with type_url → Invalid transaction error
3. Manual protobuf byte construction → Extension couldn't establish connection
4. Various encoding combinations → Decode errors (400 from transaction/decode endpoint)

**Key Discovery:** Klever Extension tries to decode transaction to display details before signing. Our manually constructed transactions consistently failed validation at the decode stage.

**Result:** Extension opens but cannot decode/validate the transaction  
**Duration:** 4 hours

#### Attempt 4: Comparison with Working Transactions
**Findings:**
```javascript
// Staking (WORKS) - FreezeContract protobuf value
{
  Parameter: {
    type_url: "type.googleapis.com/proto.FreezeContract",
    value: "CglER0tPLUNYVkoQwIQ9" // Binary protobuf, decodes to valid structure
  }
}

// Our Smart Contract (FAILS) - Attempted SmartContract protobuf value
{
  Parameter: {
    type_url: "type.googleapis.com/proto.SmartContract",
    value: "CAASIAAAAAAAAAAABQBUgYUc..." // Manual protobuf bytes
  }
}
```

The staking `value` is proper protobuf binary generated by the SDK. Our manual attempts couldn't replicate the exact format without the protobuf schema.

**Duration:** 2 hours

### Technical Barriers

1. **No Protobuf Schema Access**
   - SmartContract parameter structure is not documented
   - Can't generate proper protobuf encoding without schema
   - Node SDK's SmartContract helper doesn't match required format

2. **Extension Validation**
   - Klever Extension decodes transaction BEFORE showing to user
   - Invalid protobuf structure = failed decode = no popup
   - No error messages to debug format issues

3. **SDK Limitations**
   - Web SDK: No SmartContract support
   - Node SDK: Has protobuf but installation broken + unclear API
   - No TypeScript types for SmartContract transaction building

4. **Documentation Absence**
   - Zero examples of programmatic smart contract invocation
   - All tutorials show Kleverscan UI only
   - Forum posts indicate others hitting same limitation

### Workarounds Considered

#### Option A: Kleverscan Direct (Rejected)
Redirect users to Kleverscan with pre-filled parameters
- ❌ Poor UX (leaves our app)
- ❌ No transaction tracking
- ❌ Can't integrate into UI flow

#### Option B: Backend Proxy with Full Signing (Rejected)
Backend holds private keys and signs transactions
- ❌ MAJOR SECURITY RISK
- ❌ Violates Web3 principles (non-custodial)
- ❌ User loses control of funds

#### Option C: Wait for SDK Update (Chosen)
Mark feature as "Coming Soon", continue when SDK supports it
- ✅ Maintains security (user controls keys)
- ✅ Proper UX when available
- ✅ Contract is ready and deployed
- ⏳ Unknown timeline for SDK update

### Current Solution

**Status:** Feature marked as "Coming Soon" in navigation and dashboard

**Implementation:**
- Contract deployed and functional: `klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h`
- Frontend UI complete at `/swap` (not accessible via navigation)
- Backend API routes ready for transaction building
- All code preserved for future activation

**Files Modified:**
- `src/components/NavigationLinks.tsx` - Moved Swap to "Coming Soon" section
- `src/app/dashboard/components/QuickActions.tsx` - Disabled swap action
- `src/app/dashboard/components/ResourcesSection.tsx` - Updated to "Coming Soon"
- `src/app/dashboard/config/dashboard.config.tsx` - Updated guide items

**Files Ready (Not in Use):**
- `src/app/swap/` - Complete swap UI with calculation engine
- `src/lib/klever-node.ts` - Backend transaction building utilities
- `src/app/api/swap/build/route.ts` - Transaction building API
- `src/app/api/swap/broadcast/route.ts` - Broadcasting API (not needed, web SDK handles it)

### Lessons Learned

1. **Verify SDK Capabilities Early**
   - Check SDK source code/docs BEFORE building features that depend on it
   - Don't assume parity between Web SDK and backend SDKs
   - Test with minimal example before full implementation

2. **Smart Contract ≠ Frontend Ready**
   - Deployed contract doesn't guarantee programmatic access
   - Manual testing via Kleverscan doesn't prove SDK support
   - Frontend integration can be the hardest part

3. **Protobuf Without Schema is a Dead End**
   - Manual protobuf encoding is extremely error-prone
   - Without schema, impossible to guarantee correct format
   - Binary protocols need proper tooling

4. **Documentation Gaps are Red Flags**
   - Zero examples = feature likely not supported
   - "It works in GO SDK" ≠ "It works in Web SDK"
   - Community silence often means others hit same wall

5. **Security Cannot Be Compromised**
   - Never consider backend signing solutions
   - User key custody is non-negotiable
   - Poor UX is better than insecure UX

### Path Forward

**Immediate:** Feature stays "Coming Soon"

**When SDK Updates:**
1. Monitor Klever SDK releases for SmartContract support
2. Test with minimal example first
3. Integrate into swap page
4. Enable in navigation
5. Announce to community

**Alternative (If SDK Never Updates):**
1. Consider building custom browser extension
2. Partner with Klever team directly
3. Explore alternative blockchain with better SDK support
4. Keep Kleverscan workaround for power users

### Key Takeaway

> **Smart contracts on blockchains without proper SDK support become "power user only" features accessible via block explorers, defeating the purpose of dApp development.**

The Digiko DEX smart contract is technically successful but commercially unusable until Klever provides proper Web SDK support for programmatic smart contract invocation.

---

## 🔥 BREAKTHROUGH UPDATE (November 30, 2025)

### Critical Discovery: Payload Structure Fixed

**Previous Status:** DEX marked as "ON HOLD - Awaiting SDK Support" (Nov 27)  
**New Status:** WORKING - First successful mainnet swap completed! (Nov 30)

### The Problem Was NOT the SDK

The Klever Web SDK **DOES** support smart contract invocation. The issue was incorrect payload structure.

### What Was Wrong

```typescript
// ❌ INCORRECT (Nov 27) - Array format
payload: {
  callValue: [
    { assetId: 'DGKO-RBNF', amount: 1700000 }
  ]
}
```

### What Is Correct

```typescript
// ✅ CORRECT (Nov 30) - Map/object format
payload: {
  callValue: {
    'DGKO-RBNF': 1700000
  }
}
```

### First Successful Mainnet Swap

**Transaction Hash:** `b64ee1dae659ec9cadf5985ffb7eaa813e9ffe07eb59a7196d871db99c6453ae`  
**Type:** DGKO → KLV  
**Input:** 170,000 DGKO (170.0000 with 4 decimals)  
**Output:** 3,392,298 KLV (0.03392298 with 8 decimals)  
**Status:** ✅ SUCCESS  
**Network:** Klever Mainnet  
**Explorer:** https://kleverscan.org/transaction/b64ee1dae659ec9cadf5985ffb7eaa813e9ffe07eb59a7196d871db99c6453ae

### Current Status

**Working:**
- ✅ Smart contract execution
- ✅ Transaction building via Klever Web SDK
- ✅ Signing with Klever Extension
- ✅ Broadcasting to mainnet
- ✅ AMM price calculations
- ✅ Token transfers

**Not Production-Ready:**
- ⚠️ Limited testing of edge cases
- ⚠️ No slippage protection
- ⚠️ No reserve depletion checks
- ⚠️ Error handling incomplete
- ⚠️ Gas estimation needs refinement

### Updated Path Forward

**Immediate (Next Week):**
- Extensive testing of all swap scenarios
- Implement safety features
- Error handling improvements
- User feedback mechanisms

**Short Term (2-3 Weeks):**
- KleverScan contract verification
- Set contract display name
- Public beta testing
- Analytics integration

**Production Launch (4-6 Weeks):**
- All safety features complete
- Comprehensive testing done
- Documentation finalized
- Community announcement

See [DEX_STATUS_SUMMARY.md](DEX_STATUS_SUMMARY.md) for complete status update.

---

## SetAccountName Investigation (November 30, 2025)

### Goal
Set the smart contract's display name to "Digiko DEX" on KleverScan.

### What is SetAccountName?

**Transaction Type:** 12  
**Purpose:** Sets a display name for blockchain accounts

**Transaction Structure:**
```typescript
{
  type: 12, // SetAccountName
  payload: {
    name: "Digiko DEX"
  }
}
```

### CRITICAL LIMITATION DISCOVERED

**SetAccountName sets the name for the SENDER, not a target address.**

#### Why This Happens

Smart contracts **cannot send transactions themselves**. They can only:
- ✅ Receive transactions
- ✅ Execute code
- ✅ Store data
- ✅ Emit events

They **cannot:**
- ❌ Sign transactions
- ❌ Initiate SetAccountName for themselves
- ❌ Change their own metadata

#### What Actually Happened

When testing SetAccountName functionality:
```typescript
// User sends SetAccountName transaction
await window.kleverWeb.buildTransaction([
  {
    type: 12,
    payload: { name: 'Digiko DEX' }
  }
]);

// Result:
// ✅ Transaction succeeds
// ✅ Name is set to "Digiko DEX"
// ❌ But it's the USER'S wallet name, not the contract
```

User's quote: *"it changed my account name not the contract name lol"* 😄

### Solutions for Contract Naming

Since SetAccountName won't work for contracts, alternatives are:

#### Option 1: KleverScan Verification (RECOMMENDED)

**Discovery:** KleverScan has a "Verify" feature and "Contract Area" announced October 2025.

**Purpose:** 
- Contract verification and transparency
- Similar to Etherscan verification
- May allow setting display names

**Status:**
- Feature exists (visible in navigation menu)
- Documentation is missing
- Process unknown

**Next Steps:**
1. Visit https://kleverscan.org/verify
2. Post on Klever forum: https://forum.klever.org/c/kleverchain/developers/9
3. Ask: "How do I verify my smart contract and set a display name?"

**Forum Post Template:**
```
Title: How to verify smart contract and set display name on KleverScan?

I've deployed a DEX smart contract to Klever mainnet:
Address: klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h

Questions:
1. How do I use the KleverScan verification feature?
2. Can I set a display name like "Digiko DEX"?
3. Is contract verification required for naming?
4. What are the requirements (source code, ABI, etc.)?

The contract is working with successful swap transactions.
Any guidance would be appreciated!
```

#### Option 2: Contact Klever Support

**Channels:**
- Forum: https://forum.klever.org/
- Telegram: Official Klever developer channels
- Discord: Klever official server (if available)

**What to Ask:**
> "I deployed a smart contract at `klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h` and would like to set its display name to 'Digiko DEX' on KleverScan. What's the process?"

#### Option 3: Contract Deployment Metadata

Check if contract deployment supports name field in deployment transaction.

**Status:** No evidence found in Klever documentation.

#### Option 4: Owner Wallet Name

Set the owner wallet's name to indicate contract ownership.

**Drawback:** Not ideal - confuses wallet identity with contract identity.

### Test Page Created

**File:** `src/app/set-name/page.tsx`  
**Route:** `/set-name`  
**Purpose:** Test SetAccountName functionality

**Features:**
- Self-contained page with inline logic
- Button to set name to "Digiko DEX"
- Connection status display
- Real-time transaction feedback
- Auto-opens KleverScan on success
- Clear warning about wallet vs contract naming

**Important Note:** This test page demonstrates that SetAccountName works, but sets the **user's wallet name**, not the contract name.

### Key Takeaway

**SetAccountName is for wallet addresses, NOT for smart contracts.**

To set a contract's display name on KleverScan:
1. Use KleverScan verification feature (needs exploration)
2. Contact Klever support directly
3. Check if contract metadata can be set during deployment (unclear)

**Do NOT** try to use SetAccountName for contracts - it will only set the sender's wallet name.

---

## Notes

- Contract development requires Rust knowledge and familiarity with Klever framework
- Testnet has severe token availability limitations - deploy to mainnet for real testing
- Always test with small amounts first before scaling up liquidity
- Keep contract size minimal for lower gas costs
- Document all functions with inline comments
- Use events for important state changes
- Follow Klever best practices for security
- Save all deployment transaction hashes for audit trail

---

Last updated: 2025-11-30 (Major Update: Swap Breakthrough + SetAccountName Investigation)
