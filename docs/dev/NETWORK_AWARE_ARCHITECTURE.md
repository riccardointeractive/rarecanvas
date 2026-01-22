# Network-Aware Architecture

## Overview

This refactor removes hardcoded token IDs (`DGKO-CXVJ`, `BABYDGKO-3S67`) and contract addresses from components, replacing them with a centralized, network-aware context system.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           NetworkTokensContext                       │
│   (src/context/NetworkTokensContext.tsx)            │
│   SINGLE SOURCE OF TRUTH for runtime                │
└─────────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    Components        Hooks          Utils
    (no hardcoding)  (no hardcoding) (accept params)
```

## Files Changed

### Core Context
- **`src/context/NetworkTokensContext.tsx`** - NEW: Main context providing tokens, contracts, and helper functions

### Type Definitions
- **`src/types/tradingPairs.ts`** - Updated: `getDefaultTradingPairs(network)` instead of hardcoded defaults

### Server-Side Utilities
- **`src/lib/klever-node.ts`** - Updated: All functions accept `network` parameter

### Storage
- **`src/utils/tradingPairsStorage.ts`** - Updated: Network-specific localStorage keys

### Components
- **`src/components/TokenImage.tsx`** - Updated: Uses network from context
- **`src/app/layout.tsx`** - Updated: Added NetworkTokensProvider

### Hooks
- **`src/app/dashboard/hooks/useTokenBalances.ts`** - Updated: Uses NetworkTokensContext
- **`src/app/swap/hooks/useContractTransactions.ts`** - Updated: Uses NetworkTokensContext

## How to Use

### In React Components

```typescript
import { useNetworkTokens } from '@/context/NetworkTokensContext';

function MyComponent() {
  const { 
    getAssetId, 
    getDisplaySymbol, 
    contracts, 
    tokens,
    network,
    isTestnet 
  } = useNetworkTokens();
  
  // Get asset ID for current network
  const dgkoAssetId = getAssetId('DGKO'); // 'DGKO-CXVJ' on mainnet, 'NINJA-3A4K' on testnet
  
  // Get display symbol
  const dgkoSymbol = getDisplaySymbol('DGKO'); // 'DGKO' on mainnet, 'NINJA' on testnet
  
  // Get contract address
  const dexAddress = contracts.DEX;
  
  return <div>Current network: {network}</div>;
}
```

### In Server-Side Code (API Routes)

```typescript
import { getNetworkConfig, broadcastTransaction } from '@/lib/klever-node';

// Get config for a network
const config = getNetworkConfig('testnet');
const dexAddress = config.contracts.DEX;
const dgkoAssetId = config.tokens.DGKO.assetId;

// Pass network to functions
const result = await broadcastTransaction(signedTx, 'testnet');
```

### Trading Pairs

```typescript
import { getDefaultTradingPairs } from '@/types/tradingPairs';

// Get pairs for current network
const pairs = getDefaultTradingPairs('testnet');
// Returns pairs with NINJA/KLV and IAFINANCE/KLV
```

## Token Mapping

| Internal Symbol | Mainnet Asset ID | Testnet Asset ID |
|-----------------|------------------|------------------|
| DGKO | DGKO-CXVJ | NINJA-3A4K |
| BABYDGKO | BABYDGKO-3S67 | IAFINANCE-HPKV |
| KLV | KLV | KLV |

## Migration Guide

### Replace Hardcoded Asset IDs

```typescript
// ❌ OLD - Hardcoded
const dgkoId = 'DGKO-CXVJ';

// ✅ NEW - Dynamic
const { getAssetId } = useNetworkTokens();
const dgkoId = getAssetId('DGKO');
```

### Replace Hardcoded Contract Addresses

```typescript
// ❌ OLD - Hardcoded
const DEX = 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h';

// ✅ NEW - Dynamic
const { contracts } = useNetworkTokens();
const DEX = contracts.DEX;
```

### Replace Token Display Names

```typescript
// ❌ OLD - Hardcoded
<span>DGKO</span>

// ✅ NEW - Dynamic
const { getDisplaySymbol } = useNetworkTokens();
<span>{getDisplaySymbol('DGKO')}</span> // Shows "NINJA" on testnet
```

## Remaining Hardcoded References

Some files SHOULD have hardcoded values because they ARE the source of truth:

1. `src/config/network.ts` - Network configuration definitions
2. `src/context/NetworkTokensContext.tsx` - Context token definitions
3. `src/types/tradingPairs.ts` - Trading pair definitions
4. `src/lib/klever-node.ts` - Server-side configuration
5. `src/app/token/[assetId]/config/*.tsx` - Static token information pages

Files that still need migration (low priority):
- UI components with example asset IDs
- Documentation/example sections
- Admin design system examples

## Testing

1. Switch to testnet using the network toggle
2. Verify token names show NINJA/IAFINANCE instead of DGKO/BABYDGKO
3. Verify trading pairs show correct testnet pairs
4. Verify balances fetch correctly for testnet tokens
5. Verify swap transactions use testnet contract
