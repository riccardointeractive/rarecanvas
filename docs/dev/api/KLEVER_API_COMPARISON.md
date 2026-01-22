# Klever APIs: Proxy vs Node Server

**Date:** December 1, 2025  
**Purpose:** Understand which API to use for different tasks

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Your App  │
└─────┬───────┘
      │
      ├─────────────────────┬─────────────────────┐
      │                     │                     │
      v                     v                     v
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Klever SDK │     │  Proxy API   │     │ Node Server │
│             │     │              │     │             │
│ • Signing   │     │ • Analytics  │     │ • Direct    │
│ • Wallet    │     │ • Indexed    │     │ • Raw       │
│ • Txs       │     │ • Aggregated │     │ • Real-time │
└─────────────┘     └──────────────┘     └─────────────┘
      │                     │                     │
      └─────────────────────┴─────────────────────┘
                            │
                            v
                  ┌──────────────────┐
                  │ Klever Blockchain│
                  └──────────────────┘
```

## 📊 Quick Comparison

| Feature | Proxy API | Node Server | SDK |
|---------|-----------|-------------|-----|
| **Host** | `api.mainnet.klever.org` | `node.mainnet.klever.finance` | N/A |
| **Purpose** | Analytics & indexed data | Direct blockchain access | Transaction signing |
| **Endpoints** | 80+ | 38 | N/A |
| **Use for** | Dashboards, stats | Gas estimates, simulations | Write operations |
| **Data** | Historical, aggregated | Real-time, raw | N/A |
| **Speed** | Fast (indexed) | Slower (chain queries) | N/A |
| **Best for** | Read-heavy apps | Precise calculations | All transactions |

---

## 🎯 PROXY API (api.mainnet.klever.org)

**What it is:** Indexed blockchain data with analytics

### Endpoints (80+)

**Unique to Proxy:**
```
✅ POST /v1.0/sc/query                     - Smart contract queries
✅ GET  /v1.0/sc/invokes/{scAddress}       - Contract invocations
✅ GET  /v1.0/assets/pool/list             - All KDA pools
✅ GET  /v1.0/assets/pool/{poolID}         - Pool details
✅ GET  /v1.0/address/lastclaim            - Claim status
✅ GET  /v1.0/marketplaces/*               - NFT marketplace
✅ GET  /v1.0/validator/*                  - Validator stats
✅ GET  /v1.0/assets/holders/{assetID}     - Token holders
✅ GET  /v1.0/transaction/list             - Transaction history
✅ GET  /v1.0/block/statistics-*           - Block statistics
```

### When to Use

**✅ Perfect for:**
- Dashboard data (balances, history)
- Analytics (holders, volume)
- Pool information for DEX
- Transaction history
- Contract usage tracking
- Token holder distribution
- Historical data queries

**❌ NOT for:**
- Gas estimation
- Transaction simulation
- Direct VM queries
- Real-time pool reserves (use Node for precision)

### Example Use Cases

**Dashboard:**
```typescript
// Get all user data in one call
GET /v1.0/address/{address}/overview
// Returns: KLV, all KDAs, staking buckets
```

**Analytics:**
```typescript
// Track DGKO holders
GET /v1.0/assets/holders/DGKO

// Track swap contract usage
GET /v1.0/sc/invokes/klv1qqq...swap-contract
```

**DEX Information:**
```typescript
// Get all pools
GET /v1.0/assets/pool/list

// Get specific pool
GET /v1.0/assets/pool/{poolID}
```

---

## 🔧 NODE SERVER (node.mainnet.klever.finance)

**What it is:** Direct blockchain node access (raw data)

### Endpoints (38)

**Unique to Node Server:**
```
🔧 POST /transaction/simulate          - Simulate gas consumption
🔧 POST /transaction/estimate-fee      - Estimate transaction fees
🔧 POST /vm/query                      - VM queries (raw)
🔧 POST /vm/hex                        - Decode as hex
🔧 POST /vm/int                        - Decode as big int
🔧 POST /vm/string                     - Decode as string
🔧 GET  /transaction/pool              - Memory pool
🔧 GET  /node/metrics                  - Node metrics
🔧 POST /node/debug                    - Debug information
🔧 POST /node/set-redundancy           - Node configuration
```

### When to Use

**✅ Perfect for:**
- **Gas estimation** before transactions
- **Fee calculation** for swaps/stakes
- **Transaction simulation** (test before broadcast)
- **Precise pool reserves** (real-time)
- VM queries (raw smart contract data)
- Node health monitoring
- Real-time blockchain state

**❌ NOT for:**
- Historical data (use Proxy)
- Analytics (use Proxy)
- Token holder lists (use Proxy)
- Transaction history (use Proxy)

### Example Use Cases

**Before Swap Transaction:**
```typescript
// Estimate gas and fees
POST /transaction/estimate-fee
{
  "type": 17,
  "sender": "klv1...",
  // ... transaction data
}

// Returns:
{
  "gas": 5000000,
  "fee": 0.5,
  "totalCost": 5.5
}
```

**Simulate Transaction:**
```typescript
// Test transaction before sending
POST /transaction/simulate
{
  // Same structure as real transaction
}

// Returns gas consumption without broadcasting
```

**VM Query (Raw Contract Data):**
```typescript
// Query smart contract directly
POST /vm/query
{
  "scAddress": "klv1qqq...",
  "funcName": "getReserves",
  "args": []
}

// Decode response
POST /vm/hex
POST /vm/int
POST /vm/string
```

**Precise Pool Reserves:**
```typescript
// Get exact reserves for swap calculation
GET /asset/pool/{poolID}
// More precise than Proxy (direct from chain)
```

---

## 🎪 WHEN TO USE WHAT (Digiko Use Cases)

### Dashboard

**Account Overview:**
```typescript
✅ Proxy: /v1.0/address/{address}/overview
   → Fast, includes staking buckets, all KDAs
```

**Transaction History:**
```typescript
✅ Proxy: /v1.0/address/{address}/transactions
   → Paginated, filterable, indexed
```

### Staking

**Check Stake Amount:**
```typescript
🔧 Node: /vm/query → getUserStake()
   → Precise, real-time contract state
```

**Track Stakers:**
```typescript
✅ Proxy: /v1.0/sc/invokes/{stakingContract}
   → All staking transactions, analytics
```

**Check Claim Eligibility:**
```typescript
✅ Proxy: /v1.0/address/lastclaim
   → Indexed claim data
```

### DEX/Swap

**Display Available Pools:**
```typescript
✅ Proxy: /v1.0/assets/pool/list
   → All pools with stats
```

**Calculate Swap Quote:**
```typescript
🔧 Node: /asset/pool/{poolID}
   → Precise reserves for calculation
   
Then:
🔧 Node: /transaction/estimate-fee
   → Gas and fee estimate
```

**Execute Swap:**
```typescript
📱 SDK: web.buildTransaction()
   → Sign and broadcast
```

### Analytics

**Holder Distribution:**
```typescript
✅ Proxy: /v1.0/assets/holders/DGKO
   → All holders with percentages
```

**Contract Usage:**
```typescript
✅ Proxy: /v1.0/sc/invokes/{contract}
   → All invocations, filter by method
```

**Volume Stats:**
```typescript
✅ Proxy: /v1.0/transaction/statistics
   → Transaction volume, patterns
```

---

## 🚀 Recommended Implementation Strategy

### Phase 1: Proxy API (Quick Wins)

**Replace dashboard SDK calls:**
```typescript
// Before: 5 SDK calls
const klv = await provider.getBalance(address);
const dgko = await provider.getKDA(address, 'DGKO');
const baby = await provider.getKDA(address, 'BABYDGKO');
const nonce = await provider.getNonce(address);
const allowances = await provider.getAllowances(address);

// After: 1 Proxy call
const response = await fetch(
  `https://api.mainnet.klever.org/v1.0/address/${address}/overview`
);
// Get everything in one call!
```

**Benefits:** Immediate performance boost, no blockers

### Phase 2: Node Server (Precision)

**Add to swap flow:**
```typescript
// Before swap:
1. Proxy: Get pool info (for display)
2. Node: Get precise reserves (for calculation)
3. Node: Estimate fees (show user)
4. Node: Simulate transaction (validate)
5. SDK: Broadcast transaction (execute)
```

**Benefits:** More accurate quotes, better UX

### Phase 3: Analytics (Advanced)

**Build analytics dashboard:**
```typescript
// Use Proxy for:
- Holder charts
- Volume graphs
- Usage timeline
- Top stakers

// Use Node for:
- Real-time contract state
- Live pool reserves
- Gas price trends
```

**Benefits:** Marketing tool, user insights

---

## 📋 Endpoint Comparison Matrix

### Address/Account Data

| Operation | Proxy | Node | Best Choice |
|-----------|-------|------|-------------|
| Get balance | ✅ | ✅ | Proxy (faster, includes KDAs) |
| Get KDA balance | ✅ | ✅ | Proxy (includes all at once) |
| Get nonce | ✅ | ✅ | Either (both fast) |
| Get allowances | ✅ | ✅ | Proxy (paginated list) |
| Account overview | ✅ | ❌ | Proxy (only option) |
| Transaction history | ✅ | ❌ | Proxy (indexed) |

### Transaction Operations

| Operation | Proxy | Node | Best Choice |
|-----------|-------|------|-------------|
| Get transaction | ✅ | ✅ | Either |
| Estimate fee | ❌ | ✅ | Node (only option) |
| Simulate tx | ❌ | ✅ | Node (only option) |
| Broadcast tx | ✅ | ✅ | Node (direct) |
| Transaction pool | ❌ | ✅ | Node (real-time) |
| Tx statistics | ✅ | ❌ | Proxy (analytics) |

### Smart Contracts

| Operation | Proxy | Node | Best Choice |
|-----------|-------|------|-------------|
| Query contract | ✅ `/sc/query` | ✅ `/vm/query` | Both (different formats) |
| Track invocations | ✅ | ❌ | Proxy (indexed history) |
| VM decode | ❌ | ✅ | Node (hex/int/string) |
| Contract stats | ✅ | ❌ | Proxy (analytics) |

### Assets/Pools

| Operation | Proxy | Node | Best Choice |
|-----------|-------|------|-------------|
| List pools | ✅ | ❌ | Proxy (all pools) |
| Get pool | ✅ | ✅ | Node (precise reserves) |
| Asset holders | ✅ | ❌ | Proxy (indexed list) |
| Asset info | ✅ | ✅ | Either |

---

## 🎯 Decision Tree

```
Need to READ data?
│
├─ Historical/Analytics? 
│  └─ ✅ Use Proxy API
│     (faster, indexed, aggregated)
│
├─ Precise/Real-time?
│  └─ 🔧 Use Node Server
│     (accurate, direct from chain)
│
└─ Need to WRITE?
   └─ 📱 Use SDK
      (only option for transactions)
```

---

## 📚 Documentation Files

**Proxy API Docs:**
- `KLEVER_PROXY_API_OVERVIEW.md` - Complete reference
- `KLEVER_PROXY_SMART_CONTRACTS.md` - Contract queries
- `KLEVER_PROXY_STAKING.md` - Staking endpoints
- `KLEVER_PROXY_DEX.md` - Pool endpoints
- `contract/klever-proxy-api-spec.json` - Full spec

**Node Server Docs:**
- `KLEVER_NODE_SERVER_API.md` - Complete reference (TO CREATE)
- `contract/klever-node-api-spec.json` - Full spec (SAVED)

**Integration:**
- `KLEVER_INTEGRATION.md` - SDK patterns (existing)

---

## 🎪 Summary

**Use Proxy for:** 90% of read operations  
**Use Node for:** Precision calculations, simulations  
**Use SDK for:** 100% of write operations

**Together:** Complete blockchain toolkit! 🚀

---

**Next Steps:**
1. ✅ Implement Proxy API for dashboard (quick win)
2. ⏳ Add Node Server for swap fee estimation
3. ⏳ Build analytics with Proxy data

**Status:** Complete understanding of Klever API ecosystem
