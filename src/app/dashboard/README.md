# Dashboard - Super Dashboard v2.0

## 📊 Overview

The Digiko Dashboard is a comprehensive DeFi portfolio management interface that provides users with complete visibility into their Klever blockchain assets, transactions, and performance.

---

## 🎯 Features

### Core Features
1. **Portfolio Overview**
   - Total portfolio value in USD
   - 24-hour change tracking
   - Asset count display
   - Real-time updates every 30 seconds

2. **All Token Balances**
   - Complete list of all tokens in wallet
   - Formatted balances with correct decimals
   - Quick links to token-specific pages
   - Automatic detection of DGKO, BABYDGKO, USDT, KLV

3. **Recent Transactions**
   - Last 10 transactions display
   - Transaction type indicators (Send, Receive, Stake, Unstake, Claim)
   - Status badges (Confirmed, Pending, Failed)
   - Relative timestamps ("2h ago", "Yesterday")
   - Direct links to Kleverscan explorer

4. **Performance Chart**
   - Placeholder for historical performance (coming soon)
   - Time range selector (24H, 7D, 30D, 90D, 1Y, ALL)
   - Visual trend representation

5. **Quick Actions**
   - Fast access to Send, Swap, Stake, View DGKO
   - Disabled state handling when wallet not connected
   - Smooth scroll to Send Form

6. **KLV Balance & Send**
   - Auto-refreshing KLV balance
   - Send KLV form with validation
   - Transaction history

7. **Account Information**
   - Network status (Testnet/Mainnet)
   - Connection status with visual indicator
   - Platform version display

8. **Quick Guide**
   - Onboarding information for new users
   - Four helpful tips with icons

---

## 📁 Architecture

### Modular Structure

```
src/app/dashboard/
├── page.tsx                           # Main orchestrator (95 lines)
├── types/
│   └── dashboard.types.ts            # All TypeScript interfaces
├── config/
│   └── dashboard.config.tsx          # Configuration & constants
├── hooks/
│   ├── useTokenBalances.ts           # Fetch all wallet tokens
│   ├── useTransactionHistory.ts      # Fetch recent transactions
│   └── usePortfolioStats.ts          # Calculate portfolio stats
└── components/
    ├── DashboardHeader.tsx           # Page title
    ├── AccountInfoCard.tsx           # Account details
    ├── QuickGuideSection.tsx         # User guide
    ├── PortfolioOverview.tsx         # 🆕 Total portfolio value
    ├── AllTokenBalances.tsx          # 🆕 Complete token list
    ├── RecentTransactions.tsx        # 🆕 Transaction history
    ├── QuickActions.tsx              # 🆕 Action shortcuts
    └── PerformanceChart.tsx          # 🆕 Performance visualization
```

---

## 🔧 Technical Implementation

### Custom Hooks

#### `useTokenBalances()`
**Purpose:** Fetches all token balances from connected wallet

**Returns:**
```typescript
{
  tokens: TokenBalance[];        // Array of all tokens with balances
  loading: boolean;              // Loading state
  error: string | null;          // Error message if any
}
```

**Features:**
- Automatically formats decimals for known tokens (KLV, DGKO, BABYDGKO, USDT)
- Sorts tokens (KLV first, then by balance amount)
- Refreshes every 30 seconds
- Filters and converts Klever API response to standardized format

**Data Source:** `/api/account?address={address}` → Klever API

---

#### `useTransactionHistory(limit)`
**Purpose:** Fetches recent transactions for connected wallet

**Parameters:**
- `limit: number` - Number of transactions to fetch (default: 10)

**Returns:**
```typescript
{
  transactions: Transaction[];   // Array of formatted transactions
  loading: boolean;              // Loading state
  error: string | null;          // Error message if any
}
```

**Features:**
- Maps Klever transaction types to user-friendly names
- Determines transaction direction (Send/Receive)
- Formats timestamps relative to current time
- Handles different contract types (Transfer, Stake, Unstake, Claim)
- Refreshes every 60 seconds

**Data Source:** `https://api.mainnet.klever.org/v1.0/transaction/list/{address}`

---

#### `usePortfolioStats()`
**Purpose:** Calculates aggregate portfolio statistics

**Returns:**
```typescript
{
  stats: PortfolioStats;         // Portfolio statistics
  loading: boolean;              // Loading state
}
```

**Calculated Stats:**
- `totalValueUSD`: Total portfolio value in USD
- `change24h`: 24-hour change in USD
- `change24hPercent`: 24-hour change percentage
- `totalAssets`: Number of assets with non-zero balance

**Note:** Currently uses mock price data. Real-time prices to be integrated from DGKO price API.

---

### Components

#### `PortfolioOverview`
**Purpose:** Display total portfolio value and 24h performance

**Features:**
- Large, prominent value display
- Color-coded change indicators (green/red)
- Live update indicator (pulsing green dot)
- Asset count and network information

**Loading State:** Animated skeleton placeholder

---

#### `AllTokenBalances`
**Purpose:** Complete list of all tokens in wallet

**Features:**
- Token icons with gradient backgrounds
- Formatted balances with correct decimals
- USD value display (when available)
- Clickable links to token pages (DGKO, BABYDGKO)
- Filters out zero balances
- Displays token asset IDs

**Interactive:**
- Hover effects on clickable tokens
- Shows arrow icon for tokens with dedicated pages

---

#### `RecentTransactions`
**Purpose:** Recent transaction history with rich formatting

**Features:**
- Transaction type icons (↑ Send, ↓ Receive, 🔒 Stake, etc.)
- Color-coded by type (blue, cyan, green, orange, yellow)
- Status badges (✓ Confirmed, Pending, Failed)
- Relative timestamps
- Formatted addresses (first 6 + last 4 characters)
- External links to Kleverscan

**Transaction Types Supported:**
- Send / Receive (Type 0)
- Stake / Unstake (Type 6, 7)
- Claim (Type 9)
- Contract interactions

---

#### `QuickActions`
**Purpose:** Fast access to common operations

**Actions:**
1. **Send KLV** - Scrolls to Send Form
2. **Swap Tokens** - Links to `/swap`
3. **Stake Tokens** - Links to `/staking`
4. **View DGKO** - Links to `/dgko`

**States:**
- Disabled when wallet not connected
- Hover animations and scale effects
- Gradient backgrounds per action type

---

#### `PerformanceChart`
**Purpose:** Portfolio performance visualization (placeholder)

**Current Implementation:**
- Time range selector (24H, 7D, 30D, 90D, 1Y, ALL)
- Mock trend line visualization
- Summary stats display
- "Coming soon" indicator

**Future Enhancement:**
- Real historical price data
- Recharts integration
- Candlestick charts
- Volume indicators

---

## 🎨 Design Patterns

### Glass Morphism
All dashboard cards use consistent glass morphism styling:
```css
.glass {
  background: rgba(18, 18, 20, 0.5);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Color Palette
- **Primary Blue:** `#0066FF` - Main actions, links
- **Accent Cyan:** `#00D4FF` - Secondary highlights
- **Green:** Success states, positive changes
- **Red:** Error states, negative changes
- **Yellow:** Warnings, pending states

### Typography
- **Geist Sans:** UI elements, labels, text
- **Geist Mono:** Numbers, addresses, amounts

---

## 🔄 Data Flow

```
User Connects Wallet
         ↓
KleverContext updates (address, isConnected)
         ↓
Dashboard Page renders
         ↓
Custom Hooks trigger
         ↓
useTokenBalances → /api/account → Klever API
useTransactionHistory → Klever API directly
usePortfolioStats → processes token data
         ↓
Components receive data
         ↓
UI updates with formatted data
         ↓
Auto-refresh cycles (30s tokens, 60s transactions)
```

---

## 🐛 Known Limitations

1. **Price Data:** Currently using mock USD prices
   - **Solution:** Integrate with DGKO price API when available

2. **Transaction Amount Display:** Some contract types don't show amounts correctly
   - **Solution:** Parse more contract parameter types

3. **Performance Chart:** Placeholder only
   - **Solution:** Implement with Recharts and historical data

4. **Token Icons:** Using initial letter instead of logos
   - **Solution:** Add token logo URLs to config

---

## 🚀 Future Enhancements

### Phase 1 (Next Sprint)
- [ ] Real-time USD price integration
- [ ] Token logo images
- [ ] Enhanced transaction parsing
- [ ] Staking positions integration

### Phase 2 (Future)
- [ ] Historical performance chart with Recharts
- [ ] Profit/Loss calculations
- [ ] Tax reporting features
- [ ] CSV export functionality

### Phase 3 (Advanced)
- [ ] Notifications system
- [ ] Price alerts
- [ ] Customizable dashboard layout
- [ ] Advanced analytics

---

## 📊 Performance Considerations

### Optimization Strategies
1. **Auto-refresh Intervals:**
   - Token balances: 30 seconds
   - Transactions: 60 seconds
   - Prevents excessive API calls

2. **Data Caching:**
   - useEffect dependencies prevent unnecessary re-fetches
   - React state management for efficient updates

3. **Conditional Rendering:**
   - Components only render when wallet connected
   - Loading states prevent layout shifts

4. **API Efficiency:**
   - Single account endpoint fetches all token data
   - Transaction limit parameter controls data volume

---

## 🧪 Testing Checklist

### Component Testing
- [ ] Portfolio Overview displays correct total value
- [ ] All tokens appear in token list with correct balances
- [ ] Transactions load and display with correct types
- [ ] Quick Actions buttons work and navigate correctly
- [ ] Loading states appear during data fetch
- [ ] Error states display when API fails

### Integration Testing
- [ ] Connect wallet triggers all hooks
- [ ] Data refreshes on intervals
- [ ] Disconnect wallet clears all data
- [ ] Links navigate to correct pages
- [ ] External Kleverscan links open correctly

### Edge Cases
- [ ] Empty wallet (no tokens) displays correctly
- [ ] New wallet (no transactions) shows appropriate message
- [ ] Very large balances format correctly
- [ ] Very old transactions display correctly
- [ ] Network switching updates all data

---

## 📝 Code Examples

### Using Custom Hooks

```typescript
// In a component
import { useTokenBalances } from '../hooks/useTokenBalances';

export function MyComponent() {
  const { tokens, loading, error } = useTokenBalances();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {tokens.map(token => (
        <div key={token.assetId}>{token.balanceFormatted}</div>
      ))}
    </div>
  );
}
```

### Extending Types

```typescript
// In dashboard.types.ts
export interface TokenBalance {
  assetId: string;
  balance: string;
  balanceFormatted: string;
  valueUSD?: number;
  change24h?: number;
  logo?: string;  // Add new property
}
```

---

## 🔐 Security Notes

- All API calls use Next.js API routes to avoid CORS
- No sensitive data stored in components
- Wallet connection handled by Klever Extension
- Transaction signing requires user approval
- External links use `rel="noopener noreferrer"`

---

## 📚 Related Documentation

- [Modular Architecture Guide](../../docs/dev/MODULAR_ARCHITECTURE.md)
- [Klever Integration](../../docs/dev/README.md)
- [Design Guide](../../design_guide.md)
- [Project Rules](../../docs/dev/README.md)

---

*Last Updated: November 26, 2025*  
*Dashboard Version: v2.0 (Super Dashboard)*
