#![no_std]

use klever_sc::imports::*;

// ============================================================================
// DIGIKO MULTI-PAIR DEX CONTRACT V5 - PUBLIC PAIR CREATION
// ============================================================================
// Evolution from V4: Permissionless pair creation & unlimited pools!
//
// V5 NEW: Public Pair Creation
//   - Anyone can create trading pairs (no more owner-only)
//   - No limit on number of pairs (removed hardcoded 50-pair views)
//   - First LP to mint sets the price ratio
//   - Pair creators can delete empty pairs
//   - Track pair creator for future governance
//
// V5 NEW: Simplified Liquidity System
//   - Removed: ownerAddLiquidityA/B, ownerInitializeLiquidity
//   - Everyone (including owner) uses mint() to add liquidity
//   - Owner becomes a regular LP - no special "owner shares"
//   - Empty pools: first mint() sets the ratio, gets sqrt(a*b) - MIN_LIQ shares
//
// V5 MIGRATION: Before upgrading from V4
//   - Owner should remove existing owner_shares via ownerRemoveLiquidity()
//   - After upgrade, owner can add liquidity as regular LP via mint()
//
// V4 FEATURES (Retained):
//   - Single-Transaction Mint: mint(pair_id, min_shares)
//   - Pending Liquidity System (V3.1): deposit → finalize flow
//
// Fee Structure (Simplified):
//   - Total swap fee: 1% (configurable per pair)
//   - ALL LPs (including owner): earn 0.9% of fees
//   - Contract owner: earns 0.1% cut from all fees (platform fee)
//
// Share System:
//   - owner_shares: LEGACY - kept for migration, should be 0 after migration
//   - lp_shares: Individual LP's share (everyone uses this now)
//   - total_lp_shares: Sum of all LP shares
// ============================================================================

// Precision factor for fee calculations (1e12)
const PRECISION: u64 = 1_000_000_000_000;

// Minimum liquidity burned on first deposit to prevent dust attacks
const MINIMUM_LIQUIDITY: u64 = 1000;

#[klever_sc::contract]
pub trait DigikoDexV5 {
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    #[init]
    fn init(&self) {
        self.next_pair_id().set(1u64);
    }

    #[upgrade]
    fn upgrade(&self) {
        // Initialize next_pair_id if not set (for upgrades from earlier versions)
        if self.next_pair_id().is_empty() {
            self.next_pair_id().set(1u64);
        }
        // V5: Set pair_creator for existing pairs to contract owner (migration)
        // This is handled lazily - existing pairs without creator default to owner
    }

    // ========================================================================
    // PUBLIC: PAIR CREATION (V5 - Anyone can create!)
    // ========================================================================

    /// Create a new trading pair (PUBLIC - anyone can call!)
    /// Returns the pair_id for the new pair
    /// 
    /// NOTE: Duplicate pairs (same token combination) are allowed but not recommended
    /// Use findPairsByTokens() to check if a pair already exists before creating
    /// 
    /// @param token_a - First token identifier (e.g., "DGKO-ABCD")
    /// @param token_b - Second token identifier (e.g., "KLV" or "USDT-1234")
    /// @param token_a_is_klv - True if token A is native KLV
    /// @param token_b_is_klv - True if token B is native KLV
    /// @param fee_percent - Swap fee percentage (1-10%)
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
        
        // V5: Validate is_klv flags - prevent broken pairs!
        // If is_klv is false, the token identifier should NOT be "KLV"
        let klv_token = TokenIdentifier::from("KLV");
        if !token_a_is_klv {
            require!(token_a != klv_token, "token_a is KLV but token_a_is_klv is false - pair would be broken");
        }
        if !token_b_is_klv {
            require!(token_b != klv_token, "token_b is KLV but token_b_is_klv is false - pair would be broken");
        }
        
        let pair_id = self.next_pair_id().get();
        self.next_pair_id().set(pair_id + 1);
        
        // Track who created this pair
        let caller = self.blockchain().get_caller();
        self.pair_creator(pair_id).set(&caller);
        
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
        
        // V5: Initialize pending user count
        self.pair_pending_user_count(pair_id).set(0u64);
        
        // Add to registered pairs
        self.registered_pair_ids().insert(pair_id);
        
        pair_id
    }

    /// Delete an empty trading pair
    /// Can only be called by pair creator or contract owner
    /// Requires both reserves to be zero AND no pending user deposits
    #[endpoint(deletePair)]
    fn delete_pair(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let creator = self.get_pair_creator_or_owner(pair_id);
        let owner = self.blockchain().get_owner_address();
        
        require!(
            caller == creator || caller == owner,
            "Only pair creator or contract owner can delete"
        );
        
        // Check reserves are zero
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        require!(
            reserve_a == BigUint::zero() && reserve_b == BigUint::zero(),
            "Cannot delete pair with liquidity"
        );
        
        // Check no LPs in the pair
        require!(
            self.lp_list(pair_id).is_empty(),
            "Cannot delete pair with active LPs"
        );
        
        // Check no owner shares
        let owner_shares = self.owner_shares(pair_id).get();
        require!(
            owner_shares == BigUint::zero(),
            "Cannot delete pair with owner shares"
        );
        
        // V5 FIX: Check no pending deposits from any user
        // We track this with a counter instead of iterating all users
        let pending_users = self.pair_pending_user_count(pair_id).get();
        require!(
            pending_users == 0u64,
            "Cannot delete pair with pending user deposits"
        );
        
        // Check no unclaimed owner fees
        let unclaimed_a = self.owner_unclaimed_fees_a(pair_id).get();
        let unclaimed_b = self.owner_unclaimed_fees_b(pair_id).get();
        require!(
            unclaimed_a == BigUint::zero() && unclaimed_b == BigUint::zero(),
            "Claim owner fees before deleting"
        );
        
        // Clear all storage for this pair
        self.pair_creator(pair_id).clear();
        self.pair_token_a(pair_id).clear();
        self.pair_token_b(pair_id).clear();
        self.pair_token_a_is_klv(pair_id).clear();
        self.pair_token_b_is_klv(pair_id).clear();
        self.pair_reserve_a(pair_id).clear();
        self.pair_reserve_b(pair_id).clear();
        self.pair_fee_percent(pair_id).clear();
        self.pair_is_active(pair_id).clear();
        self.owner_shares(pair_id).clear();
        self.total_lp_shares(pair_id).clear();
        self.owner_unclaimed_fees_a(pair_id).clear();
        self.owner_unclaimed_fees_b(pair_id).clear();
        self.fee_per_share_a(pair_id).clear();
        self.fee_per_share_b(pair_id).clear();
        self.pair_pending_user_count(pair_id).clear();
        
        // Remove from registered pairs
        self.registered_pair_ids().swap_remove(&pair_id);
    }

    // ========================================================================
    // ADMIN: PAIR MANAGEMENT (Owner functions)
    // ========================================================================

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
    /// WARNING: Only use on pairs with zero liquidity
    #[only_owner]
    #[endpoint(updatePairTokenA)]
    fn update_pair_token_a(&self, pair_id: u64, new_token_a: TokenIdentifier, is_klv: bool) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        let reserve_a = self.pair_reserve_a(pair_id).get();
        require!(reserve_a == BigUint::zero(), "Cannot update token with existing liquidity");
        
        self.pair_token_a(pair_id).set(&new_token_a);
        self.pair_token_a_is_klv(pair_id).set(is_klv);
    }

    /// Update token B for a pair (owner only)
    /// WARNING: Only use on pairs with zero liquidity
    #[only_owner]
    #[endpoint(updatePairTokenB)]
    fn update_pair_token_b(&self, pair_id: u64, new_token_b: TokenIdentifier, is_klv: bool) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        let reserve_b = self.pair_reserve_b(pair_id).get();
        require!(reserve_b == BigUint::zero(), "Cannot update token with existing liquidity");
        
        self.pair_token_b(pair_id).set(&new_token_b);
        self.pair_token_b_is_klv(pair_id).set(is_klv);
    }

    // ========================================================================
    // OWNER LIQUIDITY MANAGEMENT (Contract owner special functions)
    // ========================================================================

    /// Owner removes their liquidity (partial or full)
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
        
        if amount_a > BigUint::zero() {
            self.send_token_internal(&owner, &self.pair_token_a(pair_id).get(), 
                self.pair_token_a_is_klv(pair_id).get(), &amount_a);
        }
        
        if amount_b > BigUint::zero() {
            self.send_token_internal(&owner, &self.pair_token_b(pair_id).get(),
                self.pair_token_b_is_klv(pair_id).get(), &amount_b);
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
        
        if fees_a > BigUint::zero() {
            self.send_token_internal(&owner, &self.pair_token_a(pair_id).get(),
                self.pair_token_a_is_klv(pair_id).get(), &fees_a);
        }
        
        if fees_b > BigUint::zero() {
            self.send_token_internal(&owner, &self.pair_token_b(pair_id).get(),
                self.pair_token_b_is_klv(pair_id).get(), &fees_b);
        }
    }

    // ========================================================================
    // V5: UNIFIED MINT - Works for empty pools too!
    // ========================================================================

    /// Add liquidity in ONE transaction (V5 Enhanced)
    /// Works for BOTH empty pools (first LP) and existing pools
    /// 
    /// For empty pools: First LP sets the price ratio
    /// For existing pools: Matches pool ratio, refunds excess
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
        
        // Extract payment amounts from multi-token callValue
        let (amount_a, amount_b) = self.extract_dual_payment(
            &token_a,
            &token_b,
            token_a_is_klv,
            token_b_is_klv
        );
        
        require!(amount_a > BigUint::zero(), "No token A sent");
        require!(amount_b > BigUint::zero(), "No token B sent");
        
        // V5: Handle empty pool case (first LP sets the ratio)
        let (new_shares, used_a, used_b, refund_a, refund_b) = 
            if reserve_a == BigUint::zero() && reserve_b == BigUint::zero() {
                // FIRST LP - They set the price ratio!
                // shares = sqrt(a * b) - MINIMUM_LIQUIDITY (to prevent dust attacks)
                let product = &amount_a * &amount_b;
                let sqrt_shares = product.sqrt();
                
                require!(
                    sqrt_shares > BigUint::from(MINIMUM_LIQUIDITY),
                    "Initial liquidity too small"
                );
                
                let new_shares = sqrt_shares - BigUint::from(MINIMUM_LIQUIDITY);
                
                // Use all provided amounts (no matching needed for first LP)
                (new_shares, amount_a.clone(), amount_b.clone(), BigUint::zero(), BigUint::zero())
            } else {
                // EXISTING POOL - Match to current ratio
                let total_shares = self.owner_shares(pair_id).get() + self.total_lp_shares(pair_id).get();
                
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
                
                (new_shares, used_a, used_b, refund_a, refund_b)
            };
        
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

    // ========================================================================
    // PENDING LIQUIDITY SYSTEM (V3.1 - Two-step deposits)
    // ========================================================================

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
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_a(pair_id, &caller).update(|v| *v += &amount);
        self.track_pending_user_add(pair_id, &caller, had_pending);
    }

    /// Deposit KLV to pending A storage
    #[endpoint(depositPendingAKlv)]
    #[payable("KLV")]
    fn deposit_pending_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_a(pair_id, &caller).update(|v| *v += &amount);
        self.track_pending_user_add(pair_id, &caller, had_pending);
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
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_b(pair_id, &caller).update(|v| *v += &amount);
        self.track_pending_user_add(pair_id, &caller, had_pending);
    }

    /// Deposit KLV to pending B storage
    #[endpoint(depositPendingBKlv)]
    #[payable("KLV")]
    fn deposit_pending_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let caller = self.blockchain().get_caller();
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_b(pair_id, &caller).update(|v| *v += &amount);
        self.track_pending_user_add(pair_id, &caller, had_pending);
    }

    /// Finalize pending deposits into LP position
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
        let (use_a, use_b, shares) = if reserve_a == BigUint::zero() || reserve_b == BigUint::zero() {
            // First liquidity - use everything (user sets the ratio)
            require!(
                &pending_a * &pending_b >= BigUint::from(MINIMUM_LIQUIDITY * MINIMUM_LIQUIDITY),
                "Initial liquidity too small"
            );
            
            let product = &pending_a * &pending_b;
            let sqrt_shares = product.sqrt();
            require!(sqrt_shares > BigUint::from(MINIMUM_LIQUIDITY), "Initial liquidity too small");
            
            (pending_a.clone(), pending_b.clone(), sqrt_shares - BigUint::from(MINIMUM_LIQUIDITY))
        } else {
            // Match at current pool ratio
            let b_needed = &pending_a * &reserve_b / &reserve_a;
            
            let (use_a, use_b) = if b_needed <= pending_b {
                (pending_a.clone(), b_needed)
            } else {
                let a_needed = &pending_b * &reserve_a / &reserve_b;
                (a_needed, pending_b.clone())
            };
            
            require!(use_a > BigUint::zero() && use_b > BigUint::zero(), "Amounts too small to match");
            
            let total_shares = self.get_total_shares_internal(pair_id);
            let shares_a = &use_a * &total_shares / &reserve_a;
            let shares_b = &use_b * &total_shares / &reserve_b;
            let shares = if shares_a < shares_b { shares_a } else { shares_b };
            
            (use_a, use_b, shares)
        };
        
        // Slippage protection
        require!(shares >= min_shares, "Slippage: shares below minimum");
        require!(shares > BigUint::zero(), "Shares must be > 0");
        
        // Claim any pending fees first (if already an LP)
        self.claim_pending_fees_internal(pair_id, &caller);
        
        // V5: Track pending user count - user had pending before (we checked above)
        // Update pending (subtract used amounts)
        let new_pending_a = &pending_a - &use_a;
        let new_pending_b = &pending_b - &use_b;
        self.pending_a(pair_id, &caller).set(&new_pending_a);
        self.pending_b(pair_id, &caller).set(&new_pending_b);
        
        // If user now has no pending deposits, decrement the counter
        if new_pending_a == BigUint::zero() && new_pending_b == BigUint::zero() {
            self.pair_pending_user_count(pair_id).update(|c| {
                if *c > 0 { *c -= 1; }
            });
        }
        
        // Add to reserves
        self.pair_reserve_a(pair_id).update(|r| *r += &use_a);
        self.pair_reserve_b(pair_id).update(|r| *r += &use_b);
        
        // Add LP shares to user
        self.add_lp_shares(pair_id, &caller, &shares);
    }

    /// Withdraw only pending token A
    #[endpoint(withdrawPendingA)]
    fn withdraw_pending_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_a = self.pending_a(pair_id, &caller).get();
        
        require!(pending_a > BigUint::zero(), "No pending token A to withdraw");
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_a(pair_id, &caller).set(BigUint::zero());
        self.track_pending_user_remove(pair_id, &caller, had_pending);
        
        self.send_token_internal(&caller, &self.pair_token_a(pair_id).get(),
            self.pair_token_a_is_klv(pair_id).get(), &pending_a);
    }

    /// Withdraw only pending token B
    #[endpoint(withdrawPendingB)]
    fn withdraw_pending_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_b = self.pending_b(pair_id, &caller).get();
        
        require!(pending_b > BigUint::zero(), "No pending token B to withdraw");
        
        // V5: Track pending user count
        let had_pending = self.user_has_pending(pair_id, &caller);
        self.pending_b(pair_id, &caller).set(BigUint::zero());
        self.track_pending_user_remove(pair_id, &caller, had_pending);
        
        self.send_token_internal(&caller, &self.pair_token_b(pair_id).get(),
            self.pair_token_b_is_klv(pair_id).get(), &pending_b);
    }

    /// Withdraw all pending tokens (both A and B)
    #[endpoint(withdrawPendingAll)]
    fn withdraw_pending_all(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        
        let caller = self.blockchain().get_caller();
        let pending_a = self.pending_a(pair_id, &caller).get();
        let pending_b = self.pending_b(pair_id, &caller).get();
        
        require!(pending_a > BigUint::zero() || pending_b > BigUint::zero(), "No pending deposits");
        
        // V5: Track pending user count (user definitely had pending before)
        self.pending_a(pair_id, &caller).set(BigUint::zero());
        self.pending_b(pair_id, &caller).set(BigUint::zero());
        self.track_pending_user_remove(pair_id, &caller, true); // had_pending = true
        
        if pending_a > BigUint::zero() {
            self.send_token_internal(&caller, &self.pair_token_a(pair_id).get(),
                self.pair_token_a_is_klv(pair_id).get(), &pending_a);
        }
        
        if pending_b > BigUint::zero() {
            self.send_token_internal(&caller, &self.pair_token_b(pair_id).get(),
                self.pair_token_b_is_klv(pair_id).get(), &pending_b);
        }
    }

    // ========================================================================
    // LP MANAGEMENT
    // ========================================================================

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
            self.send_token_internal(&caller, &self.pair_token_a(pair_id).get(),
                self.pair_token_a_is_klv(pair_id).get(), &amount_a);
        }
        
        if amount_b > BigUint::zero() {
            self.send_token_internal(&caller, &self.pair_token_b(pair_id).get(),
                self.pair_token_b_is_klv(pair_id).get(), &amount_b);
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
    // SWAP FUNCTIONS
    // ========================================================================

    /// Swap token A for token B (send KDA token A)
    /// @param pair_id - The pair to swap on
    /// @param min_output - Minimum amount of token B to receive (slippage protection)
    #[endpoint(swapAtoB)]
    #[payable("*")]
    fn swap_a_to_b(&self, pair_id: u64, min_output: BigUint) {
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
        
        let output = (&payment * &reserve_b) / (&reserve_a + &payment);
        require!(output > 0u64 && output < reserve_b, "Invalid output");
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        // V5: Slippage protection
        require!(user_gets >= min_output, "Slippage: output below minimum");
        
        self.pair_reserve_a(pair_id).set(&reserve_a + &payment);
        self.pair_reserve_b(pair_id).set(&reserve_b - &output);
        
        self.distribute_fee(pair_id, &fee, false);
        
        let caller = self.blockchain().get_caller();
        self.send_token_internal(&caller, &self.pair_token_b(pair_id).get(),
            self.pair_token_b_is_klv(pair_id).get(), &user_gets);
    }

    /// Swap token B for token A (send KDA token B)
    /// @param pair_id - The pair to swap on
    /// @param min_output - Minimum amount of token A to receive (slippage protection)
    #[endpoint(swapBtoA)]
    #[payable("*")]
    fn swap_b_to_a(&self, pair_id: u64, min_output: BigUint) {
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
        
        // V5: Slippage protection
        require!(user_gets >= min_output, "Slippage: output below minimum");
        
        self.pair_reserve_b(pair_id).set(&reserve_b + &payment);
        self.pair_reserve_a(pair_id).set(&reserve_a - &output);
        
        self.distribute_fee(pair_id, &fee, true);
        
        let caller = self.blockchain().get_caller();
        self.send_token_internal(&caller, &self.pair_token_a(pair_id).get(),
            self.pair_token_a_is_klv(pair_id).get(), &user_gets);
    }

    /// Swap KLV for token B (when token_a is KLV)
    /// @param pair_id - The pair to swap on
    /// @param min_output - Minimum amount of token B to receive (slippage protection)
    #[endpoint(swapKlvToB)]
    #[payable("KLV")]
    fn swap_klv_to_b(&self, pair_id: u64, min_output: BigUint) {
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
        
        // V5: Slippage protection
        require!(user_gets >= min_output, "Slippage: output below minimum");
        
        self.pair_reserve_a(pair_id).set(&reserve_a + &payment);
        self.pair_reserve_b(pair_id).set(&reserve_b - &output);
        
        self.distribute_fee(pair_id, &fee, false);
        
        let caller = self.blockchain().get_caller();
        let token_b = self.pair_token_b(pair_id).get();
        self.send().direct_kda(&caller, &token_b, 0, &user_gets);
    }

    /// Swap KLV for token A (when token_b is KLV)
    /// @param pair_id - The pair to swap on
    /// @param min_output - Minimum amount of token A to receive (slippage protection)
    #[endpoint(swapKlvToA)]
    #[payable("KLV")]
    fn swap_klv_to_a(&self, pair_id: u64, min_output: BigUint) {
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
        
        // V5: Slippage protection
        require!(user_gets >= min_output, "Slippage: output below minimum");
        
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

    /// Get pair creator, defaulting to contract owner for legacy pairs
    fn get_pair_creator_or_owner(&self, pair_id: u64) -> ManagedAddress {
        if self.pair_creator(pair_id).is_empty() {
            self.blockchain().get_owner_address()
        } else {
            self.pair_creator(pair_id).get()
        }
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
        
        let klv_amount = self.call_value().klv_value();
        let kda_payments = self.call_value().all_kda_transfers();
        
        if token_a_is_klv {
            amount_a = klv_amount.clone_value();
        } else if token_b_is_klv {
            amount_b = klv_amount.clone_value();
        }
        
        for payment in kda_payments.iter() {
            let payment_token = payment.token_identifier.clone();
            let payment_amount = payment.amount.clone();
            
            if payment_token == *token_a {
                amount_a = payment_amount;
            } else if payment_token == *token_b {
                amount_b = payment_amount;
            }
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
            self.send_token_internal(addr, &self.pair_token_a(pair_id).get(),
                self.pair_token_a_is_klv(pair_id).get(), &pending_a);
        }
        
        if pending_b > BigUint::zero() {
            self.send_token_internal(addr, &self.pair_token_b(pair_id).get(),
                self.pair_token_b_is_klv(pair_id).get(), &pending_b);
        }
    }

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

    /// V5: Extended pair info including creator
    #[view(getPairInfoExtended)]
    fn get_pair_info_extended(&self, pair_id: u64) -> MultiValue9<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool, ManagedAddress> {
        (
            self.pair_token_a(pair_id).get(),
            self.pair_token_b(pair_id).get(),
            self.pair_token_a_is_klv(pair_id).get(),
            self.pair_token_b_is_klv(pair_id).get(),
            self.pair_reserve_a(pair_id).get(),
            self.pair_reserve_b(pair_id).get(),
            self.pair_fee_percent(pair_id).get(),
            self.pair_is_active(pair_id).get(),
            self.get_pair_creator_or_owner(pair_id),
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

    #[view(getPendingDeposits)]
    fn get_pending_deposits(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue2<BigUint, BigUint> {
        (
            self.pending_a(pair_id, &addr).get(),
            self.pending_b(pair_id, &addr).get(),
        ).into()
    }

    #[view(getLpCount)]
    fn get_lp_count(&self, pair_id: u64) -> usize {
        self.lp_list(pair_id).len()
    }

    #[view(isLp)]
    fn is_lp(&self, pair_id: u64, addr: ManagedAddress) -> bool {
        self.lp_list(pair_id).contains(&addr)
    }

    #[view(getLpList)]
    fn get_lp_list(&self, pair_id: u64) -> MultiValueEncoded<ManagedAddress> {
        let mut result = MultiValueEncoded::new();
        for addr in self.lp_list(pair_id).iter() {
            result.push(addr);
        }
        result
    }

    #[view(getLpInfo)]
    fn get_lp_info(&self, pair_id: u64, addr: ManagedAddress) -> MultiValue4<ManagedAddress, BigUint, BigUint, BigUint> {
        let shares = self.lp_shares(pair_id, &addr).get();
        let (fees_a, fees_b) = self.calculate_lp_pending_fees(pair_id, &addr);
        (addr, shares, fees_a, fees_b).into()
    }

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

    /// V5: Get pair creator
    #[view(getPairCreator)]
    fn get_pair_creator_view(&self, pair_id: u64) -> ManagedAddress {
        self.get_pair_creator_or_owner(pair_id)
    }

    /// V5: Check if pool is empty (ready for first LP to set price)
    #[view(isPoolEmpty)]
    fn is_pool_empty(&self, pair_id: u64) -> bool {
        if !self.pair_exists(pair_id) {
            return false;
        }
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        reserve_a == BigUint::zero() && reserve_b == BigUint::zero()
    }

    /// V5: Get pairs created by a specific address
    #[view(getPairsByCreator)]
    fn get_pairs_by_creator(&self, creator: ManagedAddress) -> MultiValueEncoded<u64> {
        let mut result = MultiValueEncoded::new();
        for pair_id in self.registered_pair_ids().iter() {
            if self.get_pair_creator_or_owner(pair_id) == creator {
                result.push(pair_id);
            }
        }
        result
    }

    /// V5: Find pairs that contain both specified tokens (in either order)
    /// Returns all pair_ids that have token_a and token_b (in either A/B position)
    /// Useful for checking if a pair already exists before creating
    #[view(findPairsByTokens)]
    fn find_pairs_by_tokens(&self, token_a: TokenIdentifier, token_b: TokenIdentifier) -> MultiValueEncoded<u64> {
        let mut result = MultiValueEncoded::new();
        for pair_id in self.registered_pair_ids().iter() {
            let pair_token_a = self.pair_token_a(pair_id).get();
            let pair_token_b = self.pair_token_b(pair_id).get();
            
            // Check both orderings
            let matches = (pair_token_a == token_a && pair_token_b == token_b) ||
                         (pair_token_a == token_b && pair_token_b == token_a);
            
            if matches {
                result.push(pair_id);
            }
        }
        result
    }

    /// V5: Get number of users with pending deposits for a pair
    /// If > 0, pair cannot be deleted (would lose user funds)
    #[view(getPendingUserCount)]
    fn get_pending_user_count(&self, pair_id: u64) -> u64 {
        self.pair_pending_user_count(pair_id).get()
    }

    /// V5: Check if a pair can be safely deleted
    /// Returns true if: reserves are 0, no LPs, no pending deposits, no unclaimed fees
    #[view(canDeletePair)]
    fn can_delete_pair(&self, pair_id: u64) -> bool {
        if !self.pair_exists(pair_id) {
            return false;
        }
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        let owner_shares = self.owner_shares(pair_id).get();
        let pending_users = self.pair_pending_user_count(pair_id).get();
        let unclaimed_a = self.owner_unclaimed_fees_a(pair_id).get();
        let unclaimed_b = self.owner_unclaimed_fees_b(pair_id).get();
        
        reserve_a == BigUint::zero() &&
        reserve_b == BigUint::zero() &&
        self.lp_list(pair_id).is_empty() &&
        owner_shares == BigUint::zero() &&
        pending_users == 0u64 &&
        unclaimed_a == BigUint::zero() &&
        unclaimed_b == BigUint::zero()
    }

    /// V5: Preview first liquidity - what shares would user get for amounts?
    /// Only valid for empty pools. Returns 0 if pool is not empty.
    #[view(previewFirstLiquidity)]
    fn preview_first_liquidity(&self, pair_id: u64, amount_a: BigUint, amount_b: BigUint) -> BigUint {
        if !self.pair_exists(pair_id) {
            return BigUint::zero();
        }
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        // Only for empty pools
        if reserve_a > BigUint::zero() || reserve_b > BigUint::zero() {
            return BigUint::zero();
        }
        
        // Calculate: sqrt(amount_a * amount_b) - MINIMUM_LIQUIDITY
        let product = &amount_a * &amount_b;
        let sqrt_shares = product.sqrt();
        
        if sqrt_shares > BigUint::from(MINIMUM_LIQUIDITY) {
            sqrt_shares - BigUint::from(MINIMUM_LIQUIDITY)
        } else {
            BigUint::zero()
        }
    }

    /// V5: Get the implied price ratio for first liquidity
    /// Returns price in precision units (1e18 = 1.0)
    /// price = amount_b / amount_a * 1e18
    #[view(previewFirstPrice)]
    fn preview_first_price(&self, amount_a: BigUint, amount_b: BigUint) -> BigUint {
        if amount_a == BigUint::zero() {
            return BigUint::zero();
        }
        let precision = BigUint::from(PRECISION);
        &amount_b * &precision / &amount_a
    }

    /// V5: Quote swap output - preview what you'll receive for a given input
    /// Returns (output_after_fee, fee_amount)
    /// Use this to calculate min_output for slippage protection
    #[view(quoteSwap)]
    fn quote_swap(&self, pair_id: u64, input_amount: BigUint, is_a_to_b: bool) -> MultiValue2<BigUint, BigUint> {
        if !self.pair_exists(pair_id) {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        if reserve_a == BigUint::zero() || reserve_b == BigUint::zero() || input_amount == BigUint::zero() {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let (reserve_in, reserve_out) = if is_a_to_b {
            (reserve_a, reserve_b)
        } else {
            (reserve_b, reserve_a)
        };
        
        // Calculate raw output: output = input * reserve_out / (reserve_in + input)
        let output = &input_amount * &reserve_out / (&reserve_in + &input_amount);
        
        if output == BigUint::zero() || output >= reserve_out {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        
        (user_gets, fee).into()
    }

    /// V5: Quote reverse swap - how much input needed for desired output?
    /// Returns (required_input, fee_amount)
    #[view(quoteSwapReverse)]
    fn quote_swap_reverse(&self, pair_id: u64, desired_output: BigUint, is_a_to_b: bool) -> MultiValue2<BigUint, BigUint> {
        if !self.pair_exists(pair_id) {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        if reserve_a == BigUint::zero() || reserve_b == BigUint::zero() || desired_output == BigUint::zero() {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let (reserve_in, reserve_out) = if is_a_to_b {
            (reserve_a, reserve_b)
        } else {
            (reserve_b, reserve_a)
        };
        
        // We need to find input such that output_after_fee >= desired_output
        // output_raw = input * reserve_out / (reserve_in + input)
        // output_after_fee = output_raw * (100 - fee%) / 100
        // Rearranging: input = reserve_in * output_raw / (reserve_out - output_raw)
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        // output_raw needed = desired_output * 100 / (100 - fee%)
        let output_raw = &desired_output * 100u64 / (100u64 - fee_percent);
        
        if output_raw >= reserve_out {
            return (BigUint::zero(), BigUint::zero()).into();
        }
        
        let required_input = &reserve_in * &output_raw / (&reserve_out - &output_raw);
        let fee = &output_raw * fee_percent / 100u64;
        
        // Add 1 to handle rounding up
        (required_input + 1u64, fee).into()
    }

    // ========================================================================
    // STORAGE MAPPERS
    // ========================================================================

    #[storage_mapper("next_pair_id")]
    fn next_pair_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("registered_pair_ids")]
    fn registered_pair_ids(&self) -> UnorderedSetMapper<u64>;

    // V5: Track pair creator
    #[storage_mapper("pair_creator")]
    fn pair_creator(&self, pair_id: u64) -> SingleValueMapper<ManagedAddress>;

    // V5: Map token pair to pair_id (for duplicate prevention)
    // Key: sorted hash of (token_a, token_b) -> pair_id
    #[storage_mapper("pair_by_tokens")]
    fn pair_by_tokens(&self, token_a: &TokenIdentifier, token_b: &TokenIdentifier) -> SingleValueMapper<u64>;

    // V5: Track number of users with pending deposits (for safe deletion)
    #[storage_mapper("pair_pending_user_count")]
    fn pair_pending_user_count(&self, pair_id: u64) -> SingleValueMapper<u64>;

    // ========================================================================
    // V5: HELPER FUNCTIONS FOR PENDING USER TRACKING
    // ========================================================================
    
    /// Check if user has any pending deposits (A or B)
    fn user_has_pending(&self, pair_id: u64, user: &ManagedAddress) -> bool {
        let pending_a = self.pending_a(pair_id, user).get();
        let pending_b = self.pending_b(pair_id, user).get();
        pending_a > BigUint::zero() || pending_b > BigUint::zero()
    }
    
    /// Increment pending user count if user just started having pending deposits
    fn track_pending_user_add(&self, pair_id: u64, user: &ManagedAddress, had_pending_before: bool) {
        if !had_pending_before && self.user_has_pending(pair_id, user) {
            self.pair_pending_user_count(pair_id).update(|c| *c += 1);
        }
    }
    
    /// Decrement pending user count if user no longer has pending deposits
    fn track_pending_user_remove(&self, pair_id: u64, user: &ManagedAddress, had_pending_before: bool) {
        if had_pending_before && !self.user_has_pending(pair_id, user) {
            self.pair_pending_user_count(pair_id).update(|c| {
                if *c > 0 { *c -= 1; }
            });
        }
    }

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

    #[storage_mapper("pending_a")]
    fn pending_a(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pending_b")]
    fn pending_b(&self, pair_id: u64, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
