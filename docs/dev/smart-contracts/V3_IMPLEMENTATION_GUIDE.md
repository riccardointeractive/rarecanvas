# V3 Community Liquidity Pool - Implementation Guide

## Overview

This document provides step-by-step instructions for implementing the V3 Community Liquidity Pool system, which transforms Digiko DEX from a single-owner model to a community-owned liquidity pool.

## Files Created

### 1. Smart Contract
**File:** `contract/src/lib_v3.rs`

The complete V3 smart contract with:
- Public liquidity addition (anyone can add)
- Share-based ownership tracking
- Proportional fee distribution (owner gets 1% from own liquidity, 0.1% from LP liquidity)
- LP fee claiming mechanism
- Migration helpers for V2 → V3

### 2. Design Document
**File:** `docs/dev/smart-contracts/V3_COMMUNITY_LIQUIDITY_DESIGN.md`

Complete architecture documentation including:
- Fee distribution formulas
- Share calculation algorithms
- Storage structure
- Migration strategy

### 3. Frontend Types
**File:** `src/app/swap/types/lp.types.ts`

TypeScript types for:
- LP positions
- Transaction parameters
- Pool information
- Helper functions

### 4. Frontend Hook
**File:** `src/app/swap/hooks/useLiquidityProvider.ts`

React hook providing:
- Position fetching
- Liquidity management (add/remove)
- Fee claiming
- Share estimation

### 5. Frontend Component
**File:** `src/app/swap/components/LiquidityProviderPanel.tsx`

UI component with:
- Collapsible LP panel
- Add/Remove/Claim tabs
- Position display
- Fee tracking

---

## Implementation Steps

### Phase 1: Smart Contract Deployment

#### Step 1.1: Replace Contract Source
```bash
cd contract/src
mv lib.rs lib_v2_backup.rs
mv lib_v3.rs lib.rs
```

#### Step 1.2: Build Contract
```bash
cd contract/meta
cargo run clean
cargo run build
```

#### Step 1.3: Deploy to Testnet
1. Upload `contract/output/digiko-swap.wasm` to testnet
2. Initialize with `init()`
3. Test all endpoints

#### Step 1.4: Create Trading Pair (testnet)
```
Endpoint: createPair
Args: [token_a, token_b, token_a_is_klv, token_b_is_klv, fee_percent]
Example: ["DGKO-XXXX", "KLV", false, true, 1]
```

#### Step 1.5: Add Owner Liquidity
```
For DGKO: ownerAddLiquidityA(pair_id) with DGKO payment
For KLV: ownerAddLiquidityBKlv(pair_id) with KLV payment
```

### Phase 2: Frontend Integration

#### Step 2.1: Update Environment
```env
# .env.local
NEXT_PUBLIC_DEX_V3_CONTRACT=klv1xxx...  # New V3 contract address
```

#### Step 2.2: Add LP Panel to Swap Page

Edit `src/app/swap/page.tsx`:
```tsx
import { LiquidityProviderPanel } from './components/LiquidityProviderPanel';

// Inside the component, after swap interface:
<LiquidityProviderPanel
  pairId={selectedPair.id}
  tokenASymbol={selectedPair.tokenA.symbol}
  tokenBSymbol={selectedPair.tokenB.symbol}
  tokenADecimals={selectedPair.tokenA.decimals}
  tokenBDecimals={selectedPair.tokenB.decimals}
  tokenAIsKlv={selectedPair.tokenA.isKlv}
  tokenBIsKlv={selectedPair.tokenB.isKlv}
  userBalanceA={balances.tokenA}
  userBalanceB={balances.tokenB}
/>
```

#### Step 2.3: Update Contract Utils

Add to `src/utils/smartContractUtils.ts`:
```typescript
export async function invokeSmartContract(
  contractAddress: string,
  endpoint: string,
  args: string[],
  value?: bigint,
  tokenId?: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Implementation for executing contract calls
  // Use existing buildTransaction pattern
}
```

### Phase 3: Migration (V2 → V3)

#### Step 3.1: Preserve V2 Reserves
```
Query V2 contract for current reserves:
- pair_reserve_a
- pair_reserve_b
- pair_fees_a (claim first)
- pair_fees_b (claim first)
```

#### Step 3.2: Claim V2 Fees
```
Call withdrawFeesA(pair_id) and withdrawFeesB(pair_id) on V2
```

#### Step 3.3: Create Pair on V3
```
Call createPair() with same configuration
```

#### Step 3.4: Add Liquidity to V3
```
Using owner liquidity functions:
- ownerAddLiquidityA / ownerAddLiquidityAKlv
- ownerAddLiquidityB / ownerAddLiquidityBKlv
```

#### Step 3.5: Update Frontend Config
```typescript
// src/config/app.ts or similar
export const CONTRACTS = {
  DEX_V2: 'klv1old...', // Keep for reference
  DEX_V3: 'klv1new...', // Primary contract
};
```

### Phase 4: Testing

#### Unit Tests
- [ ] Share calculation (first deposit, subsequent deposits)
- [ ] Fee distribution (owner ratio, LP ratio)
- [ ] Withdrawal amounts
- [ ] Edge cases (empty pool, single LP)

#### Integration Tests
- [ ] Full swap with fee tracking
- [ ] Add liquidity flow
- [ ] Remove liquidity flow
- [ ] Claim fees flow
- [ ] Multiple LPs scenario

#### Testnet Verification
- [ ] Deploy and initialize
- [ ] Owner adds liquidity
- [ ] Execute swaps, verify fees accumulate
- [ ] Public LP adds liquidity
- [ ] Verify fee distribution is correct
- [ ] LP claims fees
- [ ] LP removes liquidity

### Phase 5: Mainnet Deployment

#### Pre-deployment Checklist
- [ ] All testnet tests pass
- [ ] Security review complete
- [ ] Frontend fully integrated
- [ ] Documentation updated
- [ ] Community announcement prepared

#### Deployment Steps
1. Deploy V3 contract to mainnet
2. Create trading pair(s)
3. Migrate liquidity from V2
4. Update frontend to point to V3
5. Announce to community
6. Monitor for issues

---

## Contract Endpoint Reference

### Admin (Owner Only)
| Endpoint | Description |
|----------|-------------|
| `createPair` | Create new trading pair |
| `setPairActive` | Enable/disable pair |
| `setPairFee` | Update fee percentage |
| `ownerAddLiquidityA` | Add token A (owner, 1% rate) |
| `ownerAddLiquidityB` | Add token B (owner, 1% rate) |
| `ownerAddLiquidityAKlv` | Add KLV to A (owner, 1% rate) |
| `ownerAddLiquidityBKlv` | Add KLV to B (owner, 1% rate) |
| `ownerRemoveLiquidity` | Remove owner liquidity |
| `ownerClaimFees` | Claim owner fees |
| `migrateExistingLiquidity` | V2→V3 migration helper |

### Public LP Functions
| Endpoint | Description |
|----------|-------------|
| `addLiquidityA` | Add token A (LP, 0.9% rate) |
| `addLiquidityB` | Add token B (LP, 0.9% rate) |
| `addLiquidityAKlv` | Add KLV to A (LP, 0.9% rate) |
| `addLiquidityBKlv` | Add KLV to B (LP, 0.9% rate) |
| `removeLiquidity` | Remove LP liquidity |
| `claimLpFees` | Claim LP fees |

### Swap Functions
| Endpoint | Description |
|----------|-------------|
| `swapAtoB` | Swap token A → B |
| `swapBtoA` | Swap token B → A |
| `swapKlvToB` | Swap KLV → B (when A is KLV) |
| `swapKlvToA` | Swap KLV → A (when B is KLV) |

### View Functions
| Endpoint | Returns |
|----------|---------|
| `getReserves` | (reserve_a, reserve_b) |
| `getPairInfo` | Full pair configuration |
| `getTotalShares` | (owner_shares, total_lp_shares) |
| `getOwnerFees` | (unclaimed_a, unclaimed_b) |
| `getLpPosition` | (shares, pending_a, pending_b, pool_share) |
| `getLpCount` | Number of LPs |
| `isLp` | Check if address is LP |
| `getRegisteredPairs` | List of pair IDs |

---

## Fee Distribution Example

**Scenario:**
- Pool: 1000 DGKO / 100 KLV
- Owner: 30% of shares
- LP1: 40% of shares
- LP2: 30% of shares
- Swap generates 10 DGKO fee

**Distribution:**
```
Owner gets:
  From own liquidity: 10 × 30% × 1.0 = 3.0 DGKO
  From LP fees: 10 × 70% × 0.1 = 0.7 DGKO
  Total: 3.7 DGKO

LP1 gets:
  10 × 70% × 0.9 × (40/70) = 3.6 DGKO

LP2 gets:
  10 × 70% × 0.9 × (30/70) = 2.7 DGKO

Total: 3.7 + 3.6 + 2.7 = 10.0 DGKO ✓
```

---

## Troubleshooting

### Common Issues

**1. "Pair does not exist"**
- Verify pair_id is correct
- Check pair was created successfully

**2. "Wrong token sent"**
- Ensure token ID matches pair configuration
- Use KLV endpoints for native KLV

**3. "Insufficient LP shares"**
- Check position has enough shares
- Verify shares haven't been removed

**4. "No fees to claim"**
- Fees accumulate from swaps
- Wait for swap activity

**5. Frontend not updating**
- Clear .next cache
- Check contract address in env

---

## Security Considerations

1. **Reentrancy**: All state changes before external calls
2. **Integer overflow**: BigUint used throughout
3. **Front-running**: Slippage protection on swaps
4. **Share manipulation**: Proper share calculation logic
5. **Fee precision**: 1e12 precision factor prevents dust accumulation

---

## Next Steps

After successful V3 deployment:
1. Add APR calculation and display
2. Add historical LP analytics
3. Consider LP token (ERC-20 style) for DeFi composability
4. Implement multi-pair UI for portfolio view
5. Add LP leaderboard/rewards program

---

**Version:** 1.0
**Created:** December 2025
**Status:** Implementation Ready
