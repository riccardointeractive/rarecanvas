# ABI ENCODING GUIDE FOR KLEVER SMART CONTRACTS

**Last Updated:** December 4, 2025  
**Status:** Official patterns validated by Klever team  
**Source:** [Klever Forum Thread](https://forum.klever.org/t/smart-contract-function-executes-successfully-but-does-not-transfer-tokens/4155/4)

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Basic Concepts](#basic-concepts)
3. [Encoding Patterns](#encoding-patterns)
4. [Parameter Types](#parameter-types)
5. [Complete Examples](#complete-examples)
6. [Common Mistakes](#common-mistakes)
7. [Reference Implementation](#reference-implementation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide documents the **official patterns** for encoding smart contract function calls on the Klever blockchain. These patterns were confirmed by the Klever team and are used in production dApps.

### Key Principles

1. **Function name** is always required
2. **Parameters** are optional (many functions take none)
3. **Encoding format** is base64
4. **Parameter separator** is `@` character
5. **Parameter values** must be ABI-encoded

---

## Basic Concepts

### What is ABI Encoding?

ABI (Application Binary Interface) encoding converts function calls and their parameters into a format that smart contracts can understand.

**Simple analogy:**
- **Human:** "Call swapKlvToDgko with 100 KLV"
- **Blockchain:** `c3dhcEtsdlRvRGdrbw==` (base64 encoded function name)

### Why Do We Need It?

Smart contracts don't understand JavaScript strings or numbers directly. They need:
- Function names in specific encoding
- Parameters in specific byte formats
- Everything converted to base64

---

## Encoding Patterns

### Pattern 1: Functions WITHOUT Parameters

**Most common pattern. Used when function only needs payment (callValue).**

```typescript
// Example: swapKlvToDgko()
const functionName = 'swapKlvToDgko';
const metadata = Buffer.from(functionName).toString('base64');

// Result: "c3dhcEtsdlRvRGdrbw=="
```

**Use this when:**
- Function signature has no parameters: `fn swap_klv_to_dgko(&self)`
- All needed info comes from payment (callValue)
- Contract reads payment with `call_value()`

**Transaction structure:**
```typescript
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

---

### Pattern 2: Functions WITH One Parameter

**Used when function takes a single argument.**

```typescript
import { abiEncoder } from '@klever/sdk';

// Example: donate(crowdfundingId: String)
const functionName = 'donate';
const crowdfundingId = 'campaign-123';

const txData = Buffer.from(
  functionName + '@' + abiEncoder.encodeABIValue(crowdfundingId, 'String', false),
  'utf8',
).toString('base64');
```

**Breakdown:**
1. Start with function name: `donate`
2. Add separator: `@`
3. Encode parameter: `abiEncoder.encodeABIValue(crowdfundingId, 'String', false)`
4. Concatenate: `donate@636f6d70616e792d313233` (hex encoded)
5. Convert to base64: `ZG9uYXRlQDYzNjY2ZDcwNjE2OTY3NmUtMzEzMjMz`

**Transaction structure:**
```typescript
{
  type: TransactionType.SmartContract,
  payload: {
    scType: 0,
    address: CONTRACT_ADDRESS,
    callValue: [...], // Optional payment
  },
  metadata: [txData], // Function name + encoded parameter
}
```

---

### Pattern 3: Functions WITH Multiple Parameters

**Used when function takes multiple arguments.**

```typescript
import { abiEncoder } from '@klever/sdk';

// Example: addLiquidity(dgkoAmount: u64, klvAmount: u64)
const functionName = 'addLiquidity';
const dgkoAmount = 1000000; // 100 DGKO (4 decimals)
const klvAmount = 500000000; // 500 KLV (6 decimals)

const txData = Buffer.from(
  functionName +
  '@' + abiEncoder.encodeABIValue(dgkoAmount, 'u64', false) +
  '@' + abiEncoder.encodeABIValue(klvAmount, 'u64', false),
  'utf8',
).toString('base64');
```

**Breakdown:**
1. Start with function name: `addLiquidity`
2. Add separator: `@`
3. Encode first parameter: `abiEncoder.encodeABIValue(dgkoAmount, 'u64', false)`
4. Add separator: `@`
5. Encode second parameter: `abiEncoder.encodeABIValue(klvAmount, 'u64', false)`
6. Concatenate all parts
7. Convert to base64

**Transaction structure:**
```typescript
{
  type: TransactionType.SmartContract,
  payload: {
    scType: 0,
    address: CONTRACT_ADDRESS,
    callValue: [...], // Optional payment
  },
  metadata: [txData], // Function name + encoded parameters
}
```

---

## Parameter Types

### Supported Types

The `abiEncoder.encodeABIValue()` function supports these types:

| Type | Rust Equivalent | Example Value | Usage |
|------|----------------|---------------|--------|
| `u8` | `u8` | `255` | Small integers (0-255) |
| `u16` | `u16` | `65535` | Medium integers |
| `u32` | `u32` | `4294967295` | Large integers |
| `u64` | `u64` | `18446744073709551615` | Very large integers |
| `String` | `String` | `"Hello"` | Text data |
| `Address` | `Address` | `"klv1..."` | Wallet addresses |
| `TokenIdentifier` | `TokenIdentifier` | `"DGKO-CXVJ"` | Token IDs |

### Type Selection Guide

**Use `u64` for:**
- Token amounts (with decimals already applied)
- Timestamps
- Large counters

**Use `String` for:**
- Campaign IDs
- Metadata
- User-provided text

**Use `Address` for:**
- Wallet addresses
- Contract addresses
- Recipient addresses

**Use `TokenIdentifier` for:**
- Token symbols (DGKO-CXVJ, KLV, etc.)
- Asset identifiers

---

## Complete Examples

### Example 1: Digiko Swap (No Parameters)

**Contract Function:**
```rust
#[endpoint(swapKlvToDgko)]
#[payable("KLV")]
fn swap_klv_to_dgko(&self) {
    let payment = self.call_value().klv_value().clone_value();
    // Uses payment, no parameters needed
}
```

**JavaScript Implementation:**
```typescript
// Step 1: Encode function name
const metadata = Buffer.from('swapKlvToDgko').toString('base64');

// Step 2: Build transaction
const tx = await account.buildTransaction(
  [
    {
      type: TransactionType.SmartContract,
      payload: {
        scType: 0,
        address: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
        callValue: [
          {
            asset: 'KLV',
            value: 100000000, // 100 KLV (6 decimals)
            kdaRoyalties: 0,
            klvRoyalties: 0,
          }
        ],
      },
    },
  ],
  [metadata], // Metadata array with function name
  {
    nonce: 123,
    sender: 'klv1...',
  }
);

// Step 3: Sign and broadcast
const signed = await web.signTransaction(tx);
const result = await broadcastTransaction(signed);
```

---

### Example 2: Crowdfunding Donation (One Parameter)

**Contract Function:**
```rust
#[endpoint(donate)]
#[payable("*")]
fn donate(&self, crowdfunding_id: String) {
    // Uses both payment and parameter
    let payment = self.call_value().single_kda();
    let campaign = self.campaigns(&crowdfunding_id).get();
}
```

**JavaScript Implementation:**
```typescript
import { abiEncoder } from '@klever/sdk';

// Step 1: Encode function with parameter
const crowdfundingId = 'campaign-123';
const txData = Buffer.from(
  'donate' + '@' + abiEncoder.encodeABIValue(crowdfundingId, 'String', false),
  'utf8',
).toString('base64');

// Step 2: Build transaction
const tx = await account.buildTransaction(
  [
    {
      type: TransactionType.SmartContract,
      payload: {
        scType: 0,
        address: CONTRACT_ADDRESS,
        callValue: [
          {
            asset: 'KLV',
            value: 50000000, // 50 KLV donation
            kdaRoyalties: 0,
            klvRoyalties: 0,
          }
        ],
      },
    },
  ],
  [txData], // Function name + encoded parameter
  {
    nonce: 123,
    sender: 'klv1...',
  }
);

// Step 3: Sign and broadcast
const signed = await web.signTransaction(tx);
const result = await broadcastTransaction(signed);
```

---

### Example 3: Add Liquidity (Multiple Parameters)

**Contract Function:**
```rust
#[endpoint(addLiquidity)]
fn add_liquidity(&self, dgko_amount: u64, klv_amount: u64) {
    // Uses parameters, no payment needed
    let dgko_reserve = self.dgko_reserve().get();
    let klv_reserve = self.klv_reserve().get();
}
```

**JavaScript Implementation:**
```typescript
import { abiEncoder } from '@klever/sdk';

// Step 1: Encode function with multiple parameters
const dgkoAmount = 1000000; // 100 DGKO (4 decimals)
const klvAmount = 500000000; // 500 KLV (6 decimals)

const txData = Buffer.from(
  'addLiquidity' +
  '@' + abiEncoder.encodeABIValue(dgkoAmount, 'u64', false) +
  '@' + abiEncoder.encodeABIValue(klvAmount, 'u64', false),
  'utf8',
).toString('base64');

// Step 2: Build transaction (no payment needed for this function)
const tx = await account.buildTransaction(
  [
    {
      type: TransactionType.SmartContract,
      payload: {
        scType: 0,
        address: CONTRACT_ADDRESS,
        // No callValue - function takes parameters instead
      },
    },
  ],
  [txData], // Function name + encoded parameters
  {
    nonce: 123,
    sender: 'klv1...',
  }
);

// Step 3: Sign and broadcast
const signed = await web.signTransaction(tx);
const result = await broadcastTransaction(signed);
```

---

## Common Mistakes

### ❌ Mistake 1: Forgetting Base64 Encoding

```typescript
// WRONG - Raw string
const metadata = 'swapKlvToDgko';

// CORRECT - Base64 encoded
const metadata = Buffer.from('swapKlvToDgko').toString('base64');
```

---

### ❌ Mistake 2: Wrong Parameter Separator

```typescript
// WRONG - Using space or comma
const txData = 'addLiquidity ' + amount;
const txData = 'addLiquidity,' + amount;

// CORRECT - Using @ separator
const txData = 'addLiquidity' + '@' + abiEncoder.encodeABIValue(amount, 'u64', false);
```

---

### ❌ Mistake 3: Not Encoding Parameters

```typescript
// WRONG - Raw parameter value
const txData = Buffer.from('donate@campaign-123').toString('base64');

// CORRECT - ABI-encoded parameter
const txData = Buffer.from(
  'donate' + '@' + abiEncoder.encodeABIValue('campaign-123', 'String', false)
).toString('base64');
```

---

### ❌ Mistake 4: Wrong Type for Parameter

```typescript
// WRONG - Using String for number
const txData = Buffer.from(
  'addLiquidity' + '@' + abiEncoder.encodeABIValue('1000000', 'String', false)
).toString('base64');

// CORRECT - Using u64 for number
const txData = Buffer.from(
  'addLiquidity' + '@' + abiEncoder.encodeABIValue(1000000, 'u64', false)
).toString('base64');
```

---

### ❌ Mistake 5: Adding Parameters to Parameterless Functions

```typescript
// WRONG - Adding unnecessary encoding
const txData = Buffer.from(
  'swapKlvToDgko' + '@' + abiEncoder.encodeABIValue(100000000, 'u64', false)
).toString('base64');

// CORRECT - Just function name (payment goes in callValue)
const metadata = Buffer.from('swapKlvToDgko').toString('base64');
```

---

## Reference Implementation

### Official Example: Crowdfunding dApp

**GitHub:** https://github.com/klever-io/kc-kapp-crowdfunding

**What to Study:**
1. Transaction building code
2. Parameter encoding examples
3. Error handling patterns
4. Payment structure
5. Frontend integration

**Key Files to Review:**
- Transaction building logic
- ABI encoding utilities
- Smart contract interaction layer

---

## Troubleshooting

### Problem: "Invalid transaction data"

**Possible Causes:**
1. Forgot base64 encoding
2. Wrong parameter separator
3. Missing `@` between function and parameters

**Solution:**
```typescript
// Verify your encoding:
const txData = Buffer.from(
  'functionName' + '@' + abiEncoder.encodeABIValue(param, 'type', false),
  'utf8',
).toString('base64');
```

---

### Problem: "Incorrect number of arguments"

**Possible Causes:**
1. Contract expects parameters but none provided
2. Contract expects no parameters but some provided
3. Wrong number of parameters

**Solution:**
- Check contract function signature
- Count expected parameters
- Match encoding pattern to contract

---

### Problem: "Type mismatch"

**Possible Causes:**
1. Using wrong type in `abiEncoder.encodeABIValue()`
2. Contract expects `u64` but received `String`
3. Token amounts not in base units

**Solution:**
- Verify contract parameter types
- Use correct type in encoding
- Apply decimals to token amounts

---

### Problem: "Transaction rejected"

**Possible Causes:**
1. Contract validation failed
2. Insufficient payment
3. Wrong payment asset
4. Contract in invalid state

**Solution:**
- Check contract requirements
- Verify callValue amount and asset
- Test with contract simulation first

---

## Quick Reference Card

### Parameterless Function
```typescript
const metadata = Buffer.from('functionName').toString('base64');
```

### One Parameter
```typescript
const txData = Buffer.from(
  'functionName' + '@' + abiEncoder.encodeABIValue(param, 'type', false),
  'utf8'
).toString('base64');
```

### Multiple Parameters
```typescript
const txData = Buffer.from(
  'functionName' +
  '@' + abiEncoder.encodeABIValue(param1, 'type1', false) +
  '@' + abiEncoder.encodeABIValue(param2, 'type2', false),
  'utf8'
).toString('base64');
```

### Common Types
- Numbers: `'u64'`
- Text: `'String'`
- Addresses: `'Address'`
- Tokens: `'TokenIdentifier'`

---

## Related Documentation

**Internal:**
- `CONTRACT_DEVELOPMENT.md` - Contract development patterns
- `COMPLETE_SWAP_ADMIN_DOCUMENTATION.md` - Swap contract reference
- `KLEVER_INTEGRATION.md` - SDK integration guide
- `LESSONS_2025_12_04.md` - Forum breakthrough

**External:**
- [Klever Forum](https://forum.klever.org/)
- [Crowdfunding dApp](https://github.com/klever-io/kc-kapp-crowdfunding)
- Klever SDK Documentation

---

**Last Updated:** December 12, 2025  
**Status:** Production-ready ✅  
**Validation:** Official Klever team confirmation ✅

---

## 🚨 CRITICAL: SC Query API Format (December 12, 2025)

### The Problem

When querying smart contract view functions via `/v1.0/sc/query`, we kept getting:
```
"VMUserError:wrong number of arguments"
```

Even though we were passing the correct number of arguments!

### Root Cause: Field Name & Format Mismatch

The Klever Proxy API spec (`klever-proxy-api-spec.json`) defines:

```json
"data.SCQuery": {
    "properties": {
        "arguments": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "integer"  // 0-255 byte values
                }
            }
        }
    }
}
```

**We were using:**
```typescript
// ❌ WRONG - "args" with base64 strings
{
  scAddress: "klv1...",
  funcName: "getLpPosition",
  args: ["AQ==", "h8GLPZM3JF..."]  // base64 strings
}
```

**Correct format:**
```typescript
// ✅ CORRECT - "arguments" with byte arrays
{
  scAddress: "klv1...",
  funcName: "getLpPosition",
  arguments: [[1], [135, 193, 139, ...]]  // array of number arrays
}
```

### Why `args: []` Worked for No-Argument Functions

Functions like `getPairInfoPair1` that take no arguments worked because:
1. `args` is not a valid field in the API spec
2. Invalid fields are silently ignored
3. Empty arguments = no arguments = correct for those functions!

### The Fix

1. **Field name**: Use `arguments` NOT `args`
2. **Format**: Array of byte arrays (`number[][]`), NOT base64 strings
3. **u64 encoding**: Minimal encoding (no leading zeros)
   - `1` → `[1]` NOT `[0,0,0,0,0,0,0,1]`
4. **Address encoding**: Decode bech32 to 32-byte array
   - `klv1...` → `[135, 193, 139, ...]` (32 bytes)

### Helper Functions

```typescript
// Convert BigInt to byte array (minimal encoding)
function bigintToByteArray(value: bigint): number[] {
  if (value === 0n) return [0];
  const bytes: number[] = [];
  let temp = value;
  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn));
    temp = temp >> 8n;
  }
  return bytes;
}

// Convert hex string to byte array
function hexToByteArray(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

// Convert Klever bech32 address to byte array
function addressToByteArray(address: string): number[] {
  const hex = kleverAddressToHex(address);
  return hexToByteArray(hex);
}
```

### Complete Working Example

```typescript
// Query LP position for an address
const pairIdBytes = bigintToByteArray(BigInt(1));  // [1]
const addressBytes = addressToByteArray("klv1...");  // 32-byte array

const response = await fetch(`${apiUrl}/v1.0/sc/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scAddress: contractAddress,
    funcName: 'getLpPosition',
    arguments: [pairIdBytes, addressBytes],  // ✅ Correct!
  }),
});
```

### Key Takeaways

1. **Always check the API spec** (`klever-proxy-api-spec.json`)
2. **Field names matter** - `arguments` NOT `args`
3. **Encoding matters** - byte arrays NOT base64 strings
4. **Test with simple functions first** - then add arguments
5. **Log the request body** - to verify what's actually being sent

---

**Added:** December 12, 2025  
**Impact:** Fixed all LP query functions (getLpPosition, getTotalShares, isLp, getPendingDeposits)
