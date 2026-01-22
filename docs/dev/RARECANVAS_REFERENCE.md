# RareCanvas Reference - Extracted Knowledge

> Documento di riferimento estratto dal codebase RareCanvas.
> Contiene API endpoints, transaction types, e patterns utili per l'implementazione del marketplace NFT.

---

## Klever NFT Transaction Types

### Type 17 - Buy Contract

```typescript
// Buy NFT from marketplace
const payload = {
  buyType: 1,           // 1 = MarketBuy
  id: orderId,          // Order ID from listing
  currencyId: "KLV",
  amount: price * 1e6   // Price in precision 6
};
const contract = { type: 17, payload };

// Buy from ITO
const payload = {
  buyType: 0,           // 0 = ITOBuy
  id: assetId,          // Asset ID (e.g., "COLLECTION-XXXX")
  amount: packAmount,
  currencyId: currencyId
};
```

### Type 18 - Sell Contract (List NFT)

```typescript
const payload = {
  marketType: 0,                    // 0 = BuyItNow
  marketplaceId: "417b70c0eb7a33cb", // Marketplace ID
  assetId: `${collectionId}/${nftId}`, // e.g., "MYNFT-ABC1/42"
  currencyId: "KLV",
  price: listingPrice * 1e6,        // Price in precision 6
  endTime: unixTimestamp            // Listing expiry (unix seconds)
};
const contract = { type: 18, payload };
```

### Type 19 - Cancel Market Order

```typescript
const payload = {
  claimType: 2,
  orderId: orderId
};
const contract = { type: 19, payload };
```

### Type 9 - Claim Contract (Claim expired listing)

```typescript
const payload = {
  claimType: 2,
  id: orderId
};
const contract = { type: 9, payload };
```

---

## Klever Marketplace IDs

```typescript
export const KLEVER_MARKETPLACES = {
  'RARE_CANVAS':     '417b70c0eb7a33cb',
  'KLEVER_NFT':      'd4f2bab340c55fde',
  'XPORT':           'aa68ad853a09988c',
  'NFT_ART_GALLERY': 'd2a04fe890a6edda',
  'MINTHREE':        '2936933ee43db509',
  'SKY_GALLERY':     '7c353c02770da029',
  'KDEX':            '116056b257d9f6d5',
  'WORLD_DEX':       '81376f526cf47730'
} as const;

export type MarketplaceId = typeof KLEVER_MARKETPLACES[keyof typeof KLEVER_MARKETPLACES];
```

---

## Exchange Address

L'indirizzo speciale dove gli NFT listati vengono "parcheggiati":

```typescript
export const KLEVER_EXCHANGE_ADDRESS = "klv1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllsymmgky";
```

Quando un NFT è listato:
- `nftOwner === EXCHANGE_ADDRESS` → NFT è in vendita
- Controllare `sender` della transazione di listing per sapere chi è il vero proprietario

---

## API Endpoints

### Collections & Assets

```typescript
// Lista tutti gli assets (NFT collections)
GET /v1.0/assets/list?page={page}&limit=100

// Dettagli singolo asset
GET /v1.0/assets/{assetId}

// Lista assets di un owner
GET /v1.0/assets/list?owner={walletAddress}

// NFT holder (chi possiede un NFT specifico)
GET /v1.0/assets/nft/holder/{collectionId}/{nftId}
```

### Marketplace

```typescript
// Stats di un marketplace (volume, floor, items, owners per collection)
GET /v1.0/marketplaces/{marketplaceId}/stats

// NFT listings di un marketplace
GET /marketplaces/{marketplaceId}?collection={collectionId}&price=desc&limit=50&page={page}

// Activity di un NFT specifico
GET /marketplaces/nfts/activity?nftId={collectionId}/{nftId}&sort=desc&limit=10&page={page}
```

### Transactions

```typescript
// Lista transazioni con filtri
GET /v1.0/transaction/list?limit={limit}&page={page}&type={type}&status=success

// Transaction types utili:
// type=17 → Buy transactions
// type=18 → Sell/List transactions
// type=19 → Cancel transactions

// Transazioni per order ID
GET /v1.0/transaction/list?orderid={orderId}

// Transazioni per wallet
GET /v1.0/transaction/list?fromAddress={walletAddress}
GET /v1.0/transaction/list?toAddress={walletAddress}
```

### Account

```typescript
// Dettagli account (balance, assets, etc.)
GET /v1.0/address/{walletAddress}

// NFT posseduti da un wallet in una collection
GET /v1.0/address/{walletAddress}/collection/{collectionId}?limit=20&page={page}

// Staking allowances
GET /v1.0/address/{walletAddress}/allowance/list?asset=KLV
```

### Altri

```typescript
// Lista ITO attivi
GET /v1.0/ito/list?page=1&limit=100

// Lista validatori
GET /v1.0/validator/list?limit=100&page={page}

// Epoch corrente
GET /v1.0/epoch/list?page=1&limit=1
// → pagination.totalRecords = current epoch number
```

---

## IPFS Gateway Handling

Klever usa diversi gateway IPFS. Pattern per normalizzare:

```typescript
export function normalizeIpfsUrl(url: string): string {
  if (!url) return url;
  
  // Klever Pinata → IPFS.io
  if (url.includes('klever-mint.mypinata.cloud')) {
    return url.replace('https://klever-mint.mypinata.cloud', 'https://ipfs.io');
  }
  
  // Raw CID → IPFS.io
  if (url.match(/^Qm[a-zA-Z0-9]{44}$/)) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  return url;
}

// Fallback chain per metadata
export function getMetadataUrl(baseUri: string, nftId: string): string[] {
  const normalized = normalizeIpfsUrl(baseUri);
  
  return [
    `${normalized}/${nftId}.json`,
    `${normalized}/${nftId}`,
    `https://${baseUri}.ipfs.w3s.link/${nftId}`  // Web3.storage fallback
  ];
}
```

---

## NFT Metadata Structure

```typescript
interface NFTMetadata {
  name: string;
  description?: string;
  image: string;          // IPFS URL to image
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
```

### Fetching Metadata

```typescript
async function fetchNFTMetadata(collectionId: string, nftId: string): Promise<NFTMetadata | null> {
  // 1. Get collection asset info
  const assetRes = await fetch(`https://api.mainnet.klever.org/v1.0/assets/${collectionId}`);
  const asset = await assetRes.json();
  
  // 2. Find metadata URI from asset.uris
  const metadataUri = asset.data.asset.uris?.find(
    (u: any) => u.key.toLowerCase() === 'metadata'
  )?.value;
  
  if (!metadataUri) return null;
  
  // 3. Build full URL and fetch
  const urls = getMetadataUrl(metadataUri, nftId);
  
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const metadata = await res.json();
        metadata.image = normalizeIpfsUrl(metadata.image);
        return metadata;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}
```

---

## Collection Stats Aggregation

Per ottenere stats aggregate da tutti i marketplace:

```typescript
interface CollectionStats {
  volumeTotal: number;
  floorPrice: number;
  items: number;
  owners: number;
}

async function getAggregatedStats(collectionId: string): Promise<CollectionStats> {
  const marketplaceIds = Object.values(KLEVER_MARKETPLACES);
  
  const statsPromises = marketplaceIds.map(id =>
    fetch(`https://api.mainnet.klever.org/v1.0/marketplaces/${id}/stats`)
      .then(r => r.json())
      .catch(() => ({ data: { stats: [] } }))
  );
  
  const responses = await Promise.all(statsPromises);
  
  let volumeTotal = 0;
  let floorPrice = Infinity;
  let items = 0;
  let owners = 0;
  
  responses.forEach(response => {
    const stats = response.data?.stats || [];
    const collectionStats = stats.find((s: any) => s.assetId === collectionId);
    
    if (collectionStats) {
      volumeTotal += collectionStats.volumeTotal || 0;
      items = Math.max(items, collectionStats.items || 0);
      owners = Math.max(owners, collectionStats.owners || 0);
      
      if (collectionStats.floor && collectionStats.floor > 0) {
        floorPrice = Math.min(floorPrice, collectionStats.floor);
      }
    }
  });
  
  return {
    volumeTotal,
    floorPrice: floorPrice === Infinity ? 0 : floorPrice,
    items,
    owners
  };
}
```

---

## Listing Status Check

```typescript
interface ListingInfo {
  isListed: boolean;
  orderId: string | null;
  price: number | null;
  seller: string | null;
  endTime: number | null;
  isExpired: boolean;
}

async function getListingInfo(collectionId: string, nftId: string): Promise<ListingInfo> {
  // Check current owner
  const holderRes = await fetch(
    `https://api.mainnet.klever.org/v1.0/assets/nft/holder/${collectionId}/${nftId}`
  );
  const holder = await holderRes.json();
  const owner = holder.data?.account?.address;
  
  // If owner is exchange, it's listed
  if (owner !== KLEVER_EXCHANGE_ADDRESS) {
    return { isListed: false, orderId: null, price: null, seller: null, endTime: null, isExpired: false };
  }
  
  // Get listing details from activity
  const activityRes = await fetch(
    `https://api.mainnet.klever.org/marketplaces/nfts/activity?nftId=${collectionId}/${nftId}&sort=desc&limit=1`
  );
  const activity = await activityRes.json();
  
  const latestListing = activity.data?.[0];
  
  if (!latestListing) {
    return { isListed: true, orderId: null, price: null, seller: null, endTime: null, isExpired: false };
  }
  
  const now = Math.floor(Date.now() / 1000);
  
  return {
    isListed: true,
    orderId: latestListing.orderId,
    price: latestListing.price / 1e6,
    seller: latestListing.sender,
    endTime: latestListing.endTime,
    isExpired: latestListing.endTime ? latestListing.endTime < now : false
  };
}
```

---

## Staking Constants

```typescript
// Magic number for "not unstaked" epoch
export const STAKING_ACTIVE_EPOCH = 4294967295; // uint32 max

// Check bucket status
export function canUnfreeze(bucket: any, currentEpoch: number): boolean {
  return currentEpoch && bucket.stakedEpoch + 1 <= currentEpoch;
}

export function canWithdraw(bucket: any, currentEpoch: number): boolean {
  return (
    currentEpoch &&
    bucket.unstakedEpoch !== STAKING_ACTIVE_EPOCH &&
    bucket.unstakedEpoch + 2 <= currentEpoch
  );
}
```

---

## Value Formatting

```typescript
// KLV and most tokens use precision 6
export function formatKleverAmount(rawAmount: number, precision = 6): string {
  const value = rawAmount / Math.pow(10, precision);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Short address display
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

---

## Transaction Flow Pattern

```typescript
import { web, TransactionType } from '@klever/sdk-web';

async function executeNFTTransaction(
  type: number,
  payload: any,
  kdaFee?: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    // 1. Build options
    const txOptions = kdaFee ? { kdaFee } : undefined;
    
    // 2. Build transaction
    const unsignedTx = await web.buildTransaction(
      [{ type, payload }],
      undefined,
      txOptions
    );
    
    // 3. Sign
    const signedTx = await web.signTransaction(unsignedTx);
    
    // 4. Broadcast
    const response = await web.broadcastTransactions([signedTx]);
    
    if (response[0]?.hash) {
      return { success: true, hash: response[0].hash };
    }
    
    return { success: false, error: 'Transaction failed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

*Documento generato: Gennaio 2026*
*Fonte: RareCanvas codebase analysis*
