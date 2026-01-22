# DISCOVERY: Single Transaction Liquidity with KLV + KDA

**Date:** December 26, 2025  
**Discovery Source:** Transaction from another DEX on Klever blockchain

## 🔴 Previous Assumption (WRONG!)

We believed that Klever blockchain cannot send KLV + KDA tokens in the same transaction, which led us to implement a 3-step pending liquidity system:

1. Deposit KDA token → pending storage
2. Deposit KLV → pending storage  
3. Call finalizeLiquidity() to mint LP shares

This was based on the Klever documentation stating:
> "On the Klever network, it is not possible to simultaneously send KLV and any KDA token."

## 🟢 Actual Reality (PROVEN BY TRANSACTION)

Another DEX successfully sends BOTH KLV and KDA tokens in a single transaction!

### Proof Transaction

```json
{
  "hash": "60b91a8c352533869bb6aae6d0ca1544bc502655fd820cf391a4537192e13519",
  "blockNum": 27467183,
  "sender": "klv1l4vc79t4a7axpkcm6dflu9td9s5r8fdg2wkaj0w7lxglt38x4f8sfp275x",
  "status": "success",
  "contract": [
    {
      "type": 63,
      "typeString": "SmartContractType",
      "parameter": {
        "address": "klv1qqqqqqqqqqqqqpgqy0f3znwexemrmggt7eqjznw3yj90tsau02ts4a5xht",
        "callValue": [
          {
            "asset": "KUNAI-18TK",
            "value": 7949608947
          },
          {
            "asset": "KLV",
            "value": 99999999988
          }
        ],
        "type": "SCInvoke"
      }
    }
  ]
}
```

### Key Difference: `callValue` Format

**Their format (WORKS with multiple tokens):**
```json
"callValue": [
  { "asset": "KUNAI-18TK", "value": 7949608947 },
  { "asset": "KLV", "value": 99999999988 }
]
```

**Our format (SINGLE token only):**
```typescript
callValue: {
  "KLV": 1000000,  // Object format with asset as key
}
```

### Function Call Decoded

The `data` field `6d696e7440303940303164373736653632364031373261613938333030` decodes to:
```
mint@09@01d776e626@172aa98300
```
- `mint` - add liquidity function
- `09` - pair ID (9 in decimal)
- `01d776e626` - minimum token expected (7,949,608,486)
- `172aa98300` - minimum KLV expected (99,999,999,744)

## Contract Side Handling

The other DEX's contract likely uses one of these patterns:

```rust
// Pattern 1: Accept any payment
#[endpoint(mint)]
#[payable("*")]
fn mint(&self, pair_id: u64, min_token_a: BigUint, min_token_b: BigUint) {
    let payments = self.call_value().any_payment();
    // Process both KLV and KDA from payments
}

// Pattern 2: All fungible payments  
#[endpoint(mint)]
#[payable("*")]
fn mint(&self, pair_id: u64, min_token_a: BigUint, min_token_b: BigUint) {
    let payments = self.call_value().all_kda_transfers();
    // Or maybe there's a method that includes KLV too
}
```

## Next Steps

1. **Test the array format** with Klever Extension to see if it works
2. **Update our contract** to accept multiple payments using `any_payment()` or equivalent
3. **Update our frontend** to build transactions with array-format callValue
4. **Simplify user flow** from 3 steps to 1 step!

## Questions to Resolve

1. Does the Klever Extension's `buildTransaction` accept the array format?
2. What's the exact SDK pattern to send multiple assets?
3. Do we need to update `klever/sdk-web` to a newer version?

## Impact if Confirmed

If we can send KLV + KDA in single transaction:
- **Remove pending liquidity system** completely
- **Single-click liquidity addition** for users
- **Better UX** - no more 3-step process
- **Lower gas costs** - one transaction instead of three
- **Simpler contract** - no pending storage needed

## Contract Address to Study

The other DEX contract: `klv1qqqqqqqqqqqqqpgqy0f3znwexemrmggt7eqjznw3yj90tsau02ts4a5xht`

We should analyze this contract's functions to understand their implementation.
