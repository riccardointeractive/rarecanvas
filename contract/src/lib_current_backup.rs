#![no_std]

use klever_sc::imports::*;

// ============================================================================
// DIGIKO MULTI-PAIR DEX CONTRACT V4 - SINGLE-TX MINT
// ============================================================================
// Evolution from V3.1: Added single-transaction liquidity minting!
//
// V4 NEW: Single-Transaction Mint
//   - mint(pair_id, min_shares) - Send BOTH tokens in one transaction
//   - Uses multi-token callValue array format
//   - Automatically matches pool ratio and refunds excess
//   - No more 3-step pending process for LPs!
//
// V3.1 LEGACY: Pending Liquidity System (still supported)
//   - Users deposit token A and token B in separate transactions
//   - Deposits are held in "pending" storage per user
//   - User calls finalizeLiquidity() to match and mint LP shares
//   - Slippage protection via min_shares parameter
//   - Granular withdrawals (withdraw A only, B only, or both)
//
// Fee Structure:
//   - Total swap fee: 1%
//   - Owner's liquidity: earns 1% (full rate)
//   - LP's liquidity: LP earns 0.9%, Owner earns 0.1%
//
// Share System:
//   - owner_shares: Owner's share of the pool
//   - lp_shares: Individual LP's share
//   - total_lp_shares: Sum of all LP shares
//   - Total pool = owner_shares + total_lp_shares
//
// Fee Distribution (per swap):
//   - Owner gets: fee × (0.9 × owner_pct + 0.1)
//   - LPs collectively get: fee × (1 - owner_pct) × 0.9
//   - Distribution to each LP via fee_per_share index
//
// DISCOVERY: Klever CAN send KLV + KDA in same transaction!
// Proof: tx 60b91a8c352533869bb6aae6d0ca1544bc502655fd820cf391a4537192e13519
// ============================================================================

// Precision factor for fee calculations (1e12)
const PRECISION: u64 = 1_000_000_000_000;

// Minimum liquidity burned on first deposit to prevent dust attacks
const MINIMUM_LIQUIDITY: u64 = 1000;

#[klever_sc::contract]
pub trait DigikoDexV4 {
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    #[init]
    fn init(&self) {
        self.next_pair_id().set(1u64);
    }

    #[upgrade]
    fn upgrade(&self) {
        // Initialize next_pair_id if not set (for upgrades from V1/V2)
        if self.next_pair_id().is_empty() {
            self.next_pair_id().set(1u64);
        }
    }

    // ========================================================================
    // ADMIN: PAIR MANAGEMENT
    // ========================================================================

    /// Create a new trading pair (owner only)
    /// Returns the pair_id for the new pair
    #[only_owner]
    #[endpoint(createPair)]
    fn create_pair(
        &self,
        token_a: TokenIdentifier,
        token_b: TokenIdentifier,
        token_a_is_klv: bool,
        token_b_is_klv: bool,
        fee_percent: u64,
    ) -> u64 {
        require!(token_a != token_b, "Tokens must be different");
        require!(fee_percent >= 1 && fee_percent <= 10, "Fee must be 1-10%");
        require!(!(token_a_is_klv && token_b_is_klv), "Both tokens cannot be KLV");
        
        let pair_id = self.next_pair_id().get();
        self.next_pair_id().set(pair_id + 1);
        
        // Initialize pair storage
        self.pair_token_a(pair_id).set(&token_a);
        self.pair_token_b(pair_id).set(&token_b);
        self.pair_token_a_is_klv(pair_id).set(token_a_is_klv);
        self.pair_token_b_is_klv(pair_id).set(token_b_is_klv);
        self.pair_reserve_a(pair_id).set(BigUint::zero());
        self.pair_reserve_b(pair_id).set(BigUint::zero());
        self.pair_fee_percent(pair_id).set(fee_percent);
        self.pair_is_active(pair_id).set(true);
        
        // Initialize share tracking
        self.owner_shares(pair_id).set(BigUint::zero());
        self.total_lp_shares(pair_id).set(BigUint::zero());
        
        // Initialize fee tracking
        self.owner_unclaimed_fees_a(pair_id).set(BigUint::zero());
        self.owner_unclaimed_fees_b(pair_id).set(BigUint::zero());
        self.fee_per_share_a(pair_id).set(BigUint::zero());
        self.fee_per_share_b(pair_id).set(BigUint::zero());
        
        // Add to registered pairs
        self.registered_pair_ids().insert(pair_id);
        
        pair_id
    }

    /// Enable or disable a trading pair (owner only)
    #[only_owner]
    #[endpoint(setPairActive)]
    fn set_pair_active(&self, pair_id: u64, is_active: bool) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        self.pair_is_active(pair_id).set(is_active);
    }

    /// Update fee percentage for a pair (owner only)
    #[only_owner]
    #[endpoint(setPairFee)]
    fn set_pair_fee(&self, pair_id: u64, fee_percent: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(fee_percent >= 1 && fee_percent <= 10, "Fee must be 1-10%");
        self.pair_fee_percent(pair_id).set(fee_percent);
    }

    /// Update token A for a pair (owner only)
    /// WARNING: Only use on pairs with zero liquidity or you risk losing funds
    #[only_owner]
    #[endpoint(updatePairTokenA)]
    fn update_pair_token_a(&self, pair_id: u64, new_token_a: TokenIdentifier, is_klv: bool) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        // Safety check: warn if there's existing liquidity
        let reserve_a = self.pair_reserve_a(pair_id).get();
        require!(reserve_a == BigUint::zero(), "Cannot update token with existing liquidity");
        
        self.pair_token_a(pair_id).set(&new_token_a);
        self.pair_token_a_is_klv(pair_id).set(is_klv);
    }

    /// Update token B for a pair (owner only)
    /// WARNING: Only use on pairs with zero liquidity or you risk losing funds
    #[only_owner]
    #[endpoint(updatePairTokenB)]
    fn update_pair_token_b(&self, pair_id: u64, new_token_b: TokenIdentifier, is_klv: bool) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        // Safety check: warn if there's existing liquidity
        let reserve_b = self.pair_reserve_b(pair_id).get();
        require!(reserve_b == BigUint::zero(), "Cannot update token with existing liquidity");
        
        self.pair_token_b(pair_id).set(&new_token_b);
        self.pair_token_b_is_klv(pair_id).set(is_klv);
    }

    // ========================================================================
    // OWNER LIQUIDITY (Full 1% fee rate)
    // ========================================================================

    /// Owner adds KDA token to reserve_a
    #[only_owner]
    #[endpoint(ownerAddLiquidityA)]
    #[payable("*")]
    fn owner_add_liquidity_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use ownerAddLiquidityAKlv");
        
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_a = self.pair_token_a(pair_id).get();
        
        require!(token_id == token_a, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
        // Note: Shares are calculated in ownerInitializeLiquidity
    }

    /// Owner adds KDA token to reserve_b
    #[only_owner]
    #[endpoint(ownerAddLiquidityB)]
    #[payable("*")]
    fn owner_add_liquidity_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use ownerAddLiquidityBKlv");
        
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_b = self.pair_token_b(pair_id).get();
        
        require!(token_id == token_b, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
        // Note: Shares are calculated in ownerInitializeLiquidity
    }

    /// Owner adds KLV to reserve_a
    #[only_owner]
    #[endpoint(ownerAddLiquidityAKlv)]
    #[payable("KLV")]
    fn owner_add_liquidity_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
        // Note: Shares are calculated in ownerInitializeLiquidity
    }

    /// Owner adds KLV to reserve_b
    #[only_owner]
    #[endpoint(ownerAddLiquidityBKlv)]
    #[payable("KLV")]
    fn owner_add_liquidity_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
        // Note: Shares are calculated in ownerInitializeLiquidity
    }

    /// Initialize owner liquidity with correct sqrt(a*b) formula
    /// Call this AFTER adding both tokens to the pair
    /// This sets owner shares using the proper AMM formula
    #[only_owner]
    #[endpoint(ownerInitializeLiquidity)]
    fn owner_initialize_liquidity(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > BigUint::zero(), "No reserve A - add liquidity first");
        require!(reserve_b > BigUint::zero(), "No reserve B - add liquidity first");
        
        // Only allow if no LPs have joined yet (initial setup only)
        let total_lp_shares = self.total_lp_shares(pair_id).get();
        require!(total_lp_shares == BigUint::zero(), "Cannot reinitialize after LPs joined");
        
        // Calculate using sqrt(a * b) formula - same as AMM initial liquidity
        let product = &reserve_a * &reserve_b;
        let sqrt_shares = product.sqrt();
        
        // Set owner shares (replaces any previous value)
        self.owner_shares(pair_id).set(sqrt_shares);
    }

    /// Recalculate owner shares using sqrt(a*b) formula
    /// @deprecated Use ownerInitializeLiquidity instead
    #[only_owner]
    #[endpoint(ownerRecalculateShares)]
    fn owner_recalculate_shares(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > BigUint::zero(), "No reserve A");
        require!(reserve_b > BigUint::zero(), "No reserve B");
        
        // Only allow if no LPs have joined yet
        let total_lp_shares = self.total_lp_shares(pair_id).get();
        require!(total_lp_shares == BigUint::zero(), "Cannot recalculate after LPs joined");
        
        // Calculate using sqrt(a * b) formula - same as AMM initial liquidity
        let product = &reserve_a * &reserve_b;
        let sqrt_shares = product.sqrt();
        
        // Set owner shares to the correct value
        self.owner_shares(pair_id).set(sqrt_shares);
    }

    /// Owner removes liquidity (partial or full)
    #[only_owner]
    #[endpoint(ownerRemoveLiquidity)]
    fn owner_remove_liquidity(&self, pair_id: u64, shares_to_remove: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let owner_shares = self.owner_shares(pair_id).get();
        require!(shares_to_remove <= owner_shares, "Insufficient owner shares");
        require!(shares_to_remove > 0u64, "Shares must be > 0");
        
        let total_shares = self.get_total_shares_internal(pair_id);
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        // Calculate tokens to return
        let amount_a = &shares_to_remove * &reserve_a / &total_shares;
        let amount_b = &shares_to_remove * &reserve_b / &total_shares;
        
        // Update state
        self.owner_shares(pair_id).set(&owner_shares - &shares_to_remove);
        self.pair_reserve_a(pair_id).set(&reserve_a - &amount_a);
        self.pair_reserve_b(pair_id).set(&reserve_b - &amount_b);
        
        // Send tokens to owner
        let owner = self.blockchain().get_owner_address();
        
        // Send token A
        if self.pair_token_a_is_klv(pair_id).get() {
            self.send().direct_klv(&owner, &amount_a);
        } else {
            let token_a = self.pair_token_a(pair_id).get();
            self.send().direct_kda(&owner, &token_a, 0, &amount_a);
        }
        
        // Send token B
        if self.pair_token_b_is_klv(pair_id).get() {
            self.send().direct_klv(&owner, &amount_b);
        } else {
            let token_b = self.pair_token_b(pair_id).get();
            self.send().direct_kda(&owner, &token_b, 0, &amount_b);
        }
    }

    /// Owner claims accumulated fees
    #[only_owner]
    #[endpoint(ownerClaimFees)]
    fn owner_claim_fees(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let fees_a = self.owner_unclaimed_fees_a(pair_id).get();
        let fees_b = self.owner_unclaimed_fees_b(pair_id).get();
        
        require!(fees_a > 0u64 || fees_b > 0u64, "No fees to claim");
        
        // Clear fees first
        self.owner_unclaimed_fees_a(pair_id).set(BigUint::zero());
        self.owner_unclaimed_fees_b(pair_id).set(BigUint::zero());
        
        let owner = self.blockchain().get_owner_address();
        
        // Send fee A if any
        if fees_a > BigUint::zero() {
            if self.pair_token_a_is_klv(pair_id).get() {
                self.send().direct_klv(&owner, &fees_a);
            } else {
                let token_a = self.pair_token_a(pair_id).get();
                self.send().direct_kda(&owner, &token_a, 0, &fees_a);
            }
        }
        
        // Send fee B if any
        if fees_b > BigUint::zero() {
            if self.pair_token_b_is_klv(pair_id).get() {
                self.send().direct_klv(&owner, &fees_b);
            } else {
                let token_b = self.pair_token_b(pair_id).get();
                self.send().direct_kda(&owner, &token_b, 0, &fees_b);
            }
        }
    }

    // ========================================================================
    // PENDING LIQUIDITY SYSTEM (V3.1 - Safe two-step deposits)
    // ========================================================================
    // Users deposit tokens to "pending" storage, then finalize to mint LP shares.
    // This allows KLV + KDA to be added in separate transactions safely.

    /// Deposit KDA token to pending A storage
    #[endpoint(depositPendingA)]
    #[payable("*")]
    fn deposit_pending_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use depositPendingAKlv for KLV");
        
        let caller = self.blockchain().get_caller();
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_a = self.pair_token_a(pair_id).get();
        
        require!(token_id == token_a, "Wrong token - expected token A");
        require!(amount > 0u64, "Amount must be > 0");
        
        // Add to pending
        self.pending_a(pair_id, &caller).update(|v| *v += &amount);
    }

    /// Deposit KLV to pending A storage (when token A is KLV)
    #[endpoint(depositPendingAKlv)]
    #[payable("KLV")]
    fn deposit_pending_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        // Add to pending
        self.pending_a(pair_id, &caller).update(|v| *v += &amount);
    }

    /// Deposit KDA token to pending B storage
    #[endpoint(depositPendingB)]
    #[payable("*")]
    fn deposit_pending_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use depositPendingBKlv for KLV");
        
        let caller = self.blockchain().get_caller();
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_b = self.pair_token_b(pair_id).get();
        
        require!(token_id == token_b, "Wrong token - expected token B");
        require!(amount > 0u64, "Amount must be > 0");
        
        // Add to pending
        self.pending_b(pair_id, &caller).update(|v| *v += &amount);
    }

    /// Deposit KLV to pending B storage (when token B is KLV)
    #[endpoint(depositPendingBKlv)]
    #[payable("KLV")]
    fn deposit_pending_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        // Add to pending
        self.pending_b(pair_id, &caller).update(|v| *v += &amount);
    }

    /// Finalize pending deposits into LP position
    /// min_shares: Minimum LP shares expected (slippage protection)
    #[endpoint(finalizeLiquidity)]
    fn finalize_liquidity(&self, pair_id: u64, min_shares: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        
        let caller = self.blockchain().get_caller();
        let pending_a = self.pending_a(pair_id, &caller).get();
        let pending_b = self.pending_b(pair_id, &caller).get();
        
        require!(pending_a > BigUint::zero(), "No pending token A");
        require!(pending_b > BigUint::zero(), "No pending token B");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        // Calculate how much can be matched at current pool ratio
        let (use_a, use_b) = if reserve_a == BigUint::zero() || reserve_b == BigUint::zero() {
            // First liquidity - use everything (user sets the ratio)
            // Require minimum amounts to prevent dust attacks
            require!(
                &pending_a * &pending_b >= BigUint::from(MINIMUM_LIQUIDITY * MINIMUM_LIQUIDITY),
                "Initial liquidity too small"
            );
            (pending_a.clone(), pending_b.clone())
        } else {
            // Match at current pool ratio
            // If user deposits too much of one side, excess stays in pending
            
            // How much B needed for all of pending_a?
            let b_needed = &pending_a * &reserve_b / &reserve_a;
            
            if b_needed <= pending_b {
                // User has enough B, use all of A
                (pending_a.clone(), b_needed)
            } else {
                // User has more A than needed, use all of B
                let a_needed = &pending_b * &reserve_a / &reserve_b;
                (a_needed, pending_b.clone())
            }
        };
        
        require!(use_a > BigUint::zero() && use_b > BigUint::zero(), "Amounts too small to match");
        
        // Calculate LP shares (standard AMM formula)
        let total_shares = self.get_total_shares_internal(pair_id);
        let shares = if total_shares == BigUint::zero() {
            // First LP - shares = sqrt(a * b) - MINIMUM_LIQUIDITY
            let product = &use_a * &use_b;
            let sqrt_shares = product.sqrt();
            require!(sqrt_shares > BigUint::from(MINIMUM_LIQUIDITY), "Initial liquidity too small");
            sqrt_shares - BigUint::from(MINIMUM_LIQUIDITY)
        } else {
            // Subsequent LP - proportional shares (take minimum to be fair)
            let shares_a = &use_a * &total_shares / &reserve_a;
            let shares_b = &use_b * &total_shares / &reserve_b;
            if shares_a < shares_b { shares_a } else { shares_b }
        };
        
        // Slippage protection
        require!(shares >= min_shares, "Slippage: shares below minimum");
        require!(shares > BigUint::zero(), "Shares must be > 0");
        
        // Claim any pending fees first (if already an LP)
        self.claim_pending_fees_internal(pair_id, &caller);
        
        // Update pending (subtract used amounts)
        self.pending_a(pair_id, &caller).set(&pending_a - &use_a);
        self.pending_b(pair_id, &caller).set(&pending_b - &use_b);
        
        // Add to reserves
        self.pair_reserve_a(pair_id).update(|r| *r += &use_a);
        self.pair_reserve_b(pair_id).update(|r| *r += &use_b);
        
        // Add LP shares to user
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// Withdraw only pending token A (keeps pending B untouched)
    #[endpoint(withdrawPendingA)]
    fn withdraw_pending_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_a = self.pending_a(pair_id, &caller).get();
        
        require!(pending_a > BigUint::zero(), "No pending token A to withdraw");
        
        // Clear pending A
        self.pending_a(pair_id, &caller).set(BigUint::zero());
        
        // Return token A
        if self.pair_token_a_is_klv(pair_id).get() {
            self.send().direct_klv(&caller, &pending_a);
        } else {
            let token_a = self.pair_token_a(pair_id).get();
            self.send().direct_kda(&caller, &token_a, 0, &pending_a);
        }
    }

    /// Withdraw only pending token B (keeps pending A untouched)
    #[endpoint(withdrawPendingB)]
    fn withdraw_pending_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_b = self.pending_b(pair_id, &caller).get();
        
        require!(pending_b > BigUint::zero(), "No pending token B to withdraw");
        
        // Clear pending B
        self.pending_b(pair_id, &caller).set(BigUint::zero());
        
        // Return token B
        if self.pair_token_b_is_klv(pair_id).get() {
            self.send().direct_klv(&caller, &pending_b);
        } else {
            let token_b = self.pair_token_b(pair_id).get();
            self.send().direct_kda(&caller, &token_b, 0, &pending_b);
        }
    }

    /// Withdraw all pending tokens (both A and B)
    #[endpoint(withdrawPendingAll)]
    fn withdraw_pending_all(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_a = self.pending_a(pair_id, &caller).get();
        let pending_b = self.pending_b(pair_id, &caller).get();
        
        require!(pending_a > BigUint::zero() || pending_b > BigUint::zero(), "No pending deposits");
        
        // Clear both pending
        self.pending_a(pair_id, &caller).set(BigUint::zero());
        self.pending_b(pair_id, &caller).set(BigUint::zero());
        
        // Return token A if any
        if pending_a > BigUint::zero() {
            if self.pair_token_a_is_klv(pair_id).get() {
                self.send().direct_klv(&caller, &pending_a);
            } else {
                let token_a = self.pair_token_a(pair_id).get();
                self.send().direct_kda(&caller, &token_a, 0, &pending_a);
            }
        }
        
        // Return token B if any
        if pending_b > BigUint::zero() {
            if self.pair_token_b_is_klv(pair_id).get() {
                self.send().direct_klv(&caller, &pending_b);
            } else {
                let token_b = self.pair_token_b(pair_id).get();
                self.send().direct_kda(&caller, &token_b, 0, &pending_b);
            }
        }
    }

    // ========================================================================
    // V4: SINGLE-TRANSACTION MINT (Multi-Token Payment)
    // ========================================================================
    // DISCOVERY: Klever CAN send KLV + KDA in same transaction!
    // Proof tx: 60b91a8c352533869bb6aae6d0ca1544bc502655fd820cf391a4537192e13519
    // 
    // This uses array format callValue:
    //   [{ asset: "TOKEN-ABC", value: 100 }, { asset: "KLV", value: 5000 }]
    //
    // Replaces the 3-step pending system for community LPs!
    // ========================================================================

    /// Community LP adds liquidity in ONE transaction
    /// Sends both tokens at once via multi-token callValue
    /// 
    /// NOTE: Pool must be initialized by owner first!
    /// 
    /// @param pair_id - The trading pair ID
    /// @param min_lp_shares - Minimum shares expected (slippage protection)
    /// @return The number of LP shares minted
    #[endpoint(mint)]
    #[payable("*")]
    fn mint(&self, pair_id: u64, min_lp_shares: BigUint) -> BigUint {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        
        let caller = self.blockchain().get_caller();
        
        // Get pair configuration
        let token_a = self.pair_token_a(pair_id).get();
        let token_b = self.pair_token_b(pair_id).get();
        let token_a_is_klv = self.pair_token_a_is_klv(pair_id).get();
        let token_b_is_klv = self.pair_token_b_is_klv(pair_id).get();
        
        // Get current reserves
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        // CRITICAL: Check pool is initialized (owner must add liquidity first)
        let owner_shares = self.owner_shares(pair_id).get();
        require!(owner_shares > BigUint::zero(), "Pool not initialized - owner must add liquidity first");
        require!(reserve_a > BigUint::zero() && reserve_b > BigUint::zero(), "Reserves empty");
        
        // Extract payment amounts from multi-token callValue
        let (amount_a, amount_b) = self.extract_dual_payment(
            &token_a,
            &token_b,
            token_a_is_klv,
            token_b_is_klv
        );
        
        require!(amount_a > BigUint::zero(), "No token A sent");
        require!(amount_b > BigUint::zero(), "No token B sent");
        
        // Calculate proportional amounts (same as finalizeLiquidity logic)
        let total_shares = &owner_shares + &self.total_lp_shares(pair_id).get();
        
        // Calculate how much we can actually use (maintain pool ratio)
        let optimal_b = &amount_a * &reserve_b / &reserve_a;
        let optimal_a = &amount_b * &reserve_a / &reserve_b;
        
        let (used_a, used_b, refund_a, refund_b) = if optimal_b <= amount_b {
            // Use all of A, proportional B
            let used_b = optimal_b;
            let refund_b = &amount_b - &used_b;
            (amount_a.clone(), used_b, BigUint::zero(), refund_b)
        } else {
            // Use all of B, proportional A
            let used_a = optimal_a;
            let refund_a = &amount_a - &used_a;
            (used_a, amount_b.clone(), refund_a, BigUint::zero())
        };
        
        require!(used_a > BigUint::zero() && used_b > BigUint::zero(), "Amounts too small");
        
        // Calculate shares based on smaller ratio (fair for existing LPs)
        let shares_from_a = &used_a * &total_shares / &reserve_a;
        let shares_from_b = &used_b * &total_shares / &reserve_b;
        let new_shares = if shares_from_a < shares_from_b { shares_from_a } else { shares_from_b };
        
        // Slippage protection
        require!(new_shares >= min_lp_shares, "Slippage: shares below minimum");
        require!(new_shares > BigUint::zero(), "Shares must be > 0");
        
        // Claim any pending fees first (if already an LP)
        self.claim_pending_fees_internal(pair_id, &caller);
        
        // Update reserves
        self.pair_reserve_a(pair_id).update(|r| *r += &used_a);
        self.pair_reserve_b(pair_id).update(|r| *r += &used_b);
        
        // Add LP shares using existing helper (handles fee tracking)
        self.add_lp_shares(pair_id, &caller, &new_shares);
        
        // Refund any excess tokens
        if refund_a > BigUint::zero() {
            self.send_token_internal(&caller, &token_a, token_a_is_klv, &refund_a);
        }
        if refund_b > BigUint::zero() {
            self.send_token_internal(&caller, &token_b, token_b_is_klv, &refund_b);
        }
        
        new_shares
    }
    
    /// Helper: Extract payment amounts for both tokens from multi-token callValue
    fn extract_dual_payment(
        &self,
        token_a: &TokenIdentifier,
        token_b: &TokenIdentifier,
        token_a_is_klv: bool,
        token_b_is_klv: bool,
    ) -> (BigUint, BigUint) {
        let mut amount_a = BigUint::zero();
        let mut amount_b = BigUint::zero();
        
        // Get KLV payment (if any)
        let klv_amount = self.call_value().klv_value();
        
        // Get all KDA payments
        let kda_payments = self.call_value().all_kda_transfers();
        
        // Assign KLV to the correct token
        if token_a_is_klv {
            amount_a = klv_amount.clone_value();
        } else if token_b_is_klv {
            amount_b = klv_amount.clone_value();
        }
        
        // Assign KDA payments to correct tokens
        for payment in kda_payments.iter() {
            let payment_token = payment.token_identifier.clone();
            let payment_amount = payment.amount.clone();
            
            if payment_token == *token_a {
                amount_a = payment_amount;
            } else if payment_token == *token_b {
                amount_b = payment_amount;
            }
            // Ignore any other tokens sent (they'll be stuck in contract)
        }
        
        (amount_a, amount_b)
    }
    
    /// Helper: Send token (handles KLV vs KDA)
    fn send_token_internal(
        &self,
        to: &ManagedAddress,
        token: &TokenIdentifier,
        is_klv: bool,
        amount: &BigUint,
    ) {
        if is_klv {
            self.send().direct_klv(to, amount);
        } else {
            self.send().direct_kda(to, token, 0, amount);
        }
    }
    
    /// Debug view: Test what payments the contract receives
    /// Call with multi-token callValue to verify format works
    #[view(testPayments)]
    #[payable("*")]
    fn test_payments(&self) -> MultiValue3<BigUint, usize, ManagedVec<KdaTokenPayment>> {
        let klv = self.call_value().klv_value().clone_value();
        let kda_payments = self.call_value().all_kda_transfers().clone_value();
        let count = kda_payments.len();
        
        (klv, count, kda_payments).into()
    }

    // ========================================================================
    // LEGACY PUBLIC LIQUIDITY (kept for backwards compatibility)
    // These allow single-sided deposits but new UI should use pending system
    // ========================================================================

    /// Anyone can add KDA token liquidity to reserve_a
    #[endpoint(addLiquidityA)]
    #[payable("*")]
    fn add_liquidity_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use addLiquidityAKlv");
        
        let caller = self.blockchain().get_caller();
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_a = self.pair_token_a(pair_id).get();
        
        require!(token_id == token_a, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        // Claim any pending fees first
        self.claim_pending_fees_internal(pair_id, &caller);
        
        // Add to reserves
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
        
        // Calculate and add LP shares
        let shares = self.calculate_shares_for_single_token(pair_id, &amount, true);
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// Anyone can add KDA token liquidity to reserve_b
    #[endpoint(addLiquidityB)]
    #[payable("*")]
    fn add_liquidity_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use addLiquidityBKlv");
        
        let caller = self.blockchain().get_caller();
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_b = self.pair_token_b(pair_id).get();
        
        require!(token_id == token_b, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.claim_pending_fees_internal(pair_id, &caller);
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
        
        let shares = self.calculate_shares_for_single_token(pair_id, &amount, false);
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// Anyone can add KLV liquidity to reserve_a
    #[endpoint(addLiquidityAKlv)]
    #[payable("KLV")]
    fn add_liquidity_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.claim_pending_fees_internal(pair_id, &caller);
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
        
        let shares = self.calculate_shares_for_single_token(pair_id, &amount, true);
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// Anyone can add KLV liquidity to reserve_b
    #[endpoint(addLiquidityBKlv)]
    #[payable("KLV")]
    fn add_liquidity_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.claim_pending_fees_internal(pair_id, &caller);
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
        
        let shares = self.calculate_shares_for_single_token(pair_id, &amount, false);
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// LP removes their liquidity
    #[endpoint(removeLiquidity)]
    fn remove_liquidity(&self, pair_id: u64, shares_to_remove: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let lp_shares = self.lp_shares(pair_id, &caller).get();
        
        require!(shares_to_remove <= lp_shares, "Insufficient LP shares");
        require!(shares_to_remove > 0u64, "Shares must be > 0");
        
        // Claim pending fees first
        self.claim_pending_fees_internal(pair_id, &caller);
        
        let total_shares = self.get_total_shares_internal(pair_id);
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        // Calculate tokens to return
        let amount_a = &shares_to_remove * &reserve_a / &total_shares;
        let amount_b = &shares_to_remove * &reserve_b / &total_shares;
        
        require!(amount_a > 0u64 || amount_b > 0u64, "Withdrawal too small");
        
        // Update state
        let new_lp_shares = &lp_shares - &shares_to_remove;
        if new_lp_shares == BigUint::zero() {
            self.lp_shares(pair_id, &caller).clear();
            self.lp_entry_index_a(pair_id, &caller).clear();
            self.lp_entry_index_b(pair_id, &caller).clear();
            self.lp_list(pair_id).swap_remove(&caller);
        } else {
            self.lp_shares(pair_id, &caller).set(&new_lp_shares);
        }
        
        self.total_lp_shares(pair_id).update(|s| *s -= &shares_to_remove);
        self.pair_reserve_a(pair_id).set(&reserve_a - &amount_a);
        self.pair_reserve_b(pair_id).set(&reserve_b - &amount_b);
        
        // Send tokens to LP
        if amount_a > BigUint::zero() {
            if self.pair_token_a_is_klv(pair_id).get() {
                self.send().direct_klv(&caller, &amount_a);
            } else {
                let token_a = self.pair_token_a(pair_id).get();
                self.send().direct_kda(&caller, &token_a, 0, &amount_a);
            }
        }
        
        if amount_b > BigUint::zero() {
            if self.pair_token_b_is_klv(pair_id).get() {
                self.send().direct_klv(&caller, &amount_b);
            } else {
                let token_b = self.pair_token_b(pair_id).get();
                self.send().direct_kda(&caller, &token_b, 0, &amount_b);
            }
        }
    }

    /// LP claims accumulated fees
    #[endpoint(claimLpFees)]
    fn claim_lp_fees(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        require!(self.lp_list(pair_id).contains(&caller), "Not an LP for this pair");
        
        self.claim_pending_fees_internal(pair_id, &caller);
    }

    // ========================================================================
    // SWAP FUNCTIONS (Updated with fee distribution)
    // ========================================================================

    /// Swap token A for token B (send KDA token A)
    #[endpoint(swapAtoB)]
    #[payable("*")]
    fn swap_a_to_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use swapKlvToB for KLV input");
        
        let (token_id, payment) = self.call_value().single_fungible_kda();
        let token_a = self.pair_token_a(pair_id).get();
        
        require!(token_id == token_a, "Wrong token sent");
        require!(payment > 0u64, "Payment must be greater than 0");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > 0u64 && reserve_b > 0u64, "Reserves empty");
        
        // AMM: output = (payment * reserve_b) / (reserve_a + payment)
        let output = (&payment * &reserve_b) / (&reserve_a + &payment);
        require!(output > 0u64 && output < reserve_b, "Invalid output");
        
        // Fee calculation
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        // Update reserves
        self.pair_reserve_a(pair_id).set(&reserve_a + &payment);
        self.pair_reserve_b(pair_id).set(&reserve_b - &output);
        
        // Distribute fee (for token B)
        self.distribute_fee(pair_id, &fee, false);
        
        // Send token B to user
        let caller = self.blockchain().get_caller();
        let token_b = self.pair_token_b(pair_id).get();
        
        if self.pair_token_b_is_klv(pair_id).get() {
            self.send().direct_klv(&caller, &user_gets);
        } else {
            self.send().direct_kda(&caller, &token_b, 0, &user_gets);
        }
    }

    /// Swap token B for token A (send KDA token B)
    #[endpoint(swapBtoA)]
    #[payable("*")]
    fn swap_b_to_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use swapKlvToA for KLV input");
        
        let (token_id, payment) = self.call_value().single_fungible_kda();
        let token_b = self.pair_token_b(pair_id).get();
        
        require!(token_id == token_b, "Wrong token sent");
        require!(payment > 0u64, "Payment must be greater than 0");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > 0u64 && reserve_b > 0u64, "Reserves empty");
        
        let output = (&payment * &reserve_a) / (&reserve_b + &payment);
        require!(output > 0u64 && output < reserve_a, "Invalid output");
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        self.pair_reserve_b(pair_id).set(&reserve_b + &payment);
        self.pair_reserve_a(pair_id).set(&reserve_a - &output);
        
        // Distribute fee (for token A)
        self.distribute_fee(pair_id, &fee, true);
        
        let caller = self.blockchain().get_caller();
        let token_a = self.pair_token_a(pair_id).get();
        
        if self.pair_token_a_is_klv(pair_id).get() {
            self.send().direct_klv(&caller, &user_gets);
        } else {
            self.send().direct_kda(&caller, &token_a, 0, &user_gets);
        }
    }

    /// Swap KLV for token B (when token_a is KLV)
    #[endpoint(swapKlvToB)]
    #[payable("KLV")]
    fn swap_klv_to_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let payment = self.call_value().klv_value().clone_value();
        require!(payment > 0u64, "Payment must be greater than 0");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > 0u64 && reserve_b > 0u64, "Reserves empty");
        
        let output = (&payment * &reserve_b) / (&reserve_a + &payment);
        require!(output > 0u64 && output < reserve_b, "Invalid output");
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        self.pair_reserve_a(pair_id).set(&reserve_a + &payment);
        self.pair_reserve_b(pair_id).set(&reserve_b - &output);
        
        self.distribute_fee(pair_id, &fee, false);
        
        let caller = self.blockchain().get_caller();
        let token_b = self.pair_token_b(pair_id).get();
        self.send().direct_kda(&caller, &token_b, 0, &user_gets);
    }

    /// Swap KLV for token A (when token_b is KLV)
    #[endpoint(swapKlvToA)]
    #[payable("KLV")]
    fn swap_klv_to_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_is_active(pair_id).get(), "Pair is not active");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let payment = self.call_value().klv_value().clone_value();
        require!(payment > 0u64, "Payment must be greater than 0");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > 0u64 && reserve_b > 0u64, "Reserves empty");
        
        let output = (&payment * &reserve_a) / (&reserve_b + &payment);
        require!(output > 0u64 && output < reserve_a, "Invalid output");
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        self.pair_reserve_b(pair_id).set(&reserve_b + &payment);
        self.pair_reserve_a(pair_id).set(&reserve_a - &output);
        
        self.distribute_fee(pair_id, &fee, true);
        
        let caller = self.blockchain().get_caller();
        let token_a = self.pair_token_a(pair_id).get();
        self.send().direct_kda(&caller, &token_a, 0, &user_gets);
    }

    // ========================================================================
    // INTERNAL HELPER FUNCTIONS
    // ========================================================================

    fn pair_exists(&self, pair_id: u64) -> bool {
        self.registered_pair_ids().contains(&pair_id)
    }

    fn get_total_shares_internal(&self, pair_id: u64) -> BigUint {
        self.owner_shares(pair_id).get() + self.total_lp_shares(pair_id).get()
    }

    /// Calculate shares for single-token deposit
    /// is_token_a: true if depositing token A, false for token B
    fn calculate_shares_for_single_token(&self, pair_id: u64, amount: &BigUint, is_token_a: bool) -> BigUint {
        let total_shares = self.get_total_shares_internal(pair_id);
        
        if total_shares == BigUint::zero() {
            amount.clone()
        } else {
            let reserve = if is_token_a {
                self.pair_reserve_a(pair_id).get()
            } else {
                self.pair_reserve_b(pair_id).get()
            };
            
            if reserve == BigUint::zero() {
                amount.clone()
            } else {
                let reserve_before_deposit = &reserve - amount;
                if reserve_before_deposit == BigUint::zero() {
                    amount.clone()
                } else {
                    amount * &total_shares / &reserve_before_deposit
                }
            }
        }
    }

    /// Add shares to an LP and update tracking
    fn add_lp_shares(&self, pair_id: u64, addr: &ManagedAddress, shares: &BigUint) {
        let is_new_lp = !self.lp_list(pair_id).contains(addr);
        
        if is_new_lp {
            self.lp_list(pair_id).insert(addr.clone());
            self.lp_entry_index_a(pair_id, addr).set(self.fee_per_share_a(pair_id).get());
            self.lp_entry_index_b(pair_id, addr).set(self.fee_per_share_b(pair_id).get());
            self.lp_shares(pair_id, addr).set(shares);
        } else {
            self.lp_shares(pair_id, addr).update(|s| *s += shares);
        }
        
        self.total_lp_shares(pair_id).update(|s| *s += shares);
    }

    /// Distribute fee between owner and LPs
    fn distribute_fee(&self, pair_id: u64, fee: &BigUint, is_token_a: bool) {
        if fee == &BigUint::zero() {
            return;
        }
        
        let owner_shares = self.owner_shares(pair_id).get();
        let total_lp_shares = self.total_lp_shares(pair_id).get();
        let total_shares = &owner_shares + &total_lp_shares;
        
        if total_shares == BigUint::zero() {
            return;
        }
        
        let precision = BigUint::from(PRECISION);
        
        let owner_pct = if total_shares > BigUint::zero() {
            &owner_shares * &precision / &total_shares
        } else {
            BigUint::zero()
        };
        
        let nine = BigUint::from(9u64);
        let ten = BigUint::from(10u64);
        let numerator = &nine * &owner_pct + &precision;
        let denominator = &ten * &precision;
        let owner_portion = fee.clone() * numerator / denominator;
        
        let lp_portion = if fee > &owner_portion {
            fee - &owner_portion
        } else {
            BigUint::zero()
        };
        
        if is_token_a {
            self.owner_unclaimed_fees_a(pair_id).update(|f| *f += &owner_portion);
            
            if total_lp_shares > BigUint::zero() && lp_portion > BigUint::zero() {
                let fee_per_share_increase = &lp_portion * &precision / &total_lp_shares;
                self.fee_per_share_a(pair_id).update(|f| *f += fee_per_share_increase);
            }
        } else {
            self.owner_unclaimed_fees_b(pair_id).update(|f| *f += &owner_portion);
            
            if total_lp_shares > BigUint::zero() && lp_portion > BigUint::zero() {
                let fee_per_share_increase = &lp_portion * &precision / &total_lp_shares;
                self.fee_per_share_b(pair_id).update(|f| *f += fee_per_share_increase);
            }
        }
    }

    /// Claim pending fees for an LP and send them
    fn claim_pending_fees_internal(&self, pair_id: u64, addr: &ManagedAddress) {
        if !self.lp_list(pair_id).contains(addr) {
            return;
        }
        
        let shares = self.lp_shares(pair_id, addr).get();
        if shares == BigUint::zero() {
            return;
        }
        
        let precision = BigUint::from(PRECISION);
        
        let current_index_a = self.fee_per_share_a(pair_id).get();
        let entry_index_a = self.lp_entry_index_a(pair_id, addr).get();
        
        let pending_a = if current_index_a > entry_index_a {
            (&current_index_a - &entry_index_a) * &shares / &precision
        } else {
            BigUint::zero()
        };
        
        let current_index_b = self.fee_per_share_b(pair_id).get();
        let entry_index_b = self.lp_entry_index_b(pair_id, addr).get();
        
        let pending_b = if current_index_b > entry_index_b {
            (&current_index_b - &entry_index_b) * &shares / &precision
        } else {
            BigUint::zero()
        };
        
        self.lp_entry_index_a(pair_id, addr).set(&current_index_a);
        self.lp_entry_index_b(pair_id, addr).set(&current_index_b);
        
        if pending_a > BigUint::zero() {
            if self.pair_token_a_is_klv(pair_id).get() {
                self.send().direct_klv(addr, &pending_a);
            } else {
                let token_a = self.pair_token_a(pair_id).get();
                self.send().direct_kda(addr, &token_a, 0, &pending_a);
            }
        }
        
        if pending_b > BigUint::zero() {
            if self.pair_token_b_is_klv(pair_id).get() {
                self.send().direct_klv(addr, &pending_b);
            } else {
                let token_b = self.pair_token_b(pair_id).get();
                self.send().direct_kda(addr, &token_b, 0, &pending_b);
            }
        }
    }

    /// Calculate pending fees for an LP (without claiming)
    fn calculate_lp_pending_fees(&self, pair_id: u64, addr: &ManagedAddress) -> (BigUint, BigUint) {
        if !self.lp_list(pair_id).contains(addr) {
            return (BigUint::zero(), BigUint::zero());
        }
        
        let shares = self.lp_shares(pair_id, addr).get();
        if shares == BigUint::zero() {
            return (BigUint::zero(), BigUint::zero());
        }
        
        let precision = BigUint::from(PRECISION);
        
        let current_index_a = self.fee_per_share_a(pair_id).get();
        let entry_index_a = self.lp_entry_index_a(pair_id, addr).get();
        
        let pending_a = if current_index_a > entry_index_a {
            (&current_index_a - &entry_index_a) * &shares / &precision
        } else {
            BigUint::zero()
        };
        
        let current_index_b = self.fee_per_share_b(pair_id).get();
        let entry_index_b = self.lp_entry_index_b(pair_id, addr).get();
        
        let pending_b = if current_index_b > entry_index_b {
            (&current_index_b - &entry_index_b) * &shares / &precision
        } else {
            BigUint::zero()
        };
        
        (pending_a, pending_b)
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    #[view(getReserves)]
    fn get_reserves(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint> {
        (
            self.pair_reserve_a(pair_id).get(),
            self.pair_reserve_b(pair_id).get(),
        ).into()
    }

    #[view(getPairInfo)]
    fn get_pair_info(&self, pair_id: u64) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(pair_id).get(),
            self.pair_token_b(pair_id).get(),
            self.pair_token_a_is_klv(pair_id).get(),
            self.pair_token_b_is_klv(pair_id).get(),
            self.pair_reserve_a(pair_id).get(),
            self.pair_reserve_b(pair_id).get(),
            self.pair_fee_percent(pair_id).get(),
            self.pair_is_active(pair_id).get(),
        ).into()
    }

    #[view(getTotalShares)]
    fn get_total_shares(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint> {
        (
            self.owner_shares(pair_id).get(),
            self.total_lp_shares(pair_id).get(),
        ).into()
    }

    #[view(getOwnerFees)]
    fn get_owner_fees(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint> {
        (
            self.owner_unclaimed_fees_a(pair_id).get(),
            self.owner_unclaimed_fees_b(pair_id).get(),
        ).into()
    }

    #[view(getLpPosition)]
    fn get_lp_position(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue4<BigUint, BigUint, BigUint, BigUint> {
        let shares = self.lp_shares(pair_id, &addr).get();
        let total_shares = self.get_total_shares_internal(pair_id);
        let precision = BigUint::from(PRECISION);
        
        let pending_a = if shares > BigUint::zero() && self.lp_list(pair_id).contains(&addr) {
            let current_index = self.fee_per_share_a(pair_id).get();
            let entry_index = self.lp_entry_index_a(pair_id, &addr).get();
            if current_index > entry_index {
                (&current_index - &entry_index) * &shares / &precision
            } else {
                BigUint::zero()
            }
        } else {
            BigUint::zero()
        };
        
        let pending_b = if shares > BigUint::zero() && self.lp_list(pair_id).contains(&addr) {
            let current_index = self.fee_per_share_b(pair_id).get();
            let entry_index = self.lp_entry_index_b(pair_id, &addr).get();
            if current_index > entry_index {
                (&current_index - &entry_index) * &shares / &precision
            } else {
                BigUint::zero()
            }
        } else {
            BigUint::zero()
        };
        
        let pool_share_pct = if total_shares > BigUint::zero() {
            shares.clone() * BigUint::from(100_000_000u64) / &total_shares
        } else {
            BigUint::zero()
        };
        
        (shares, pending_a, pending_b, pool_share_pct).into()
    }

    /// Get user's pending deposits (V3.1 pending liquidity system)
    #[view(getPendingDeposits)]
    fn get_pending_deposits(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue4<BigUint, BigUint, BigUint, BigUint> {
        let pending_a = self.pending_a(pair_id, &addr).get();
        let pending_b = self.pending_b(pair_id, &addr).get();
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        let total_shares = self.get_total_shares_internal(pair_id);
        
        let (estimated_shares, estimated_excess_b) = if pending_a == BigUint::zero() || pending_b == BigUint::zero() {
            (BigUint::zero(), BigUint::zero())
        } else if reserve_a == BigUint::zero() || reserve_b == BigUint::zero() {
            let product = &pending_a * &pending_b;
            let sqrt_shares = product.sqrt();
            if sqrt_shares > BigUint::from(MINIMUM_LIQUIDITY) {
                (sqrt_shares - BigUint::from(MINIMUM_LIQUIDITY), BigUint::zero())
            } else {
                (BigUint::zero(), BigUint::zero())
            }
        } else {
            let b_needed = &pending_a * &reserve_b / &reserve_a;
            
            let (use_a, use_b, excess_b) = if b_needed <= pending_b {
                (pending_a.clone(), b_needed.clone(), &pending_b - &b_needed)
            } else {
                let a_needed = &pending_b * &reserve_a / &reserve_b;
                (a_needed, pending_b.clone(), BigUint::zero())
            };
            
            if use_a > BigUint::zero() && use_b > BigUint::zero() {
                let shares_a = &use_a * &total_shares / &reserve_a;
                let shares_b = &use_b * &total_shares / &reserve_b;
                let shares = if shares_a < shares_b { shares_a } else { shares_b };
                (shares, excess_b)
            } else {
                (BigUint::zero(), BigUint::zero())
            }
        };
        
        (pending_a, pending_b, estimated_shares, estimated_excess_b).into()
    }

    #[view(getLpCount)]
    fn get_lp_count(&self, pair_id: u64) -> usize {
        self.lp_list(pair_id).len()
    }

    #[view(isLp)]
    fn is_lp(&self, pair_id: u64, addr: ManagedAddress) -> bool {
        self.lp_list(pair_id).contains(&addr)
    }

    /// Get all LP addresses for a pair
    #[view(getLpList)]
    fn get_lp_list(&self, pair_id: u64) -> MultiValueEncoded<ManagedAddress> {
        let mut result = MultiValueEncoded::new();
        for addr in self.lp_list(pair_id).iter() {
            result.push(addr);
        }
        result
    }

    /// Get LP info: (address, shares, unclaimed_fees_a, unclaimed_fees_b)
    #[view(getLpInfo)]
    fn get_lp_info(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue4<ManagedAddress, BigUint, BigUint, BigUint> {
        let shares = self.lp_shares(pair_id, &addr).get();
        let (fees_a, fees_b) = self.calculate_lp_pending_fees(pair_id, &addr);
        (addr, shares, fees_a, fees_b).into()
    }

    /// Get all LPs with their info for a pair (paginated)
    #[view(getAllLpInfo)]
    fn get_all_lp_info(&self, pair_id: u64) -> MultiValueEncoded<MultiValue4<ManagedAddress, BigUint, BigUint, BigUint>> {
        let mut result = MultiValueEncoded::new();
        for addr in self.lp_list(pair_id).iter() {
            let shares = self.lp_shares(pair_id, &addr).get();
            let (fees_a, fees_b) = self.calculate_lp_pending_fees(pair_id, &addr);
            result.push((addr, shares, fees_a, fees_b).into());
        }
        result
    }

    #[view(getRegisteredPairs)]
    fn get_registered_pairs(&self) -> MultiValueEncoded<u64> {
        let mut result = MultiValueEncoded::new();
        for pair_id in self.registered_pair_ids().iter() {
            result.push(pair_id);
        }
        result
    }

    #[view(getAllPairIds)]
    fn get_all_pair_ids(&self) -> MultiValueEncoded<u64> {
        self.get_registered_pairs()
    }

    #[view(getNextPairId)]
    fn get_next_pair_id(&self) -> u64 {
        self.next_pair_id().get()
    }

    // ========================================================================
    // PARAMETER-LESS VIEW FUNCTIONS (Klever API Workaround)
    // ========================================================================

    #[view(getPairInfoPair1)]
    fn get_pair_info_pair_1(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(1u64)
    }

    #[view(getOwnerFeesPair1)]
    fn get_owner_fees_pair_1(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(1u64)
    }

    #[view(getPairInfoPair2)]
    fn get_pair_info_pair_2(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(2u64)
    }

    #[view(getOwnerFeesPair2)]
    fn get_owner_fees_pair_2(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(2u64)
    }

    #[view(getPairInfoPair3)]
    fn get_pair_info_pair_3(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(3u64)
    }

    #[view(getOwnerFeesPair3)]
    fn get_owner_fees_pair_3(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(3u64)
    }

    #[view(getPairInfoPair4)]
    fn get_pair_info_pair_4(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(4u64)
    }

    #[view(getOwnerFeesPair4)]
    fn get_owner_fees_pair_4(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(4u64)
    }

    #[view(getPairInfoPair5)]
    fn get_pair_info_pair_5(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(5u64)
    }

    #[view(getOwnerFeesPair5)]
    fn get_owner_fees_pair_5(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(5u64)
    }

    #[view(getPairInfoPair6)]
    fn get_pair_info_pair_6(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(6u64)
    }

    #[view(getOwnerFeesPair6)]
    fn get_owner_fees_pair_6(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(6u64)
    }

    #[view(getPairInfoPair7)]
    fn get_pair_info_pair_7(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(7u64)
    }

    #[view(getOwnerFeesPair7)]
    fn get_owner_fees_pair_7(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(7u64)
    }

    #[view(getPairInfoPair8)]
    fn get_pair_info_pair_8(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(8u64)
    }

    #[view(getOwnerFeesPair8)]
    fn get_owner_fees_pair_8(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(8u64)
    }

    #[view(getPairInfoPair9)]
    fn get_pair_info_pair_9(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(9u64)
    }

    #[view(getOwnerFeesPair9)]
    fn get_owner_fees_pair_9(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(9u64)
    }

    #[view(getPairInfoPair10)]
    fn get_pair_info_pair_10(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(10u64)
    }

    #[view(getOwnerFeesPair10)]
    fn get_owner_fees_pair_10(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(10u64)
    }

    // Parameter-less view functions for getTotalShares (Klever API workaround)
    #[view(getTotalSharesPair1)]
    fn get_total_shares_pair_1(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(1u64)
    }

    #[view(getTotalSharesPair2)]
    fn get_total_shares_pair_2(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(2u64)
    }

    #[view(getTotalSharesPair3)]
    fn get_total_shares_pair_3(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(3u64)
    }

    #[view(getTotalSharesPair4)]
    fn get_total_shares_pair_4(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(4u64)
    }

    #[view(getTotalSharesPair5)]
    fn get_total_shares_pair_5(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(5u64)
    }

    #[view(getTotalSharesPair6)]
    fn get_total_shares_pair_6(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(6u64)
    }

    #[view(getTotalSharesPair7)]
    fn get_total_shares_pair_7(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(7u64)
    }

    #[view(getTotalSharesPair8)]
    fn get_total_shares_pair_8(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(8u64)
    }

    #[view(getTotalSharesPair9)]
    fn get_total_shares_pair_9(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(9u64)
    }

    #[view(getTotalSharesPair10)]
    fn get_total_shares_pair_10(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(10u64)
    }

    // --- Pairs 11-20 ---
    #[view(getPairInfoPair11)]
    fn get_pair_info_pair_11(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(11u64)
    }
    #[view(getOwnerFeesPair11)]
    fn get_owner_fees_pair_11(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(11u64)
    }
    #[view(getTotalSharesPair11)]
    fn get_total_shares_pair_11(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(11u64)
    }

    #[view(getPairInfoPair12)]
    fn get_pair_info_pair_12(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(12u64)
    }
    #[view(getOwnerFeesPair12)]
    fn get_owner_fees_pair_12(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(12u64)
    }
    #[view(getTotalSharesPair12)]
    fn get_total_shares_pair_12(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(12u64)
    }

    #[view(getPairInfoPair13)]
    fn get_pair_info_pair_13(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(13u64)
    }
    #[view(getOwnerFeesPair13)]
    fn get_owner_fees_pair_13(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(13u64)
    }
    #[view(getTotalSharesPair13)]
    fn get_total_shares_pair_13(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(13u64)
    }

    #[view(getPairInfoPair14)]
    fn get_pair_info_pair_14(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(14u64)
    }
    #[view(getOwnerFeesPair14)]
    fn get_owner_fees_pair_14(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(14u64)
    }
    #[view(getTotalSharesPair14)]
    fn get_total_shares_pair_14(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(14u64)
    }

    #[view(getPairInfoPair15)]
    fn get_pair_info_pair_15(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(15u64)
    }
    #[view(getOwnerFeesPair15)]
    fn get_owner_fees_pair_15(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(15u64)
    }
    #[view(getTotalSharesPair15)]
    fn get_total_shares_pair_15(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(15u64)
    }

    #[view(getPairInfoPair16)]
    fn get_pair_info_pair_16(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(16u64)
    }
    #[view(getOwnerFeesPair16)]
    fn get_owner_fees_pair_16(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(16u64)
    }
    #[view(getTotalSharesPair16)]
    fn get_total_shares_pair_16(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(16u64)
    }

    #[view(getPairInfoPair17)]
    fn get_pair_info_pair_17(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(17u64)
    }
    #[view(getOwnerFeesPair17)]
    fn get_owner_fees_pair_17(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(17u64)
    }
    #[view(getTotalSharesPair17)]
    fn get_total_shares_pair_17(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(17u64)
    }

    #[view(getPairInfoPair18)]
    fn get_pair_info_pair_18(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(18u64)
    }
    #[view(getOwnerFeesPair18)]
    fn get_owner_fees_pair_18(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(18u64)
    }
    #[view(getTotalSharesPair18)]
    fn get_total_shares_pair_18(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(18u64)
    }

    #[view(getPairInfoPair19)]
    fn get_pair_info_pair_19(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(19u64)
    }
    #[view(getOwnerFeesPair19)]
    fn get_owner_fees_pair_19(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(19u64)
    }
    #[view(getTotalSharesPair19)]
    fn get_total_shares_pair_19(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(19u64)
    }

    #[view(getPairInfoPair20)]
    fn get_pair_info_pair_20(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(20u64)
    }
    #[view(getOwnerFeesPair20)]
    fn get_owner_fees_pair_20(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(20u64)
    }
    #[view(getTotalSharesPair20)]
    fn get_total_shares_pair_20(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(20u64)
    }
    // ========================================================================
    // PAIR VIEW FUNCTIONS 21-50
    // ========================================================================
    #[view(getPairInfoPair21)]
    fn get_pair_info_pair_21(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(21u64)
    }
    #[view(getOwnerFeesPair21)]
    fn get_owner_fees_pair_21(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(21u64)
    }
    #[view(getTotalSharesPair21)]
    fn get_total_shares_pair_21(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(21u64)
    }
    #[view(getPairInfoPair22)]
    fn get_pair_info_pair_22(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(22u64)
    }
    #[view(getOwnerFeesPair22)]
    fn get_owner_fees_pair_22(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(22u64)
    }
    #[view(getTotalSharesPair22)]
    fn get_total_shares_pair_22(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(22u64)
    }
    #[view(getPairInfoPair23)]
    fn get_pair_info_pair_23(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(23u64)
    }
    #[view(getOwnerFeesPair23)]
    fn get_owner_fees_pair_23(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(23u64)
    }
    #[view(getTotalSharesPair23)]
    fn get_total_shares_pair_23(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(23u64)
    }
    #[view(getPairInfoPair24)]
    fn get_pair_info_pair_24(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(24u64)
    }
    #[view(getOwnerFeesPair24)]
    fn get_owner_fees_pair_24(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(24u64)
    }
    #[view(getTotalSharesPair24)]
    fn get_total_shares_pair_24(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(24u64)
    }
    #[view(getPairInfoPair25)]
    fn get_pair_info_pair_25(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(25u64)
    }
    #[view(getOwnerFeesPair25)]
    fn get_owner_fees_pair_25(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(25u64)
    }
    #[view(getTotalSharesPair25)]
    fn get_total_shares_pair_25(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(25u64)
    }
    #[view(getPairInfoPair26)]
    fn get_pair_info_pair_26(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(26u64)
    }
    #[view(getOwnerFeesPair26)]
    fn get_owner_fees_pair_26(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(26u64)
    }
    #[view(getTotalSharesPair26)]
    fn get_total_shares_pair_26(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(26u64)
    }
    #[view(getPairInfoPair27)]
    fn get_pair_info_pair_27(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(27u64)
    }
    #[view(getOwnerFeesPair27)]
    fn get_owner_fees_pair_27(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(27u64)
    }
    #[view(getTotalSharesPair27)]
    fn get_total_shares_pair_27(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(27u64)
    }
    #[view(getPairInfoPair28)]
    fn get_pair_info_pair_28(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(28u64)
    }
    #[view(getOwnerFeesPair28)]
    fn get_owner_fees_pair_28(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(28u64)
    }
    #[view(getTotalSharesPair28)]
    fn get_total_shares_pair_28(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(28u64)
    }
    #[view(getPairInfoPair29)]
    fn get_pair_info_pair_29(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(29u64)
    }
    #[view(getOwnerFeesPair29)]
    fn get_owner_fees_pair_29(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(29u64)
    }
    #[view(getTotalSharesPair29)]
    fn get_total_shares_pair_29(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(29u64)
    }
    #[view(getPairInfoPair30)]
    fn get_pair_info_pair_30(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(30u64)
    }
    #[view(getOwnerFeesPair30)]
    fn get_owner_fees_pair_30(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(30u64)
    }
    #[view(getTotalSharesPair30)]
    fn get_total_shares_pair_30(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(30u64)
    }
    #[view(getPairInfoPair31)]
    fn get_pair_info_pair_31(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(31u64)
    }
    #[view(getOwnerFeesPair31)]
    fn get_owner_fees_pair_31(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(31u64)
    }
    #[view(getTotalSharesPair31)]
    fn get_total_shares_pair_31(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(31u64)
    }
    #[view(getPairInfoPair32)]
    fn get_pair_info_pair_32(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(32u64)
    }
    #[view(getOwnerFeesPair32)]
    fn get_owner_fees_pair_32(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(32u64)
    }
    #[view(getTotalSharesPair32)]
    fn get_total_shares_pair_32(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(32u64)
    }
    #[view(getPairInfoPair33)]
    fn get_pair_info_pair_33(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(33u64)
    }
    #[view(getOwnerFeesPair33)]
    fn get_owner_fees_pair_33(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(33u64)
    }
    #[view(getTotalSharesPair33)]
    fn get_total_shares_pair_33(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(33u64)
    }
    #[view(getPairInfoPair34)]
    fn get_pair_info_pair_34(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(34u64)
    }
    #[view(getOwnerFeesPair34)]
    fn get_owner_fees_pair_34(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(34u64)
    }
    #[view(getTotalSharesPair34)]
    fn get_total_shares_pair_34(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(34u64)
    }
    #[view(getPairInfoPair35)]
    fn get_pair_info_pair_35(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(35u64)
    }
    #[view(getOwnerFeesPair35)]
    fn get_owner_fees_pair_35(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(35u64)
    }
    #[view(getTotalSharesPair35)]
    fn get_total_shares_pair_35(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(35u64)
    }
    #[view(getPairInfoPair36)]
    fn get_pair_info_pair_36(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(36u64)
    }
    #[view(getOwnerFeesPair36)]
    fn get_owner_fees_pair_36(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(36u64)
    }
    #[view(getTotalSharesPair36)]
    fn get_total_shares_pair_36(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(36u64)
    }
    #[view(getPairInfoPair37)]
    fn get_pair_info_pair_37(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(37u64)
    }
    #[view(getOwnerFeesPair37)]
    fn get_owner_fees_pair_37(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(37u64)
    }
    #[view(getTotalSharesPair37)]
    fn get_total_shares_pair_37(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(37u64)
    }
    #[view(getPairInfoPair38)]
    fn get_pair_info_pair_38(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(38u64)
    }
    #[view(getOwnerFeesPair38)]
    fn get_owner_fees_pair_38(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(38u64)
    }
    #[view(getTotalSharesPair38)]
    fn get_total_shares_pair_38(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(38u64)
    }
    #[view(getPairInfoPair39)]
    fn get_pair_info_pair_39(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(39u64)
    }
    #[view(getOwnerFeesPair39)]
    fn get_owner_fees_pair_39(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(39u64)
    }
    #[view(getTotalSharesPair39)]
    fn get_total_shares_pair_39(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(39u64)
    }
    #[view(getPairInfoPair40)]
    fn get_pair_info_pair_40(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(40u64)
    }
    #[view(getOwnerFeesPair40)]
    fn get_owner_fees_pair_40(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(40u64)
    }
    #[view(getTotalSharesPair40)]
    fn get_total_shares_pair_40(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(40u64)
    }
    #[view(getPairInfoPair41)]
    fn get_pair_info_pair_41(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(41u64)
    }
    #[view(getOwnerFeesPair41)]
    fn get_owner_fees_pair_41(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(41u64)
    }
    #[view(getTotalSharesPair41)]
    fn get_total_shares_pair_41(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(41u64)
    }
    #[view(getPairInfoPair42)]
    fn get_pair_info_pair_42(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(42u64)
    }
    #[view(getOwnerFeesPair42)]
    fn get_owner_fees_pair_42(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(42u64)
    }
    #[view(getTotalSharesPair42)]
    fn get_total_shares_pair_42(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(42u64)
    }
    #[view(getPairInfoPair43)]
    fn get_pair_info_pair_43(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(43u64)
    }
    #[view(getOwnerFeesPair43)]
    fn get_owner_fees_pair_43(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(43u64)
    }
    #[view(getTotalSharesPair43)]
    fn get_total_shares_pair_43(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(43u64)
    }
    #[view(getPairInfoPair44)]
    fn get_pair_info_pair_44(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(44u64)
    }
    #[view(getOwnerFeesPair44)]
    fn get_owner_fees_pair_44(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(44u64)
    }
    #[view(getTotalSharesPair44)]
    fn get_total_shares_pair_44(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(44u64)
    }
    #[view(getPairInfoPair45)]
    fn get_pair_info_pair_45(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(45u64)
    }
    #[view(getOwnerFeesPair45)]
    fn get_owner_fees_pair_45(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(45u64)
    }
    #[view(getTotalSharesPair45)]
    fn get_total_shares_pair_45(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(45u64)
    }
    #[view(getPairInfoPair46)]
    fn get_pair_info_pair_46(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(46u64)
    }
    #[view(getOwnerFeesPair46)]
    fn get_owner_fees_pair_46(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(46u64)
    }
    #[view(getTotalSharesPair46)]
    fn get_total_shares_pair_46(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(46u64)
    }
    #[view(getPairInfoPair47)]
    fn get_pair_info_pair_47(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(47u64)
    }
    #[view(getOwnerFeesPair47)]
    fn get_owner_fees_pair_47(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(47u64)
    }
    #[view(getTotalSharesPair47)]
    fn get_total_shares_pair_47(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(47u64)
    }
    #[view(getPairInfoPair48)]
    fn get_pair_info_pair_48(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(48u64)
    }
    #[view(getOwnerFeesPair48)]
    fn get_owner_fees_pair_48(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(48u64)
    }
    #[view(getTotalSharesPair48)]
    fn get_total_shares_pair_48(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(48u64)
    }
    #[view(getPairInfoPair49)]
    fn get_pair_info_pair_49(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(49u64)
    }
    #[view(getOwnerFeesPair49)]
    fn get_owner_fees_pair_49(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(49u64)
    }
    #[view(getTotalSharesPair49)]
    fn get_total_shares_pair_49(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(49u64)
    }
    #[view(getPairInfoPair50)]
    fn get_pair_info_pair_50(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        self.get_pair_info(50u64)
    }
    #[view(getOwnerFeesPair50)]
    fn get_owner_fees_pair_50(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_owner_fees(50u64)
    }
    #[view(getTotalSharesPair50)]
    fn get_total_shares_pair_50(&self) -> MultiValue2<BigUint, BigUint> {
        self.get_total_shares(50u64)
    }

    // ========================================================================
    // MIGRATION HELPERS (V2 -> V3)
    // ========================================================================

    #[only_owner]
    #[endpoint(migrateExistingLiquidity)]
    fn migrate_existing_liquidity(&self, pair_id: u64, reserve_a: BigUint, reserve_b: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let shares = if reserve_a > reserve_b {
            reserve_a.clone()
        } else {
            reserve_b.clone()
        };
        
        self.owner_shares(pair_id).set(&shares);
        self.pair_reserve_a(pair_id).set(&reserve_a);
        self.pair_reserve_b(pair_id).set(&reserve_b);
    }

    /// Emergency function to set owner shares directly (owner only)
    /// Use when ownerInitializeLiquidity can't be called (LPs already joined)
    /// Calculates sqrt(reserve_a * reserve_b) automatically
    #[only_owner]
    #[endpoint(adminSetOwnerShares)]
    fn admin_set_owner_shares(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(reserve_a > BigUint::zero(), "No reserve A");
        require!(reserve_b > BigUint::zero(), "No reserve B");
        
        // Calculate using sqrt(a * b) formula
        let product = &reserve_a * &reserve_b;
        let sqrt_shares = product.sqrt();
        
        // Set owner shares (no check for LPs - emergency use only)
        self.owner_shares(pair_id).set(sqrt_shares);
    }

    // ========================================================================
    // STORAGE MAPPERS
    // ========================================================================

    #[storage_mapper("next_pair_id")]
    fn next_pair_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("registered_pair_ids")]
    fn registered_pair_ids(&self) -> UnorderedSetMapper<u64>;

    #[storage_mapper("pair_token_a")]
    fn pair_token_a(&self, pair_id: u64) -> SingleValueMapper<TokenIdentifier>;

    #[storage_mapper("pair_token_b")]
    fn pair_token_b(&self, pair_id: u64) -> SingleValueMapper<TokenIdentifier>;

    #[storage_mapper("pair_token_a_is_klv")]
    fn pair_token_a_is_klv(&self, pair_id: u64) -> SingleValueMapper<bool>;

    #[storage_mapper("pair_token_b_is_klv")]
    fn pair_token_b_is_klv(&self, pair_id: u64) -> SingleValueMapper<bool>;

    #[storage_mapper("pair_reserve_a")]
    fn pair_reserve_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pair_reserve_b")]
    fn pair_reserve_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pair_fee_percent")]
    fn pair_fee_percent(&self, pair_id: u64) -> SingleValueMapper<u64>;

    #[storage_mapper("pair_is_active")]
    fn pair_is_active(&self, pair_id: u64) -> SingleValueMapper<bool>;

    #[storage_mapper("owner_shares")]
    fn owner_shares(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("lp_shares")]
    fn lp_shares(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("total_lp_shares")]
    fn total_lp_shares(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("lp_list")]
    fn lp_list(&self, pair_id: u64) -> UnorderedSetMapper<ManagedAddress>;

    #[storage_mapper("owner_unclaimed_fees_a")]
    fn owner_unclaimed_fees_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("owner_unclaimed_fees_b")]
    fn owner_unclaimed_fees_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("fee_per_share_a")]
    fn fee_per_share_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("fee_per_share_b")]
    fn fee_per_share_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("lp_entry_index_a")]
    fn lp_entry_index_a(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("lp_entry_index_b")]
    fn lp_entry_index_b(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

    // --- Pending Liquidity (V3.1) ---
    #[storage_mapper("pending_a")]
    fn pending_a(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pending_b")]
    fn pending_b(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
