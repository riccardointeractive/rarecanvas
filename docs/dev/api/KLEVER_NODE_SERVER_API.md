# Klever Node Server API - Quick Reference

**Date:** December 1, 2025  
**Host:** `node.mainnet.klever.finance`  
**Purpose:** Direct blockchain node access

---

## 🎯 When to Use Node Server

**✅ Use for:**
- Gas estimation before transactions
- Fee calculation
- Transaction simulation
- Precise pool reserves (real-time)
- VM queries (raw contract data)

**❌ Don't use for:**
- Historical data → Use Proxy API
- Analytics → Use Proxy API  
- Token holders → Use Proxy API

---

## 🔥 Critical Endpoints for Digiko

### 1. POST /transaction/estimate-fee ⭐⭐⭐
**Estimate gas and fees before sending transaction**

```typescript
POST https://node.mainnet.klever.finance/transaction/estimate-fee

Body: {
  "type": 17,  // Transaction type
  "sender": "klv1...",
  "data": {
    // Transaction-specific data
  }
}

Response: {
  "gas": 5000000,
  "fee": 0.5,
  "totalCost": 5.5
}
```

**Use before:**
- Stake transactions
- Swap transactions
- Claim transactions

### 2. POST /transaction/simulate ⭐⭐
**Test transaction without broadcasting**

```typescript
POST https://node.mainnet.klever.finance/transaction/simulate

Body: {
  // Same structure as real transaction
  "type": 17,
  "sender": "klv1...",
  "data": {}
}

Response: {
  "gasConsumed": 5000000,
  "status": "success",
  "logs": []
}
```

**Use for:**
- Validate transaction will succeed
- Check gas consumption
- Debug before broadcasting

### 3. POST /vm/query ⭐⭐⭐
**Query smart contract (raw VM access)**

```typescript
POST https://node.mainnet.klever.finance/vm/query

Body: {
  "scAddress": "klv1qqq...contract",
  "funcName": "getReserves",
  "args": [],
  "caller": "klv1..."
}

Response: {
  "returnData": ["<hex_data>"],
  "returnCode": "ok",
  "returnMessage": ""
}
```

**Then decode with:**
- `POST /vm/hex` - Decode as hex
- `POST /vm/int` - Decode as big int
- `POST /vm/string` - Decode as string

### 4. GET /asset/pool/{id}
**Get precise pool reserves**

```typescript
GET https://node.mainnet.klever.finance/asset/pool/{poolID}

Response: {
  "assetId": "pool-id",
  "reserves": {
    "KLV": 1000000000000,
    "DGKO": 500000000000
  },
  "active": true
}
```

**Use for:**
- Accurate swap quotes
- Price calculations
- Liquidity checks

---

## 📋 All Node Server Endpoints

### Address/Account (6 endpoints)
```
GET  /address/{address}                  - Account details
GET  /address/{address}/balance          - KLV balance
GET  /address/{address}/kda              - KDA balances
GET  /address/{address}/nonce            - Current nonce
GET  /address/{address}/allowance        - Allowance info
GET  /address/{address}/allowance/list   - Allowance list
```

### Transaction (7 endpoints)
```
POST /transaction/broadcast              - Send transaction
POST /transaction/decode                 - Decode transaction
POST /transaction/estimate-fee           - Estimate fees ⭐
POST /transaction/simulate               - Simulate tx ⭐
POST /transaction/send                   - Send transaction
GET  /transaction/pool                   - Memory pool
GET  /transaction/{txhash}               - Transaction details
```

### VM/Smart Contracts (4 endpoints)
```
POST /vm/query                           - Query contract ⭐
POST /vm/hex                             - Decode as hex
POST /vm/int                             - Decode as int
POST /vm/string                          - Decode as string
```

### Assets (3 endpoints)
```
GET  /asset/{id}                         - Asset info
GET  /asset/nft/{owner}/{id}             - NFT info
GET  /asset/pool/{id}                    - Pool info ⭐
```

### Blocks (2 endpoints)
```
GET  /block/by-hash/{hash}               - Block by hash
GET  /block/by-nonce/{nonce}             - Block by nonce
```

### Network (3 endpoints)
```
GET  /network/config                     - Network config
GET  /network/status                     - Network status
GET  /network/network-parameters         - Active parameters
```

### Node (10 endpoints)
```
GET  /node/overview                      - Node overview
GET  /node/status                        - Node status
GET  /node/statistics                    - Node statistics
GET  /node/metrics                       - Prometheus metrics
GET  /node/heartbeatstatus               - Heartbeat status
GET  /node/p2pstatus                     - P2P statistics
GET  /node/peerinfo                      - Peer information
GET  /node/enable-epochs                 - Epoch configuration
POST /node/debug                         - Debug info
POST /node/set-redundancy                - Set redundancy
```

### Validator (2 endpoints)
```
GET  /validator/peers                    - Validator peers
GET  /validator/statistics               - Validator stats
```

### Marketplace (1 endpoint)
```
GET  /marketplace/{id}                   - Marketplace info
```

---

## 💡 Implementation Examples

### Before Swap: Estimate Fees

```typescript
async function estimateSwapFee(
  fromToken: string,
  toToken: string,
  amount: number
) {
  const transaction = {
    type: 17, // SmartContract type
    sender: userAddress,
    data: {
      contractAddress: SWAP_CONTRACT,
      callValue: fromToken === 'KLV' ? amount : undefined,
      kda: fromToken !== 'KLV' ? {
        assetId: fromToken,
        amount: amount
      } : undefined
    }
  };
  
  const response = await fetch(
    'https://node.mainnet.klever.finance/transaction/estimate-fee',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    }
  );
  
  const result = await response.json();
  
  return {
    gas: result.gas,
    fee: result.fee,
    total: result.totalCost
  };
}
```

### Query Pool Reserves

```typescript
async function getPoolReserves(poolID: string) {
  const response = await fetch(
    `https://node.mainnet.klever.finance/asset/pool/${poolID}`
  );
  
  const result = await response.json();
  
  return {
    reserveA: result.reserves.KLV,
    reserveB: result.reserves.DGKO,
    active: result.active
  };
}
```

### Query Smart Contract

```typescript
async function queryContract(
  contractAddress: string,
  funcName: string,
  args: any[] = []
) {
  // Query contract
  const queryResponse = await fetch(
    'https://node.mainnet.klever.finance/vm/query',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: contractAddress,
        funcName: funcName,
        args: args
      })
    }
  );
  
  const queryResult = await queryResponse.json();
  
  // Decode result as integer
  const decodeResponse = await fetch(
    'https://node.mainnet.klever.finance/vm/int',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hex: queryResult.returnData[0]
      })
    }
  );
  
  const decoded = await decodeResponse.json();
  return decoded.value;
}
```

---

## 🚨 Important Notes

### Mainnet vs Testnet

**Testnet:**
- Host: `node.testnet.klever.org`
- For testing only

**Mainnet:**
- Host: `node.mainnet.klever.finance`
- Production use

### Rate Limiting

- Node Server may have rate limits
- Implement caching for frequent queries
- Use Proxy API for high-frequency reads

### Error Handling

```typescript
async function safeNodeQuery(endpoint: string, body?: any) {
  try {
    const response = await fetch(
      `https://node.mainnet.klever.finance${endpoint}`,
      {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Node query failed:', error);
    throw error;
  }
}
```

---

## 🎯 Recommended Usage for Digiko

### Swap Flow (Enhanced)

```typescript
// 1. Get pool reserves (Node - precise)
const reserves = await getPoolReserves(poolID);

// 2. Calculate quote
const quote = calculateSwapQuote(inputAmount, reserves);

// 3. Estimate fee (Node - required)
const fees = await estimateSwapFee(fromToken, toToken, inputAmount);

// 4. Show user total cost
const totalCost = quote.outputAmount + fees.fee;

// 5. User confirms

// 6. Simulate (Node - optional but recommended)
const simulation = await simulateTransaction(txData);

// 7. Broadcast (SDK)
const result = await web.sendTransaction(tx);
```

### Staking Flow (Enhanced)

```typescript
// 1. Query current stake (Node VM)
const currentStake = await queryContract(
  STAKING_CONTRACT,
  'getUserStake',
  [userAddress]
);

// 2. Estimate fee (Node)
const fee = await estimateStakeFee(amount);

// 3. Show user
console.log(`Stake ${amount} DGKO`);
console.log(`Fee: ${fee.fee} KLV`);

// 4. User confirms

// 5. Broadcast (SDK)
const result = await stakeTokens(amount);
```

---

## 🔗 Related Documentation

- **[KLEVER_API_COMPARISON.md](./KLEVER_API_COMPARISON.md)** - When to use which API
- **[KLEVER_PROXY_API_OVERVIEW.md](./KLEVER_PROXY_API_OVERVIEW.md)** - Proxy API reference
- **[KLEVER_INTEGRATION.md](./KLEVER_INTEGRATION.md)** - SDK integration

---

**Status:** ✅ Complete Node Server reference  
**Spec File:** `contract/klever-node-api-spec.json`  
**Next:** Implement fee estimation in swap flow
