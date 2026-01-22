#![no_std]

use klever_sc::imports::*;

// ============================================================================
// DIGIKO MULTI-PAIR DEX CONTRACT V2
// ============================================================================
// Supports ANY token pair combinations:
//   - DGKO/KLV
//   - BABYDGKO/KLV  
//   - DGKO/BABYDGKO
//   - Any TOKEN_A/TOKEN_B
//
// Each pair is COMPLETELY INDEPENDENT with its own reserves.
//
// Pair Identification:
//   Pairs are stored by a unique pair_id (u64) assigned at creation.
//   Frontend maps pair_id to token symbols for display.
//
// Storage Structure (per pair):
//   - token_a: First token identifier
//   - token_b: Second token identifier (can be KLV)
//   - reserve_a: Amount of token_a in pool
//   - reserve_b: Amount of token_b in pool
//   - fees_a: Accumulated fees in token_a
//   - fees_b: Accumulated fees in token_b
//   - fee_percent: Platform fee (1-10%)
//   - is_active: Whether pair is enabled
//
// CRITICAL: Klever cannot send KLV + KDA in same transaction!
// All functions handle one token type at a time.
// ============================================================================

#[klever_sc::contract]
pub trait DigikoDexV2 {
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    #[init]
    fn init(&self) {
        self.next_pair_id().set(1u64);
    }

    #[upgrade]
    fn upgrade(&self) {
        // Initialize next_pair_id if not set (for upgrades from V1)
        if self.next_pair_id().is_empty() {
            self.next_pair_id().set(1u64);
        }
    }

    // ========================================================================
    // EMERGENCY: CLAIM EXISTING CONTRACT BALANCE
    // ========================================================================
    // Use these to assign tokens already in the contract to a pair's reserves.
    // This is needed after upgrading from V1 where tokens exist but aren't
    // mapped to the new storage structure.

    /// Claim existing KDA token balance into reserve_a (owner only)
    /// Does NOT require sending tokens - uses existing contract balance
    #[only_owner]
    #[endpoint(claimBalanceToReserveA)]
    fn claim_balance_to_reserve_a(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Token A is KLV, use claimKlvToReserveA");
        require!(amount > 0u64, "Amount must be > 0");
        
        // Just update the reserve - tokens are already in contract
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
    }

    /// Claim existing KDA token balance into reserve_b (owner only)
    #[only_owner]
    #[endpoint(claimBalanceToReserveB)]
    fn claim_balance_to_reserve_b(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Token B is KLV, use claimKlvToReserveB");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
    }

    /// Claim existing KLV balance into reserve_a (owner only)
    #[only_owner]
    #[endpoint(claimKlvToReserveA)]
    fn claim_klv_to_reserve_a(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
    }

    /// Claim existing KLV balance into reserve_b (owner only)
    #[only_owner]
    #[endpoint(claimKlvToReserveB)]
    fn claim_klv_to_reserve_b(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
    }

    // ========================================================================
    // ADMIN: PAIR MANAGEMENT
    // ========================================================================

    /// Create a new trading pair (owner only)
    /// Returns the pair_id for the new pair
    /// token_a_is_klv / token_b_is_klv: set true if that token is native KLV
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
        
        // Get next pair ID
        let pair_id = self.next_pair_id().get();
        self.next_pair_id().set(pair_id + 1);
        
        // Initialize pair storage
        self.pair_token_a(pair_id).set(&token_a);
        self.pair_token_b(pair_id).set(&token_b);
        self.pair_token_a_is_klv(pair_id).set(token_a_is_klv);
        self.pair_token_b_is_klv(pair_id).set(token_b_is_klv);
        self.pair_reserve_a(pair_id).set(BigUint::zero());
        self.pair_reserve_b(pair_id).set(BigUint::zero());
        self.pair_fees_a(pair_id).set(BigUint::zero());
        self.pair_fees_b(pair_id).set(BigUint::zero());
        self.pair_fee_percent(pair_id).set(fee_percent);
        self.pair_is_active(pair_id).set(true);
        
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

    // ========================================================================
    // SWAP FUNCTIONS
    // ========================================================================

    /// Swap token A for token B (send KDA token A)
    /// Use when token_a is NOT native KLV
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
        
        // Fee
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        // Update state
        self.pair_reserve_a(pair_id).set(&reserve_a + &payment);
        self.pair_reserve_b(pair_id).set(&reserve_b - &output);
        self.pair_fees_b(pair_id).update(|f| *f += &fee);
        
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
    /// Use when token_b is NOT native KLV
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
        
        // AMM: output = (payment * reserve_a) / (reserve_b + payment)
        let output = (&payment * &reserve_a) / (&reserve_b + &payment);
        require!(output > 0u64 && output < reserve_a, "Invalid output");
        
        // Fee
        let fee_percent = self.pair_fee_percent(pair_id).get();
        let fee = &output * fee_percent / 100u64;
        let user_gets = &output - &fee;
        require!(user_gets > 0u64, "Output too small after fee");
        
        // Update state
        self.pair_reserve_b(pair_id).set(&reserve_b + &payment);
        self.pair_reserve_a(pair_id).set(&reserve_a - &output);
        self.pair_fees_a(pair_id).update(|f| *f += &fee);
        
        // Send token A to user
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
        self.pair_fees_b(pair_id).update(|f| *f += &fee);
        
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
        self.pair_fees_a(pair_id).update(|f| *f += &fee);
        
        let caller = self.blockchain().get_caller();
        let token_a = self.pair_token_a(pair_id).get();
        self.send().direct_kda(&caller, &token_a, 0, &user_gets);
    }

    // ========================================================================
    // LIQUIDITY MANAGEMENT (Owner Only)
    // ========================================================================

    /// Add KDA token liquidity to reserve_a
    #[only_owner]
    #[endpoint(addLiquidityA)]
    #[payable("*")]
    fn add_liquidity_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use addLiquidityAKlv");
        
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_a = self.pair_token_a(pair_id).get();
        
        require!(token_id == token_a, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
    }

    /// Add KDA token liquidity to reserve_b
    #[only_owner]
    #[endpoint(addLiquidityB)]
    #[payable("*")]
    fn add_liquidity_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use addLiquidityBKlv");
        
        let (token_id, amount) = self.call_value().single_fungible_kda();
        let token_b = self.pair_token_b(pair_id).get();
        
        require!(token_id == token_b, "Wrong token");
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
    }

    /// Add KLV liquidity to reserve_a (when token_a is KLV)
    #[only_owner]
    #[endpoint(addLiquidityAKlv)]
    #[payable("KLV")]
    fn add_liquidity_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_a(pair_id).update(|r| *r += &amount);
    }

    /// Add KLV liquidity to reserve_b (when token_b is KLV)
    #[only_owner]
    #[endpoint(addLiquidityBKlv)]
    #[payable("KLV")]
    fn add_liquidity_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let amount = self.call_value().klv_value().clone_value();
        require!(amount > 0u64, "Amount must be > 0");
        
        self.pair_reserve_b(pair_id).update(|r| *r += &amount);
    }

    // ========================================================================
    // WITHDRAWAL FUNCTIONS (Owner Only)
    // ========================================================================

    /// Withdraw KDA from reserve_a
    #[only_owner]
    #[endpoint(withdrawLiquidityA)]
    fn withdraw_liquidity_a(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use withdrawLiquidityAKlv");
        require!(amount > 0u64, "Amount must be > 0");
        
        let reserve = self.pair_reserve_a(pair_id).get();
        require!(amount <= reserve, "Insufficient reserve");
        
        self.pair_reserve_a(pair_id).set(&reserve - &amount);
        
        let owner = self.blockchain().get_owner_address();
        let token_a = self.pair_token_a(pair_id).get();
        self.send().direct_kda(&owner, &token_a, 0, &amount);
    }

    /// Withdraw KDA from reserve_b
    #[only_owner]
    #[endpoint(withdrawLiquidityB)]
    fn withdraw_liquidity_b(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use withdrawLiquidityBKlv");
        require!(amount > 0u64, "Amount must be > 0");
        
        let reserve = self.pair_reserve_b(pair_id).get();
        require!(amount <= reserve, "Insufficient reserve");
        
        self.pair_reserve_b(pair_id).set(&reserve - &amount);
        
        let owner = self.blockchain().get_owner_address();
        let token_b = self.pair_token_b(pair_id).get();
        self.send().direct_kda(&owner, &token_b, 0, &amount);
    }

    /// Withdraw KLV from reserve_a
    #[only_owner]
    #[endpoint(withdrawLiquidityAKlv)]
    fn withdraw_liquidity_a_klv(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        require!(amount > 0u64, "Amount must be > 0");
        
        let reserve = self.pair_reserve_a(pair_id).get();
        require!(amount <= reserve, "Insufficient reserve");
        
        self.pair_reserve_a(pair_id).set(&reserve - &amount);
        
        let owner = self.blockchain().get_owner_address();
        self.send().direct_klv(&owner, &amount);
    }

    /// Withdraw KLV from reserve_b
    #[only_owner]
    #[endpoint(withdrawLiquidityBKlv)]
    fn withdraw_liquidity_b_klv(&self, pair_id: u64, amount: BigUint) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        require!(amount > 0u64, "Amount must be > 0");
        
        let reserve = self.pair_reserve_b(pair_id).get();
        require!(amount <= reserve, "Insufficient reserve");
        
        self.pair_reserve_b(pair_id).set(&reserve - &amount);
        
        let owner = self.blockchain().get_owner_address();
        self.send().direct_klv(&owner, &amount);
    }

    /// Withdraw accumulated fees (token A - KDA)
    #[only_owner]
    #[endpoint(withdrawFeesA)]
    fn withdraw_fees_a(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_a_is_klv(pair_id).get(), "Use withdrawFeesAKlv");
        
        let fees = self.pair_fees_a(pair_id).get();
        require!(fees > 0u64, "No fees to withdraw");
        
        self.pair_fees_a(pair_id).clear();
        
        let owner = self.blockchain().get_owner_address();
        let token_a = self.pair_token_a(pair_id).get();
        self.send().direct_kda(&owner, &token_a, 0, &fees);
    }

    /// Withdraw accumulated fees (token B - KDA)
    #[only_owner]
    #[endpoint(withdrawFeesB)]
    fn withdraw_fees_b(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(!self.pair_token_b_is_klv(pair_id).get(), "Use withdrawFeesBKlv");
        
        let fees = self.pair_fees_b(pair_id).get();
        require!(fees > 0u64, "No fees to withdraw");
        
        self.pair_fees_b(pair_id).clear();
        
        let owner = self.blockchain().get_owner_address();
        let token_b = self.pair_token_b(pair_id).get();
        self.send().direct_kda(&owner, &token_b, 0, &fees);
    }

    /// Withdraw accumulated fees (token A - KLV)
    #[only_owner]
    #[endpoint(withdrawFeesAKlv)]
    fn withdraw_fees_a_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_a_is_klv(pair_id).get(), "Token A is not KLV");
        
        let fees = self.pair_fees_a(pair_id).get();
        require!(fees > 0u64, "No fees to withdraw");
        
        self.pair_fees_a(pair_id).clear();
        
        let owner = self.blockchain().get_owner_address();
        self.send().direct_klv(&owner, &fees);
    }

    /// Withdraw accumulated fees (token B - KLV)
    #[only_owner]
    #[endpoint(withdrawFeesBKlv)]
    fn withdraw_fees_b_klv(&self, pair_id: u64) {
        require!(self.pair_exists(pair_id), "Pair does not exist");
        require!(self.pair_token_b_is_klv(pair_id).get(), "Token B is not KLV");
        
        let fees = self.pair_fees_b(pair_id).get();
        require!(fees > 0u64, "No fees to withdraw");
        
        self.pair_fees_b(pair_id).clear();
        
        let owner = self.blockchain().get_owner_address();
        self.send().direct_klv(&owner, &fees);
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    #[view(pairExists)]
    fn pair_exists(&self, pair_id: u64) -> bool {
        self.registered_pair_ids().contains(&pair_id)
    }

    #[view(getAllPairIds)]
    fn get_all_pair_ids(&self) -> MultiValueEncoded<u64> {
        let mut ids = MultiValueEncoded::new();
        for id in self.registered_pair_ids().iter() {
            ids.push(id);
        }
        ids
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

    #[view(getReserves)]
    fn get_reserves(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint> {
        (
            self.pair_reserve_a(pair_id).get(),
            self.pair_reserve_b(pair_id).get(),
        ).into()
    }

    #[view(getFees)]
    fn get_fees(&self, pair_id: u64) -> MultiValue2<BigUint, BigUint> {
        (
            self.pair_fees_a(pair_id).get(),
            self.pair_fees_b(pair_id).get(),
        ).into()
    }

    #[view(getSwapQuote)]
    fn get_swap_quote(&self, pair_id: u64, amount: BigUint, a_to_b: bool) -> BigUint {
        if !self.pair_exists(pair_id) {
            return BigUint::zero();
        }
        
        let reserve_a = self.pair_reserve_a(pair_id).get();
        let reserve_b = self.pair_reserve_b(pair_id).get();
        
        if reserve_a == 0u64 || reserve_b == 0u64 || amount == 0u64 {
            return BigUint::zero();
        }
        
        let fee_percent = self.pair_fee_percent(pair_id).get();
        
        let output = if a_to_b {
            (&amount * &reserve_b) / (&reserve_a + &amount)
        } else {
            (&amount * &reserve_a) / (&reserve_b + &amount)
        };
        
        let fee = &output * fee_percent / 100u64;
        output - fee
    }

    // ========================================================================
    // PARAMETER-LESS VIEW FUNCTIONS (Pairs 1-100)
    // ========================================================================
    // These bypass Klever API issues with argument encoding for view functions.


    #[view(getReservesPair1)]
    fn get_reserves_pair_1(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(1u64).get(), self.pair_reserve_b(1u64).get()).into()
    }

    #[view(getPairInfoPair1)]
    fn get_pair_info_pair_1(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(1u64).get(),
            self.pair_token_b(1u64).get(),
            self.pair_token_a_is_klv(1u64).get(),
            self.pair_token_b_is_klv(1u64).get(),
            self.pair_reserve_a(1u64).get(),
            self.pair_reserve_b(1u64).get(),
            self.pair_fee_percent(1u64).get(),
            self.pair_is_active(1u64).get(),
        ).into()
    }

    #[view(pairExistsPair1)]
    fn pair_exists_pair_1(&self) -> bool {
        self.registered_pair_ids().contains(&1u64)
    }

    #[view(getFeesPair1)]
    fn get_fees_pair_1(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(1u64).get(), self.pair_fees_b(1u64).get()).into()
    }

    #[view(getReservesPair2)]
    fn get_reserves_pair_2(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(2u64).get(), self.pair_reserve_b(2u64).get()).into()
    }

    #[view(getPairInfoPair2)]
    fn get_pair_info_pair_2(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(2u64).get(),
            self.pair_token_b(2u64).get(),
            self.pair_token_a_is_klv(2u64).get(),
            self.pair_token_b_is_klv(2u64).get(),
            self.pair_reserve_a(2u64).get(),
            self.pair_reserve_b(2u64).get(),
            self.pair_fee_percent(2u64).get(),
            self.pair_is_active(2u64).get(),
        ).into()
    }

    #[view(pairExistsPair2)]
    fn pair_exists_pair_2(&self) -> bool {
        self.registered_pair_ids().contains(&2u64)
    }

    #[view(getFeesPair2)]
    fn get_fees_pair_2(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(2u64).get(), self.pair_fees_b(2u64).get()).into()
    }

    #[view(getReservesPair3)]
    fn get_reserves_pair_3(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(3u64).get(), self.pair_reserve_b(3u64).get()).into()
    }

    #[view(getPairInfoPair3)]
    fn get_pair_info_pair_3(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(3u64).get(),
            self.pair_token_b(3u64).get(),
            self.pair_token_a_is_klv(3u64).get(),
            self.pair_token_b_is_klv(3u64).get(),
            self.pair_reserve_a(3u64).get(),
            self.pair_reserve_b(3u64).get(),
            self.pair_fee_percent(3u64).get(),
            self.pair_is_active(3u64).get(),
        ).into()
    }

    #[view(pairExistsPair3)]
    fn pair_exists_pair_3(&self) -> bool {
        self.registered_pair_ids().contains(&3u64)
    }

    #[view(getFeesPair3)]
    fn get_fees_pair_3(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(3u64).get(), self.pair_fees_b(3u64).get()).into()
    }

    #[view(getReservesPair4)]
    fn get_reserves_pair_4(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(4u64).get(), self.pair_reserve_b(4u64).get()).into()
    }

    #[view(getPairInfoPair4)]
    fn get_pair_info_pair_4(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(4u64).get(),
            self.pair_token_b(4u64).get(),
            self.pair_token_a_is_klv(4u64).get(),
            self.pair_token_b_is_klv(4u64).get(),
            self.pair_reserve_a(4u64).get(),
            self.pair_reserve_b(4u64).get(),
            self.pair_fee_percent(4u64).get(),
            self.pair_is_active(4u64).get(),
        ).into()
    }

    #[view(pairExistsPair4)]
    fn pair_exists_pair_4(&self) -> bool {
        self.registered_pair_ids().contains(&4u64)
    }

    #[view(getFeesPair4)]
    fn get_fees_pair_4(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(4u64).get(), self.pair_fees_b(4u64).get()).into()
    }

    #[view(getReservesPair5)]
    fn get_reserves_pair_5(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(5u64).get(), self.pair_reserve_b(5u64).get()).into()
    }

    #[view(getPairInfoPair5)]
    fn get_pair_info_pair_5(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(5u64).get(),
            self.pair_token_b(5u64).get(),
            self.pair_token_a_is_klv(5u64).get(),
            self.pair_token_b_is_klv(5u64).get(),
            self.pair_reserve_a(5u64).get(),
            self.pair_reserve_b(5u64).get(),
            self.pair_fee_percent(5u64).get(),
            self.pair_is_active(5u64).get(),
        ).into()
    }

    #[view(pairExistsPair5)]
    fn pair_exists_pair_5(&self) -> bool {
        self.registered_pair_ids().contains(&5u64)
    }

    #[view(getFeesPair5)]
    fn get_fees_pair_5(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(5u64).get(), self.pair_fees_b(5u64).get()).into()
    }

    #[view(getReservesPair6)]
    fn get_reserves_pair_6(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(6u64).get(), self.pair_reserve_b(6u64).get()).into()
    }

    #[view(getPairInfoPair6)]
    fn get_pair_info_pair_6(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(6u64).get(),
            self.pair_token_b(6u64).get(),
            self.pair_token_a_is_klv(6u64).get(),
            self.pair_token_b_is_klv(6u64).get(),
            self.pair_reserve_a(6u64).get(),
            self.pair_reserve_b(6u64).get(),
            self.pair_fee_percent(6u64).get(),
            self.pair_is_active(6u64).get(),
        ).into()
    }

    #[view(pairExistsPair6)]
    fn pair_exists_pair_6(&self) -> bool {
        self.registered_pair_ids().contains(&6u64)
    }

    #[view(getFeesPair6)]
    fn get_fees_pair_6(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(6u64).get(), self.pair_fees_b(6u64).get()).into()
    }

    #[view(getReservesPair7)]
    fn get_reserves_pair_7(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(7u64).get(), self.pair_reserve_b(7u64).get()).into()
    }

    #[view(getPairInfoPair7)]
    fn get_pair_info_pair_7(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(7u64).get(),
            self.pair_token_b(7u64).get(),
            self.pair_token_a_is_klv(7u64).get(),
            self.pair_token_b_is_klv(7u64).get(),
            self.pair_reserve_a(7u64).get(),
            self.pair_reserve_b(7u64).get(),
            self.pair_fee_percent(7u64).get(),
            self.pair_is_active(7u64).get(),
        ).into()
    }

    #[view(pairExistsPair7)]
    fn pair_exists_pair_7(&self) -> bool {
        self.registered_pair_ids().contains(&7u64)
    }

    #[view(getFeesPair7)]
    fn get_fees_pair_7(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(7u64).get(), self.pair_fees_b(7u64).get()).into()
    }

    #[view(getReservesPair8)]
    fn get_reserves_pair_8(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(8u64).get(), self.pair_reserve_b(8u64).get()).into()
    }

    #[view(getPairInfoPair8)]
    fn get_pair_info_pair_8(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(8u64).get(),
            self.pair_token_b(8u64).get(),
            self.pair_token_a_is_klv(8u64).get(),
            self.pair_token_b_is_klv(8u64).get(),
            self.pair_reserve_a(8u64).get(),
            self.pair_reserve_b(8u64).get(),
            self.pair_fee_percent(8u64).get(),
            self.pair_is_active(8u64).get(),
        ).into()
    }

    #[view(pairExistsPair8)]
    fn pair_exists_pair_8(&self) -> bool {
        self.registered_pair_ids().contains(&8u64)
    }

    #[view(getFeesPair8)]
    fn get_fees_pair_8(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(8u64).get(), self.pair_fees_b(8u64).get()).into()
    }

    #[view(getReservesPair9)]
    fn get_reserves_pair_9(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(9u64).get(), self.pair_reserve_b(9u64).get()).into()
    }

    #[view(getPairInfoPair9)]
    fn get_pair_info_pair_9(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(9u64).get(),
            self.pair_token_b(9u64).get(),
            self.pair_token_a_is_klv(9u64).get(),
            self.pair_token_b_is_klv(9u64).get(),
            self.pair_reserve_a(9u64).get(),
            self.pair_reserve_b(9u64).get(),
            self.pair_fee_percent(9u64).get(),
            self.pair_is_active(9u64).get(),
        ).into()
    }

    #[view(pairExistsPair9)]
    fn pair_exists_pair_9(&self) -> bool {
        self.registered_pair_ids().contains(&9u64)
    }

    #[view(getFeesPair9)]
    fn get_fees_pair_9(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(9u64).get(), self.pair_fees_b(9u64).get()).into()
    }

    #[view(getReservesPair10)]
    fn get_reserves_pair_10(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(10u64).get(), self.pair_reserve_b(10u64).get()).into()
    }

    #[view(getPairInfoPair10)]
    fn get_pair_info_pair_10(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(10u64).get(),
            self.pair_token_b(10u64).get(),
            self.pair_token_a_is_klv(10u64).get(),
            self.pair_token_b_is_klv(10u64).get(),
            self.pair_reserve_a(10u64).get(),
            self.pair_reserve_b(10u64).get(),
            self.pair_fee_percent(10u64).get(),
            self.pair_is_active(10u64).get(),
        ).into()
    }

    #[view(pairExistsPair10)]
    fn pair_exists_pair_10(&self) -> bool {
        self.registered_pair_ids().contains(&10u64)
    }

    #[view(getFeesPair10)]
    fn get_fees_pair_10(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(10u64).get(), self.pair_fees_b(10u64).get()).into()
    }

    #[view(getReservesPair11)]
    fn get_reserves_pair_11(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(11u64).get(), self.pair_reserve_b(11u64).get()).into()
    }

    #[view(getPairInfoPair11)]
    fn get_pair_info_pair_11(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(11u64).get(),
            self.pair_token_b(11u64).get(),
            self.pair_token_a_is_klv(11u64).get(),
            self.pair_token_b_is_klv(11u64).get(),
            self.pair_reserve_a(11u64).get(),
            self.pair_reserve_b(11u64).get(),
            self.pair_fee_percent(11u64).get(),
            self.pair_is_active(11u64).get(),
        ).into()
    }

    #[view(pairExistsPair11)]
    fn pair_exists_pair_11(&self) -> bool {
        self.registered_pair_ids().contains(&11u64)
    }

    #[view(getFeesPair11)]
    fn get_fees_pair_11(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(11u64).get(), self.pair_fees_b(11u64).get()).into()
    }

    #[view(getReservesPair12)]
    fn get_reserves_pair_12(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(12u64).get(), self.pair_reserve_b(12u64).get()).into()
    }

    #[view(getPairInfoPair12)]
    fn get_pair_info_pair_12(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(12u64).get(),
            self.pair_token_b(12u64).get(),
            self.pair_token_a_is_klv(12u64).get(),
            self.pair_token_b_is_klv(12u64).get(),
            self.pair_reserve_a(12u64).get(),
            self.pair_reserve_b(12u64).get(),
            self.pair_fee_percent(12u64).get(),
            self.pair_is_active(12u64).get(),
        ).into()
    }

    #[view(pairExistsPair12)]
    fn pair_exists_pair_12(&self) -> bool {
        self.registered_pair_ids().contains(&12u64)
    }

    #[view(getFeesPair12)]
    fn get_fees_pair_12(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(12u64).get(), self.pair_fees_b(12u64).get()).into()
    }

    #[view(getReservesPair13)]
    fn get_reserves_pair_13(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(13u64).get(), self.pair_reserve_b(13u64).get()).into()
    }

    #[view(getPairInfoPair13)]
    fn get_pair_info_pair_13(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(13u64).get(),
            self.pair_token_b(13u64).get(),
            self.pair_token_a_is_klv(13u64).get(),
            self.pair_token_b_is_klv(13u64).get(),
            self.pair_reserve_a(13u64).get(),
            self.pair_reserve_b(13u64).get(),
            self.pair_fee_percent(13u64).get(),
            self.pair_is_active(13u64).get(),
        ).into()
    }

    #[view(pairExistsPair13)]
    fn pair_exists_pair_13(&self) -> bool {
        self.registered_pair_ids().contains(&13u64)
    }

    #[view(getFeesPair13)]
    fn get_fees_pair_13(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(13u64).get(), self.pair_fees_b(13u64).get()).into()
    }

    #[view(getReservesPair14)]
    fn get_reserves_pair_14(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(14u64).get(), self.pair_reserve_b(14u64).get()).into()
    }

    #[view(getPairInfoPair14)]
    fn get_pair_info_pair_14(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(14u64).get(),
            self.pair_token_b(14u64).get(),
            self.pair_token_a_is_klv(14u64).get(),
            self.pair_token_b_is_klv(14u64).get(),
            self.pair_reserve_a(14u64).get(),
            self.pair_reserve_b(14u64).get(),
            self.pair_fee_percent(14u64).get(),
            self.pair_is_active(14u64).get(),
        ).into()
    }

    #[view(pairExistsPair14)]
    fn pair_exists_pair_14(&self) -> bool {
        self.registered_pair_ids().contains(&14u64)
    }

    #[view(getFeesPair14)]
    fn get_fees_pair_14(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(14u64).get(), self.pair_fees_b(14u64).get()).into()
    }

    #[view(getReservesPair15)]
    fn get_reserves_pair_15(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(15u64).get(), self.pair_reserve_b(15u64).get()).into()
    }

    #[view(getPairInfoPair15)]
    fn get_pair_info_pair_15(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(15u64).get(),
            self.pair_token_b(15u64).get(),
            self.pair_token_a_is_klv(15u64).get(),
            self.pair_token_b_is_klv(15u64).get(),
            self.pair_reserve_a(15u64).get(),
            self.pair_reserve_b(15u64).get(),
            self.pair_fee_percent(15u64).get(),
            self.pair_is_active(15u64).get(),
        ).into()
    }

    #[view(pairExistsPair15)]
    fn pair_exists_pair_15(&self) -> bool {
        self.registered_pair_ids().contains(&15u64)
    }

    #[view(getFeesPair15)]
    fn get_fees_pair_15(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(15u64).get(), self.pair_fees_b(15u64).get()).into()
    }

    #[view(getReservesPair16)]
    fn get_reserves_pair_16(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(16u64).get(), self.pair_reserve_b(16u64).get()).into()
    }

    #[view(getPairInfoPair16)]
    fn get_pair_info_pair_16(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(16u64).get(),
            self.pair_token_b(16u64).get(),
            self.pair_token_a_is_klv(16u64).get(),
            self.pair_token_b_is_klv(16u64).get(),
            self.pair_reserve_a(16u64).get(),
            self.pair_reserve_b(16u64).get(),
            self.pair_fee_percent(16u64).get(),
            self.pair_is_active(16u64).get(),
        ).into()
    }

    #[view(pairExistsPair16)]
    fn pair_exists_pair_16(&self) -> bool {
        self.registered_pair_ids().contains(&16u64)
    }

    #[view(getFeesPair16)]
    fn get_fees_pair_16(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(16u64).get(), self.pair_fees_b(16u64).get()).into()
    }

    #[view(getReservesPair17)]
    fn get_reserves_pair_17(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(17u64).get(), self.pair_reserve_b(17u64).get()).into()
    }

    #[view(getPairInfoPair17)]
    fn get_pair_info_pair_17(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(17u64).get(),
            self.pair_token_b(17u64).get(),
            self.pair_token_a_is_klv(17u64).get(),
            self.pair_token_b_is_klv(17u64).get(),
            self.pair_reserve_a(17u64).get(),
            self.pair_reserve_b(17u64).get(),
            self.pair_fee_percent(17u64).get(),
            self.pair_is_active(17u64).get(),
        ).into()
    }

    #[view(pairExistsPair17)]
    fn pair_exists_pair_17(&self) -> bool {
        self.registered_pair_ids().contains(&17u64)
    }

    #[view(getFeesPair17)]
    fn get_fees_pair_17(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(17u64).get(), self.pair_fees_b(17u64).get()).into()
    }

    #[view(getReservesPair18)]
    fn get_reserves_pair_18(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(18u64).get(), self.pair_reserve_b(18u64).get()).into()
    }

    #[view(getPairInfoPair18)]
    fn get_pair_info_pair_18(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(18u64).get(),
            self.pair_token_b(18u64).get(),
            self.pair_token_a_is_klv(18u64).get(),
            self.pair_token_b_is_klv(18u64).get(),
            self.pair_reserve_a(18u64).get(),
            self.pair_reserve_b(18u64).get(),
            self.pair_fee_percent(18u64).get(),
            self.pair_is_active(18u64).get(),
        ).into()
    }

    #[view(pairExistsPair18)]
    fn pair_exists_pair_18(&self) -> bool {
        self.registered_pair_ids().contains(&18u64)
    }

    #[view(getFeesPair18)]
    fn get_fees_pair_18(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(18u64).get(), self.pair_fees_b(18u64).get()).into()
    }

    #[view(getReservesPair19)]
    fn get_reserves_pair_19(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(19u64).get(), self.pair_reserve_b(19u64).get()).into()
    }

    #[view(getPairInfoPair19)]
    fn get_pair_info_pair_19(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(19u64).get(),
            self.pair_token_b(19u64).get(),
            self.pair_token_a_is_klv(19u64).get(),
            self.pair_token_b_is_klv(19u64).get(),
            self.pair_reserve_a(19u64).get(),
            self.pair_reserve_b(19u64).get(),
            self.pair_fee_percent(19u64).get(),
            self.pair_is_active(19u64).get(),
        ).into()
    }

    #[view(pairExistsPair19)]
    fn pair_exists_pair_19(&self) -> bool {
        self.registered_pair_ids().contains(&19u64)
    }

    #[view(getFeesPair19)]
    fn get_fees_pair_19(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(19u64).get(), self.pair_fees_b(19u64).get()).into()
    }

    #[view(getReservesPair20)]
    fn get_reserves_pair_20(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(20u64).get(), self.pair_reserve_b(20u64).get()).into()
    }

    #[view(getPairInfoPair20)]
    fn get_pair_info_pair_20(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(20u64).get(),
            self.pair_token_b(20u64).get(),
            self.pair_token_a_is_klv(20u64).get(),
            self.pair_token_b_is_klv(20u64).get(),
            self.pair_reserve_a(20u64).get(),
            self.pair_reserve_b(20u64).get(),
            self.pair_fee_percent(20u64).get(),
            self.pair_is_active(20u64).get(),
        ).into()
    }

    #[view(pairExistsPair20)]
    fn pair_exists_pair_20(&self) -> bool {
        self.registered_pair_ids().contains(&20u64)
    }

    #[view(getFeesPair20)]
    fn get_fees_pair_20(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(20u64).get(), self.pair_fees_b(20u64).get()).into()
    }

    #[view(getReservesPair21)]
    fn get_reserves_pair_21(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(21u64).get(), self.pair_reserve_b(21u64).get()).into()
    }

    #[view(getPairInfoPair21)]
    fn get_pair_info_pair_21(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(21u64).get(),
            self.pair_token_b(21u64).get(),
            self.pair_token_a_is_klv(21u64).get(),
            self.pair_token_b_is_klv(21u64).get(),
            self.pair_reserve_a(21u64).get(),
            self.pair_reserve_b(21u64).get(),
            self.pair_fee_percent(21u64).get(),
            self.pair_is_active(21u64).get(),
        ).into()
    }

    #[view(pairExistsPair21)]
    fn pair_exists_pair_21(&self) -> bool {
        self.registered_pair_ids().contains(&21u64)
    }

    #[view(getFeesPair21)]
    fn get_fees_pair_21(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(21u64).get(), self.pair_fees_b(21u64).get()).into()
    }

    #[view(getReservesPair22)]
    fn get_reserves_pair_22(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(22u64).get(), self.pair_reserve_b(22u64).get()).into()
    }

    #[view(getPairInfoPair22)]
    fn get_pair_info_pair_22(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(22u64).get(),
            self.pair_token_b(22u64).get(),
            self.pair_token_a_is_klv(22u64).get(),
            self.pair_token_b_is_klv(22u64).get(),
            self.pair_reserve_a(22u64).get(),
            self.pair_reserve_b(22u64).get(),
            self.pair_fee_percent(22u64).get(),
            self.pair_is_active(22u64).get(),
        ).into()
    }

    #[view(pairExistsPair22)]
    fn pair_exists_pair_22(&self) -> bool {
        self.registered_pair_ids().contains(&22u64)
    }

    #[view(getFeesPair22)]
    fn get_fees_pair_22(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(22u64).get(), self.pair_fees_b(22u64).get()).into()
    }

    #[view(getReservesPair23)]
    fn get_reserves_pair_23(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(23u64).get(), self.pair_reserve_b(23u64).get()).into()
    }

    #[view(getPairInfoPair23)]
    fn get_pair_info_pair_23(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(23u64).get(),
            self.pair_token_b(23u64).get(),
            self.pair_token_a_is_klv(23u64).get(),
            self.pair_token_b_is_klv(23u64).get(),
            self.pair_reserve_a(23u64).get(),
            self.pair_reserve_b(23u64).get(),
            self.pair_fee_percent(23u64).get(),
            self.pair_is_active(23u64).get(),
        ).into()
    }

    #[view(pairExistsPair23)]
    fn pair_exists_pair_23(&self) -> bool {
        self.registered_pair_ids().contains(&23u64)
    }

    #[view(getFeesPair23)]
    fn get_fees_pair_23(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(23u64).get(), self.pair_fees_b(23u64).get()).into()
    }

    #[view(getReservesPair24)]
    fn get_reserves_pair_24(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(24u64).get(), self.pair_reserve_b(24u64).get()).into()
    }

    #[view(getPairInfoPair24)]
    fn get_pair_info_pair_24(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(24u64).get(),
            self.pair_token_b(24u64).get(),
            self.pair_token_a_is_klv(24u64).get(),
            self.pair_token_b_is_klv(24u64).get(),
            self.pair_reserve_a(24u64).get(),
            self.pair_reserve_b(24u64).get(),
            self.pair_fee_percent(24u64).get(),
            self.pair_is_active(24u64).get(),
        ).into()
    }

    #[view(pairExistsPair24)]
    fn pair_exists_pair_24(&self) -> bool {
        self.registered_pair_ids().contains(&24u64)
    }

    #[view(getFeesPair24)]
    fn get_fees_pair_24(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(24u64).get(), self.pair_fees_b(24u64).get()).into()
    }

    #[view(getReservesPair25)]
    fn get_reserves_pair_25(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(25u64).get(), self.pair_reserve_b(25u64).get()).into()
    }

    #[view(getPairInfoPair25)]
    fn get_pair_info_pair_25(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(25u64).get(),
            self.pair_token_b(25u64).get(),
            self.pair_token_a_is_klv(25u64).get(),
            self.pair_token_b_is_klv(25u64).get(),
            self.pair_reserve_a(25u64).get(),
            self.pair_reserve_b(25u64).get(),
            self.pair_fee_percent(25u64).get(),
            self.pair_is_active(25u64).get(),
        ).into()
    }

    #[view(pairExistsPair25)]
    fn pair_exists_pair_25(&self) -> bool {
        self.registered_pair_ids().contains(&25u64)
    }

    #[view(getFeesPair25)]
    fn get_fees_pair_25(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(25u64).get(), self.pair_fees_b(25u64).get()).into()
    }

    #[view(getReservesPair26)]
    fn get_reserves_pair_26(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(26u64).get(), self.pair_reserve_b(26u64).get()).into()
    }

    #[view(getPairInfoPair26)]
    fn get_pair_info_pair_26(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(26u64).get(),
            self.pair_token_b(26u64).get(),
            self.pair_token_a_is_klv(26u64).get(),
            self.pair_token_b_is_klv(26u64).get(),
            self.pair_reserve_a(26u64).get(),
            self.pair_reserve_b(26u64).get(),
            self.pair_fee_percent(26u64).get(),
            self.pair_is_active(26u64).get(),
        ).into()
    }

    #[view(pairExistsPair26)]
    fn pair_exists_pair_26(&self) -> bool {
        self.registered_pair_ids().contains(&26u64)
    }

    #[view(getFeesPair26)]
    fn get_fees_pair_26(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(26u64).get(), self.pair_fees_b(26u64).get()).into()
    }

    #[view(getReservesPair27)]
    fn get_reserves_pair_27(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(27u64).get(), self.pair_reserve_b(27u64).get()).into()
    }

    #[view(getPairInfoPair27)]
    fn get_pair_info_pair_27(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(27u64).get(),
            self.pair_token_b(27u64).get(),
            self.pair_token_a_is_klv(27u64).get(),
            self.pair_token_b_is_klv(27u64).get(),
            self.pair_reserve_a(27u64).get(),
            self.pair_reserve_b(27u64).get(),
            self.pair_fee_percent(27u64).get(),
            self.pair_is_active(27u64).get(),
        ).into()
    }

    #[view(pairExistsPair27)]
    fn pair_exists_pair_27(&self) -> bool {
        self.registered_pair_ids().contains(&27u64)
    }

    #[view(getFeesPair27)]
    fn get_fees_pair_27(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(27u64).get(), self.pair_fees_b(27u64).get()).into()
    }

    #[view(getReservesPair28)]
    fn get_reserves_pair_28(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(28u64).get(), self.pair_reserve_b(28u64).get()).into()
    }

    #[view(getPairInfoPair28)]
    fn get_pair_info_pair_28(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(28u64).get(),
            self.pair_token_b(28u64).get(),
            self.pair_token_a_is_klv(28u64).get(),
            self.pair_token_b_is_klv(28u64).get(),
            self.pair_reserve_a(28u64).get(),
            self.pair_reserve_b(28u64).get(),
            self.pair_fee_percent(28u64).get(),
            self.pair_is_active(28u64).get(),
        ).into()
    }

    #[view(pairExistsPair28)]
    fn pair_exists_pair_28(&self) -> bool {
        self.registered_pair_ids().contains(&28u64)
    }

    #[view(getFeesPair28)]
    fn get_fees_pair_28(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(28u64).get(), self.pair_fees_b(28u64).get()).into()
    }

    #[view(getReservesPair29)]
    fn get_reserves_pair_29(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(29u64).get(), self.pair_reserve_b(29u64).get()).into()
    }

    #[view(getPairInfoPair29)]
    fn get_pair_info_pair_29(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(29u64).get(),
            self.pair_token_b(29u64).get(),
            self.pair_token_a_is_klv(29u64).get(),
            self.pair_token_b_is_klv(29u64).get(),
            self.pair_reserve_a(29u64).get(),
            self.pair_reserve_b(29u64).get(),
            self.pair_fee_percent(29u64).get(),
            self.pair_is_active(29u64).get(),
        ).into()
    }

    #[view(pairExistsPair29)]
    fn pair_exists_pair_29(&self) -> bool {
        self.registered_pair_ids().contains(&29u64)
    }

    #[view(getFeesPair29)]
    fn get_fees_pair_29(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(29u64).get(), self.pair_fees_b(29u64).get()).into()
    }

    #[view(getReservesPair30)]
    fn get_reserves_pair_30(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(30u64).get(), self.pair_reserve_b(30u64).get()).into()
    }

    #[view(getPairInfoPair30)]
    fn get_pair_info_pair_30(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(30u64).get(),
            self.pair_token_b(30u64).get(),
            self.pair_token_a_is_klv(30u64).get(),
            self.pair_token_b_is_klv(30u64).get(),
            self.pair_reserve_a(30u64).get(),
            self.pair_reserve_b(30u64).get(),
            self.pair_fee_percent(30u64).get(),
            self.pair_is_active(30u64).get(),
        ).into()
    }

    #[view(pairExistsPair30)]
    fn pair_exists_pair_30(&self) -> bool {
        self.registered_pair_ids().contains(&30u64)
    }

    #[view(getFeesPair30)]
    fn get_fees_pair_30(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(30u64).get(), self.pair_fees_b(30u64).get()).into()
    }

    #[view(getReservesPair31)]
    fn get_reserves_pair_31(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(31u64).get(), self.pair_reserve_b(31u64).get()).into()
    }

    #[view(getPairInfoPair31)]
    fn get_pair_info_pair_31(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(31u64).get(),
            self.pair_token_b(31u64).get(),
            self.pair_token_a_is_klv(31u64).get(),
            self.pair_token_b_is_klv(31u64).get(),
            self.pair_reserve_a(31u64).get(),
            self.pair_reserve_b(31u64).get(),
            self.pair_fee_percent(31u64).get(),
            self.pair_is_active(31u64).get(),
        ).into()
    }

    #[view(pairExistsPair31)]
    fn pair_exists_pair_31(&self) -> bool {
        self.registered_pair_ids().contains(&31u64)
    }

    #[view(getFeesPair31)]
    fn get_fees_pair_31(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(31u64).get(), self.pair_fees_b(31u64).get()).into()
    }

    #[view(getReservesPair32)]
    fn get_reserves_pair_32(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(32u64).get(), self.pair_reserve_b(32u64).get()).into()
    }

    #[view(getPairInfoPair32)]
    fn get_pair_info_pair_32(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(32u64).get(),
            self.pair_token_b(32u64).get(),
            self.pair_token_a_is_klv(32u64).get(),
            self.pair_token_b_is_klv(32u64).get(),
            self.pair_reserve_a(32u64).get(),
            self.pair_reserve_b(32u64).get(),
            self.pair_fee_percent(32u64).get(),
            self.pair_is_active(32u64).get(),
        ).into()
    }

    #[view(pairExistsPair32)]
    fn pair_exists_pair_32(&self) -> bool {
        self.registered_pair_ids().contains(&32u64)
    }

    #[view(getFeesPair32)]
    fn get_fees_pair_32(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(32u64).get(), self.pair_fees_b(32u64).get()).into()
    }

    #[view(getReservesPair33)]
    fn get_reserves_pair_33(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(33u64).get(), self.pair_reserve_b(33u64).get()).into()
    }

    #[view(getPairInfoPair33)]
    fn get_pair_info_pair_33(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(33u64).get(),
            self.pair_token_b(33u64).get(),
            self.pair_token_a_is_klv(33u64).get(),
            self.pair_token_b_is_klv(33u64).get(),
            self.pair_reserve_a(33u64).get(),
            self.pair_reserve_b(33u64).get(),
            self.pair_fee_percent(33u64).get(),
            self.pair_is_active(33u64).get(),
        ).into()
    }

    #[view(pairExistsPair33)]
    fn pair_exists_pair_33(&self) -> bool {
        self.registered_pair_ids().contains(&33u64)
    }

    #[view(getFeesPair33)]
    fn get_fees_pair_33(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(33u64).get(), self.pair_fees_b(33u64).get()).into()
    }

    #[view(getReservesPair34)]
    fn get_reserves_pair_34(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(34u64).get(), self.pair_reserve_b(34u64).get()).into()
    }

    #[view(getPairInfoPair34)]
    fn get_pair_info_pair_34(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(34u64).get(),
            self.pair_token_b(34u64).get(),
            self.pair_token_a_is_klv(34u64).get(),
            self.pair_token_b_is_klv(34u64).get(),
            self.pair_reserve_a(34u64).get(),
            self.pair_reserve_b(34u64).get(),
            self.pair_fee_percent(34u64).get(),
            self.pair_is_active(34u64).get(),
        ).into()
    }

    #[view(pairExistsPair34)]
    fn pair_exists_pair_34(&self) -> bool {
        self.registered_pair_ids().contains(&34u64)
    }

    #[view(getFeesPair34)]
    fn get_fees_pair_34(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(34u64).get(), self.pair_fees_b(34u64).get()).into()
    }

    #[view(getReservesPair35)]
    fn get_reserves_pair_35(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(35u64).get(), self.pair_reserve_b(35u64).get()).into()
    }

    #[view(getPairInfoPair35)]
    fn get_pair_info_pair_35(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(35u64).get(),
            self.pair_token_b(35u64).get(),
            self.pair_token_a_is_klv(35u64).get(),
            self.pair_token_b_is_klv(35u64).get(),
            self.pair_reserve_a(35u64).get(),
            self.pair_reserve_b(35u64).get(),
            self.pair_fee_percent(35u64).get(),
            self.pair_is_active(35u64).get(),
        ).into()
    }

    #[view(pairExistsPair35)]
    fn pair_exists_pair_35(&self) -> bool {
        self.registered_pair_ids().contains(&35u64)
    }

    #[view(getFeesPair35)]
    fn get_fees_pair_35(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(35u64).get(), self.pair_fees_b(35u64).get()).into()
    }

    #[view(getReservesPair36)]
    fn get_reserves_pair_36(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(36u64).get(), self.pair_reserve_b(36u64).get()).into()
    }

    #[view(getPairInfoPair36)]
    fn get_pair_info_pair_36(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(36u64).get(),
            self.pair_token_b(36u64).get(),
            self.pair_token_a_is_klv(36u64).get(),
            self.pair_token_b_is_klv(36u64).get(),
            self.pair_reserve_a(36u64).get(),
            self.pair_reserve_b(36u64).get(),
            self.pair_fee_percent(36u64).get(),
            self.pair_is_active(36u64).get(),
        ).into()
    }

    #[view(pairExistsPair36)]
    fn pair_exists_pair_36(&self) -> bool {
        self.registered_pair_ids().contains(&36u64)
    }

    #[view(getFeesPair36)]
    fn get_fees_pair_36(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(36u64).get(), self.pair_fees_b(36u64).get()).into()
    }

    #[view(getReservesPair37)]
    fn get_reserves_pair_37(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(37u64).get(), self.pair_reserve_b(37u64).get()).into()
    }

    #[view(getPairInfoPair37)]
    fn get_pair_info_pair_37(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(37u64).get(),
            self.pair_token_b(37u64).get(),
            self.pair_token_a_is_klv(37u64).get(),
            self.pair_token_b_is_klv(37u64).get(),
            self.pair_reserve_a(37u64).get(),
            self.pair_reserve_b(37u64).get(),
            self.pair_fee_percent(37u64).get(),
            self.pair_is_active(37u64).get(),
        ).into()
    }

    #[view(pairExistsPair37)]
    fn pair_exists_pair_37(&self) -> bool {
        self.registered_pair_ids().contains(&37u64)
    }

    #[view(getFeesPair37)]
    fn get_fees_pair_37(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(37u64).get(), self.pair_fees_b(37u64).get()).into()
    }

    #[view(getReservesPair38)]
    fn get_reserves_pair_38(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(38u64).get(), self.pair_reserve_b(38u64).get()).into()
    }

    #[view(getPairInfoPair38)]
    fn get_pair_info_pair_38(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(38u64).get(),
            self.pair_token_b(38u64).get(),
            self.pair_token_a_is_klv(38u64).get(),
            self.pair_token_b_is_klv(38u64).get(),
            self.pair_reserve_a(38u64).get(),
            self.pair_reserve_b(38u64).get(),
            self.pair_fee_percent(38u64).get(),
            self.pair_is_active(38u64).get(),
        ).into()
    }

    #[view(pairExistsPair38)]
    fn pair_exists_pair_38(&self) -> bool {
        self.registered_pair_ids().contains(&38u64)
    }

    #[view(getFeesPair38)]
    fn get_fees_pair_38(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(38u64).get(), self.pair_fees_b(38u64).get()).into()
    }

    #[view(getReservesPair39)]
    fn get_reserves_pair_39(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(39u64).get(), self.pair_reserve_b(39u64).get()).into()
    }

    #[view(getPairInfoPair39)]
    fn get_pair_info_pair_39(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(39u64).get(),
            self.pair_token_b(39u64).get(),
            self.pair_token_a_is_klv(39u64).get(),
            self.pair_token_b_is_klv(39u64).get(),
            self.pair_reserve_a(39u64).get(),
            self.pair_reserve_b(39u64).get(),
            self.pair_fee_percent(39u64).get(),
            self.pair_is_active(39u64).get(),
        ).into()
    }

    #[view(pairExistsPair39)]
    fn pair_exists_pair_39(&self) -> bool {
        self.registered_pair_ids().contains(&39u64)
    }

    #[view(getFeesPair39)]
    fn get_fees_pair_39(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(39u64).get(), self.pair_fees_b(39u64).get()).into()
    }

    #[view(getReservesPair40)]
    fn get_reserves_pair_40(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(40u64).get(), self.pair_reserve_b(40u64).get()).into()
    }

    #[view(getPairInfoPair40)]
    fn get_pair_info_pair_40(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(40u64).get(),
            self.pair_token_b(40u64).get(),
            self.pair_token_a_is_klv(40u64).get(),
            self.pair_token_b_is_klv(40u64).get(),
            self.pair_reserve_a(40u64).get(),
            self.pair_reserve_b(40u64).get(),
            self.pair_fee_percent(40u64).get(),
            self.pair_is_active(40u64).get(),
        ).into()
    }

    #[view(pairExistsPair40)]
    fn pair_exists_pair_40(&self) -> bool {
        self.registered_pair_ids().contains(&40u64)
    }

    #[view(getFeesPair40)]
    fn get_fees_pair_40(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(40u64).get(), self.pair_fees_b(40u64).get()).into()
    }

    #[view(getReservesPair41)]
    fn get_reserves_pair_41(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(41u64).get(), self.pair_reserve_b(41u64).get()).into()
    }

    #[view(getPairInfoPair41)]
    fn get_pair_info_pair_41(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(41u64).get(),
            self.pair_token_b(41u64).get(),
            self.pair_token_a_is_klv(41u64).get(),
            self.pair_token_b_is_klv(41u64).get(),
            self.pair_reserve_a(41u64).get(),
            self.pair_reserve_b(41u64).get(),
            self.pair_fee_percent(41u64).get(),
            self.pair_is_active(41u64).get(),
        ).into()
    }

    #[view(pairExistsPair41)]
    fn pair_exists_pair_41(&self) -> bool {
        self.registered_pair_ids().contains(&41u64)
    }

    #[view(getFeesPair41)]
    fn get_fees_pair_41(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(41u64).get(), self.pair_fees_b(41u64).get()).into()
    }

    #[view(getReservesPair42)]
    fn get_reserves_pair_42(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(42u64).get(), self.pair_reserve_b(42u64).get()).into()
    }

    #[view(getPairInfoPair42)]
    fn get_pair_info_pair_42(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(42u64).get(),
            self.pair_token_b(42u64).get(),
            self.pair_token_a_is_klv(42u64).get(),
            self.pair_token_b_is_klv(42u64).get(),
            self.pair_reserve_a(42u64).get(),
            self.pair_reserve_b(42u64).get(),
            self.pair_fee_percent(42u64).get(),
            self.pair_is_active(42u64).get(),
        ).into()
    }

    #[view(pairExistsPair42)]
    fn pair_exists_pair_42(&self) -> bool {
        self.registered_pair_ids().contains(&42u64)
    }

    #[view(getFeesPair42)]
    fn get_fees_pair_42(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(42u64).get(), self.pair_fees_b(42u64).get()).into()
    }

    #[view(getReservesPair43)]
    fn get_reserves_pair_43(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(43u64).get(), self.pair_reserve_b(43u64).get()).into()
    }

    #[view(getPairInfoPair43)]
    fn get_pair_info_pair_43(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(43u64).get(),
            self.pair_token_b(43u64).get(),
            self.pair_token_a_is_klv(43u64).get(),
            self.pair_token_b_is_klv(43u64).get(),
            self.pair_reserve_a(43u64).get(),
            self.pair_reserve_b(43u64).get(),
            self.pair_fee_percent(43u64).get(),
            self.pair_is_active(43u64).get(),
        ).into()
    }

    #[view(pairExistsPair43)]
    fn pair_exists_pair_43(&self) -> bool {
        self.registered_pair_ids().contains(&43u64)
    }

    #[view(getFeesPair43)]
    fn get_fees_pair_43(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(43u64).get(), self.pair_fees_b(43u64).get()).into()
    }

    #[view(getReservesPair44)]
    fn get_reserves_pair_44(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(44u64).get(), self.pair_reserve_b(44u64).get()).into()
    }

    #[view(getPairInfoPair44)]
    fn get_pair_info_pair_44(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(44u64).get(),
            self.pair_token_b(44u64).get(),
            self.pair_token_a_is_klv(44u64).get(),
            self.pair_token_b_is_klv(44u64).get(),
            self.pair_reserve_a(44u64).get(),
            self.pair_reserve_b(44u64).get(),
            self.pair_fee_percent(44u64).get(),
            self.pair_is_active(44u64).get(),
        ).into()
    }

    #[view(pairExistsPair44)]
    fn pair_exists_pair_44(&self) -> bool {
        self.registered_pair_ids().contains(&44u64)
    }

    #[view(getFeesPair44)]
    fn get_fees_pair_44(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(44u64).get(), self.pair_fees_b(44u64).get()).into()
    }

    #[view(getReservesPair45)]
    fn get_reserves_pair_45(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(45u64).get(), self.pair_reserve_b(45u64).get()).into()
    }

    #[view(getPairInfoPair45)]
    fn get_pair_info_pair_45(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(45u64).get(),
            self.pair_token_b(45u64).get(),
            self.pair_token_a_is_klv(45u64).get(),
            self.pair_token_b_is_klv(45u64).get(),
            self.pair_reserve_a(45u64).get(),
            self.pair_reserve_b(45u64).get(),
            self.pair_fee_percent(45u64).get(),
            self.pair_is_active(45u64).get(),
        ).into()
    }

    #[view(pairExistsPair45)]
    fn pair_exists_pair_45(&self) -> bool {
        self.registered_pair_ids().contains(&45u64)
    }

    #[view(getFeesPair45)]
    fn get_fees_pair_45(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(45u64).get(), self.pair_fees_b(45u64).get()).into()
    }

    #[view(getReservesPair46)]
    fn get_reserves_pair_46(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(46u64).get(), self.pair_reserve_b(46u64).get()).into()
    }

    #[view(getPairInfoPair46)]
    fn get_pair_info_pair_46(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(46u64).get(),
            self.pair_token_b(46u64).get(),
            self.pair_token_a_is_klv(46u64).get(),
            self.pair_token_b_is_klv(46u64).get(),
            self.pair_reserve_a(46u64).get(),
            self.pair_reserve_b(46u64).get(),
            self.pair_fee_percent(46u64).get(),
            self.pair_is_active(46u64).get(),
        ).into()
    }

    #[view(pairExistsPair46)]
    fn pair_exists_pair_46(&self) -> bool {
        self.registered_pair_ids().contains(&46u64)
    }

    #[view(getFeesPair46)]
    fn get_fees_pair_46(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(46u64).get(), self.pair_fees_b(46u64).get()).into()
    }

    #[view(getReservesPair47)]
    fn get_reserves_pair_47(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(47u64).get(), self.pair_reserve_b(47u64).get()).into()
    }

    #[view(getPairInfoPair47)]
    fn get_pair_info_pair_47(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(47u64).get(),
            self.pair_token_b(47u64).get(),
            self.pair_token_a_is_klv(47u64).get(),
            self.pair_token_b_is_klv(47u64).get(),
            self.pair_reserve_a(47u64).get(),
            self.pair_reserve_b(47u64).get(),
            self.pair_fee_percent(47u64).get(),
            self.pair_is_active(47u64).get(),
        ).into()
    }

    #[view(pairExistsPair47)]
    fn pair_exists_pair_47(&self) -> bool {
        self.registered_pair_ids().contains(&47u64)
    }

    #[view(getFeesPair47)]
    fn get_fees_pair_47(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(47u64).get(), self.pair_fees_b(47u64).get()).into()
    }

    #[view(getReservesPair48)]
    fn get_reserves_pair_48(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(48u64).get(), self.pair_reserve_b(48u64).get()).into()
    }

    #[view(getPairInfoPair48)]
    fn get_pair_info_pair_48(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(48u64).get(),
            self.pair_token_b(48u64).get(),
            self.pair_token_a_is_klv(48u64).get(),
            self.pair_token_b_is_klv(48u64).get(),
            self.pair_reserve_a(48u64).get(),
            self.pair_reserve_b(48u64).get(),
            self.pair_fee_percent(48u64).get(),
            self.pair_is_active(48u64).get(),
        ).into()
    }

    #[view(pairExistsPair48)]
    fn pair_exists_pair_48(&self) -> bool {
        self.registered_pair_ids().contains(&48u64)
    }

    #[view(getFeesPair48)]
    fn get_fees_pair_48(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(48u64).get(), self.pair_fees_b(48u64).get()).into()
    }

    #[view(getReservesPair49)]
    fn get_reserves_pair_49(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(49u64).get(), self.pair_reserve_b(49u64).get()).into()
    }

    #[view(getPairInfoPair49)]
    fn get_pair_info_pair_49(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(49u64).get(),
            self.pair_token_b(49u64).get(),
            self.pair_token_a_is_klv(49u64).get(),
            self.pair_token_b_is_klv(49u64).get(),
            self.pair_reserve_a(49u64).get(),
            self.pair_reserve_b(49u64).get(),
            self.pair_fee_percent(49u64).get(),
            self.pair_is_active(49u64).get(),
        ).into()
    }

    #[view(pairExistsPair49)]
    fn pair_exists_pair_49(&self) -> bool {
        self.registered_pair_ids().contains(&49u64)
    }

    #[view(getFeesPair49)]
    fn get_fees_pair_49(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(49u64).get(), self.pair_fees_b(49u64).get()).into()
    }

    #[view(getReservesPair50)]
    fn get_reserves_pair_50(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(50u64).get(), self.pair_reserve_b(50u64).get()).into()
    }

    #[view(getPairInfoPair50)]
    fn get_pair_info_pair_50(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(50u64).get(),
            self.pair_token_b(50u64).get(),
            self.pair_token_a_is_klv(50u64).get(),
            self.pair_token_b_is_klv(50u64).get(),
            self.pair_reserve_a(50u64).get(),
            self.pair_reserve_b(50u64).get(),
            self.pair_fee_percent(50u64).get(),
            self.pair_is_active(50u64).get(),
        ).into()
    }

    #[view(pairExistsPair50)]
    fn pair_exists_pair_50(&self) -> bool {
        self.registered_pair_ids().contains(&50u64)
    }

    #[view(getFeesPair50)]
    fn get_fees_pair_50(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(50u64).get(), self.pair_fees_b(50u64).get()).into()
    }

    #[view(getReservesPair51)]
    fn get_reserves_pair_51(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(51u64).get(), self.pair_reserve_b(51u64).get()).into()
    }

    #[view(getPairInfoPair51)]
    fn get_pair_info_pair_51(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(51u64).get(),
            self.pair_token_b(51u64).get(),
            self.pair_token_a_is_klv(51u64).get(),
            self.pair_token_b_is_klv(51u64).get(),
            self.pair_reserve_a(51u64).get(),
            self.pair_reserve_b(51u64).get(),
            self.pair_fee_percent(51u64).get(),
            self.pair_is_active(51u64).get(),
        ).into()
    }

    #[view(pairExistsPair51)]
    fn pair_exists_pair_51(&self) -> bool {
        self.registered_pair_ids().contains(&51u64)
    }

    #[view(getFeesPair51)]
    fn get_fees_pair_51(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(51u64).get(), self.pair_fees_b(51u64).get()).into()
    }

    #[view(getReservesPair52)]
    fn get_reserves_pair_52(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(52u64).get(), self.pair_reserve_b(52u64).get()).into()
    }

    #[view(getPairInfoPair52)]
    fn get_pair_info_pair_52(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(52u64).get(),
            self.pair_token_b(52u64).get(),
            self.pair_token_a_is_klv(52u64).get(),
            self.pair_token_b_is_klv(52u64).get(),
            self.pair_reserve_a(52u64).get(),
            self.pair_reserve_b(52u64).get(),
            self.pair_fee_percent(52u64).get(),
            self.pair_is_active(52u64).get(),
        ).into()
    }

    #[view(pairExistsPair52)]
    fn pair_exists_pair_52(&self) -> bool {
        self.registered_pair_ids().contains(&52u64)
    }

    #[view(getFeesPair52)]
    fn get_fees_pair_52(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(52u64).get(), self.pair_fees_b(52u64).get()).into()
    }

    #[view(getReservesPair53)]
    fn get_reserves_pair_53(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(53u64).get(), self.pair_reserve_b(53u64).get()).into()
    }

    #[view(getPairInfoPair53)]
    fn get_pair_info_pair_53(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(53u64).get(),
            self.pair_token_b(53u64).get(),
            self.pair_token_a_is_klv(53u64).get(),
            self.pair_token_b_is_klv(53u64).get(),
            self.pair_reserve_a(53u64).get(),
            self.pair_reserve_b(53u64).get(),
            self.pair_fee_percent(53u64).get(),
            self.pair_is_active(53u64).get(),
        ).into()
    }

    #[view(pairExistsPair53)]
    fn pair_exists_pair_53(&self) -> bool {
        self.registered_pair_ids().contains(&53u64)
    }

    #[view(getFeesPair53)]
    fn get_fees_pair_53(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(53u64).get(), self.pair_fees_b(53u64).get()).into()
    }

    #[view(getReservesPair54)]
    fn get_reserves_pair_54(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(54u64).get(), self.pair_reserve_b(54u64).get()).into()
    }

    #[view(getPairInfoPair54)]
    fn get_pair_info_pair_54(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(54u64).get(),
            self.pair_token_b(54u64).get(),
            self.pair_token_a_is_klv(54u64).get(),
            self.pair_token_b_is_klv(54u64).get(),
            self.pair_reserve_a(54u64).get(),
            self.pair_reserve_b(54u64).get(),
            self.pair_fee_percent(54u64).get(),
            self.pair_is_active(54u64).get(),
        ).into()
    }

    #[view(pairExistsPair54)]
    fn pair_exists_pair_54(&self) -> bool {
        self.registered_pair_ids().contains(&54u64)
    }

    #[view(getFeesPair54)]
    fn get_fees_pair_54(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(54u64).get(), self.pair_fees_b(54u64).get()).into()
    }

    #[view(getReservesPair55)]
    fn get_reserves_pair_55(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(55u64).get(), self.pair_reserve_b(55u64).get()).into()
    }

    #[view(getPairInfoPair55)]
    fn get_pair_info_pair_55(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(55u64).get(),
            self.pair_token_b(55u64).get(),
            self.pair_token_a_is_klv(55u64).get(),
            self.pair_token_b_is_klv(55u64).get(),
            self.pair_reserve_a(55u64).get(),
            self.pair_reserve_b(55u64).get(),
            self.pair_fee_percent(55u64).get(),
            self.pair_is_active(55u64).get(),
        ).into()
    }

    #[view(pairExistsPair55)]
    fn pair_exists_pair_55(&self) -> bool {
        self.registered_pair_ids().contains(&55u64)
    }

    #[view(getFeesPair55)]
    fn get_fees_pair_55(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(55u64).get(), self.pair_fees_b(55u64).get()).into()
    }

    #[view(getReservesPair56)]
    fn get_reserves_pair_56(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(56u64).get(), self.pair_reserve_b(56u64).get()).into()
    }

    #[view(getPairInfoPair56)]
    fn get_pair_info_pair_56(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(56u64).get(),
            self.pair_token_b(56u64).get(),
            self.pair_token_a_is_klv(56u64).get(),
            self.pair_token_b_is_klv(56u64).get(),
            self.pair_reserve_a(56u64).get(),
            self.pair_reserve_b(56u64).get(),
            self.pair_fee_percent(56u64).get(),
            self.pair_is_active(56u64).get(),
        ).into()
    }

    #[view(pairExistsPair56)]
    fn pair_exists_pair_56(&self) -> bool {
        self.registered_pair_ids().contains(&56u64)
    }

    #[view(getFeesPair56)]
    fn get_fees_pair_56(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(56u64).get(), self.pair_fees_b(56u64).get()).into()
    }

    #[view(getReservesPair57)]
    fn get_reserves_pair_57(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(57u64).get(), self.pair_reserve_b(57u64).get()).into()
    }

    #[view(getPairInfoPair57)]
    fn get_pair_info_pair_57(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(57u64).get(),
            self.pair_token_b(57u64).get(),
            self.pair_token_a_is_klv(57u64).get(),
            self.pair_token_b_is_klv(57u64).get(),
            self.pair_reserve_a(57u64).get(),
            self.pair_reserve_b(57u64).get(),
            self.pair_fee_percent(57u64).get(),
            self.pair_is_active(57u64).get(),
        ).into()
    }

    #[view(pairExistsPair57)]
    fn pair_exists_pair_57(&self) -> bool {
        self.registered_pair_ids().contains(&57u64)
    }

    #[view(getFeesPair57)]
    fn get_fees_pair_57(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(57u64).get(), self.pair_fees_b(57u64).get()).into()
    }

    #[view(getReservesPair58)]
    fn get_reserves_pair_58(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(58u64).get(), self.pair_reserve_b(58u64).get()).into()
    }

    #[view(getPairInfoPair58)]
    fn get_pair_info_pair_58(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(58u64).get(),
            self.pair_token_b(58u64).get(),
            self.pair_token_a_is_klv(58u64).get(),
            self.pair_token_b_is_klv(58u64).get(),
            self.pair_reserve_a(58u64).get(),
            self.pair_reserve_b(58u64).get(),
            self.pair_fee_percent(58u64).get(),
            self.pair_is_active(58u64).get(),
        ).into()
    }

    #[view(pairExistsPair58)]
    fn pair_exists_pair_58(&self) -> bool {
        self.registered_pair_ids().contains(&58u64)
    }

    #[view(getFeesPair58)]
    fn get_fees_pair_58(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(58u64).get(), self.pair_fees_b(58u64).get()).into()
    }

    #[view(getReservesPair59)]
    fn get_reserves_pair_59(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(59u64).get(), self.pair_reserve_b(59u64).get()).into()
    }

    #[view(getPairInfoPair59)]
    fn get_pair_info_pair_59(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(59u64).get(),
            self.pair_token_b(59u64).get(),
            self.pair_token_a_is_klv(59u64).get(),
            self.pair_token_b_is_klv(59u64).get(),
            self.pair_reserve_a(59u64).get(),
            self.pair_reserve_b(59u64).get(),
            self.pair_fee_percent(59u64).get(),
            self.pair_is_active(59u64).get(),
        ).into()
    }

    #[view(pairExistsPair59)]
    fn pair_exists_pair_59(&self) -> bool {
        self.registered_pair_ids().contains(&59u64)
    }

    #[view(getFeesPair59)]
    fn get_fees_pair_59(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(59u64).get(), self.pair_fees_b(59u64).get()).into()
    }

    #[view(getReservesPair60)]
    fn get_reserves_pair_60(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(60u64).get(), self.pair_reserve_b(60u64).get()).into()
    }

    #[view(getPairInfoPair60)]
    fn get_pair_info_pair_60(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(60u64).get(),
            self.pair_token_b(60u64).get(),
            self.pair_token_a_is_klv(60u64).get(),
            self.pair_token_b_is_klv(60u64).get(),
            self.pair_reserve_a(60u64).get(),
            self.pair_reserve_b(60u64).get(),
            self.pair_fee_percent(60u64).get(),
            self.pair_is_active(60u64).get(),
        ).into()
    }

    #[view(pairExistsPair60)]
    fn pair_exists_pair_60(&self) -> bool {
        self.registered_pair_ids().contains(&60u64)
    }

    #[view(getFeesPair60)]
    fn get_fees_pair_60(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(60u64).get(), self.pair_fees_b(60u64).get()).into()
    }

    #[view(getReservesPair61)]
    fn get_reserves_pair_61(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(61u64).get(), self.pair_reserve_b(61u64).get()).into()
    }

    #[view(getPairInfoPair61)]
    fn get_pair_info_pair_61(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(61u64).get(),
            self.pair_token_b(61u64).get(),
            self.pair_token_a_is_klv(61u64).get(),
            self.pair_token_b_is_klv(61u64).get(),
            self.pair_reserve_a(61u64).get(),
            self.pair_reserve_b(61u64).get(),
            self.pair_fee_percent(61u64).get(),
            self.pair_is_active(61u64).get(),
        ).into()
    }

    #[view(pairExistsPair61)]
    fn pair_exists_pair_61(&self) -> bool {
        self.registered_pair_ids().contains(&61u64)
    }

    #[view(getFeesPair61)]
    fn get_fees_pair_61(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(61u64).get(), self.pair_fees_b(61u64).get()).into()
    }

    #[view(getReservesPair62)]
    fn get_reserves_pair_62(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(62u64).get(), self.pair_reserve_b(62u64).get()).into()
    }

    #[view(getPairInfoPair62)]
    fn get_pair_info_pair_62(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(62u64).get(),
            self.pair_token_b(62u64).get(),
            self.pair_token_a_is_klv(62u64).get(),
            self.pair_token_b_is_klv(62u64).get(),
            self.pair_reserve_a(62u64).get(),
            self.pair_reserve_b(62u64).get(),
            self.pair_fee_percent(62u64).get(),
            self.pair_is_active(62u64).get(),
        ).into()
    }

    #[view(pairExistsPair62)]
    fn pair_exists_pair_62(&self) -> bool {
        self.registered_pair_ids().contains(&62u64)
    }

    #[view(getFeesPair62)]
    fn get_fees_pair_62(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(62u64).get(), self.pair_fees_b(62u64).get()).into()
    }

    #[view(getReservesPair63)]
    fn get_reserves_pair_63(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(63u64).get(), self.pair_reserve_b(63u64).get()).into()
    }

    #[view(getPairInfoPair63)]
    fn get_pair_info_pair_63(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(63u64).get(),
            self.pair_token_b(63u64).get(),
            self.pair_token_a_is_klv(63u64).get(),
            self.pair_token_b_is_klv(63u64).get(),
            self.pair_reserve_a(63u64).get(),
            self.pair_reserve_b(63u64).get(),
            self.pair_fee_percent(63u64).get(),
            self.pair_is_active(63u64).get(),
        ).into()
    }

    #[view(pairExistsPair63)]
    fn pair_exists_pair_63(&self) -> bool {
        self.registered_pair_ids().contains(&63u64)
    }

    #[view(getFeesPair63)]
    fn get_fees_pair_63(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(63u64).get(), self.pair_fees_b(63u64).get()).into()
    }

    #[view(getReservesPair64)]
    fn get_reserves_pair_64(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(64u64).get(), self.pair_reserve_b(64u64).get()).into()
    }

    #[view(getPairInfoPair64)]
    fn get_pair_info_pair_64(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(64u64).get(),
            self.pair_token_b(64u64).get(),
            self.pair_token_a_is_klv(64u64).get(),
            self.pair_token_b_is_klv(64u64).get(),
            self.pair_reserve_a(64u64).get(),
            self.pair_reserve_b(64u64).get(),
            self.pair_fee_percent(64u64).get(),
            self.pair_is_active(64u64).get(),
        ).into()
    }

    #[view(pairExistsPair64)]
    fn pair_exists_pair_64(&self) -> bool {
        self.registered_pair_ids().contains(&64u64)
    }

    #[view(getFeesPair64)]
    fn get_fees_pair_64(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(64u64).get(), self.pair_fees_b(64u64).get()).into()
    }

    #[view(getReservesPair65)]
    fn get_reserves_pair_65(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(65u64).get(), self.pair_reserve_b(65u64).get()).into()
    }

    #[view(getPairInfoPair65)]
    fn get_pair_info_pair_65(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(65u64).get(),
            self.pair_token_b(65u64).get(),
            self.pair_token_a_is_klv(65u64).get(),
            self.pair_token_b_is_klv(65u64).get(),
            self.pair_reserve_a(65u64).get(),
            self.pair_reserve_b(65u64).get(),
            self.pair_fee_percent(65u64).get(),
            self.pair_is_active(65u64).get(),
        ).into()
    }

    #[view(pairExistsPair65)]
    fn pair_exists_pair_65(&self) -> bool {
        self.registered_pair_ids().contains(&65u64)
    }

    #[view(getFeesPair65)]
    fn get_fees_pair_65(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(65u64).get(), self.pair_fees_b(65u64).get()).into()
    }

    #[view(getReservesPair66)]
    fn get_reserves_pair_66(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(66u64).get(), self.pair_reserve_b(66u64).get()).into()
    }

    #[view(getPairInfoPair66)]
    fn get_pair_info_pair_66(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(66u64).get(),
            self.pair_token_b(66u64).get(),
            self.pair_token_a_is_klv(66u64).get(),
            self.pair_token_b_is_klv(66u64).get(),
            self.pair_reserve_a(66u64).get(),
            self.pair_reserve_b(66u64).get(),
            self.pair_fee_percent(66u64).get(),
            self.pair_is_active(66u64).get(),
        ).into()
    }

    #[view(pairExistsPair66)]
    fn pair_exists_pair_66(&self) -> bool {
        self.registered_pair_ids().contains(&66u64)
    }

    #[view(getFeesPair66)]
    fn get_fees_pair_66(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(66u64).get(), self.pair_fees_b(66u64).get()).into()
    }

    #[view(getReservesPair67)]
    fn get_reserves_pair_67(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(67u64).get(), self.pair_reserve_b(67u64).get()).into()
    }

    #[view(getPairInfoPair67)]
    fn get_pair_info_pair_67(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(67u64).get(),
            self.pair_token_b(67u64).get(),
            self.pair_token_a_is_klv(67u64).get(),
            self.pair_token_b_is_klv(67u64).get(),
            self.pair_reserve_a(67u64).get(),
            self.pair_reserve_b(67u64).get(),
            self.pair_fee_percent(67u64).get(),
            self.pair_is_active(67u64).get(),
        ).into()
    }

    #[view(pairExistsPair67)]
    fn pair_exists_pair_67(&self) -> bool {
        self.registered_pair_ids().contains(&67u64)
    }

    #[view(getFeesPair67)]
    fn get_fees_pair_67(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(67u64).get(), self.pair_fees_b(67u64).get()).into()
    }

    #[view(getReservesPair68)]
    fn get_reserves_pair_68(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(68u64).get(), self.pair_reserve_b(68u64).get()).into()
    }

    #[view(getPairInfoPair68)]
    fn get_pair_info_pair_68(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(68u64).get(),
            self.pair_token_b(68u64).get(),
            self.pair_token_a_is_klv(68u64).get(),
            self.pair_token_b_is_klv(68u64).get(),
            self.pair_reserve_a(68u64).get(),
            self.pair_reserve_b(68u64).get(),
            self.pair_fee_percent(68u64).get(),
            self.pair_is_active(68u64).get(),
        ).into()
    }

    #[view(pairExistsPair68)]
    fn pair_exists_pair_68(&self) -> bool {
        self.registered_pair_ids().contains(&68u64)
    }

    #[view(getFeesPair68)]
    fn get_fees_pair_68(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(68u64).get(), self.pair_fees_b(68u64).get()).into()
    }

    #[view(getReservesPair69)]
    fn get_reserves_pair_69(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(69u64).get(), self.pair_reserve_b(69u64).get()).into()
    }

    #[view(getPairInfoPair69)]
    fn get_pair_info_pair_69(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(69u64).get(),
            self.pair_token_b(69u64).get(),
            self.pair_token_a_is_klv(69u64).get(),
            self.pair_token_b_is_klv(69u64).get(),
            self.pair_reserve_a(69u64).get(),
            self.pair_reserve_b(69u64).get(),
            self.pair_fee_percent(69u64).get(),
            self.pair_is_active(69u64).get(),
        ).into()
    }

    #[view(pairExistsPair69)]
    fn pair_exists_pair_69(&self) -> bool {
        self.registered_pair_ids().contains(&69u64)
    }

    #[view(getFeesPair69)]
    fn get_fees_pair_69(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(69u64).get(), self.pair_fees_b(69u64).get()).into()
    }

    #[view(getReservesPair70)]
    fn get_reserves_pair_70(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(70u64).get(), self.pair_reserve_b(70u64).get()).into()
    }

    #[view(getPairInfoPair70)]
    fn get_pair_info_pair_70(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(70u64).get(),
            self.pair_token_b(70u64).get(),
            self.pair_token_a_is_klv(70u64).get(),
            self.pair_token_b_is_klv(70u64).get(),
            self.pair_reserve_a(70u64).get(),
            self.pair_reserve_b(70u64).get(),
            self.pair_fee_percent(70u64).get(),
            self.pair_is_active(70u64).get(),
        ).into()
    }

    #[view(pairExistsPair70)]
    fn pair_exists_pair_70(&self) -> bool {
        self.registered_pair_ids().contains(&70u64)
    }

    #[view(getFeesPair70)]
    fn get_fees_pair_70(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(70u64).get(), self.pair_fees_b(70u64).get()).into()
    }

    #[view(getReservesPair71)]
    fn get_reserves_pair_71(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(71u64).get(), self.pair_reserve_b(71u64).get()).into()
    }

    #[view(getPairInfoPair71)]
    fn get_pair_info_pair_71(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(71u64).get(),
            self.pair_token_b(71u64).get(),
            self.pair_token_a_is_klv(71u64).get(),
            self.pair_token_b_is_klv(71u64).get(),
            self.pair_reserve_a(71u64).get(),
            self.pair_reserve_b(71u64).get(),
            self.pair_fee_percent(71u64).get(),
            self.pair_is_active(71u64).get(),
        ).into()
    }

    #[view(pairExistsPair71)]
    fn pair_exists_pair_71(&self) -> bool {
        self.registered_pair_ids().contains(&71u64)
    }

    #[view(getFeesPair71)]
    fn get_fees_pair_71(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(71u64).get(), self.pair_fees_b(71u64).get()).into()
    }

    #[view(getReservesPair72)]
    fn get_reserves_pair_72(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(72u64).get(), self.pair_reserve_b(72u64).get()).into()
    }

    #[view(getPairInfoPair72)]
    fn get_pair_info_pair_72(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(72u64).get(),
            self.pair_token_b(72u64).get(),
            self.pair_token_a_is_klv(72u64).get(),
            self.pair_token_b_is_klv(72u64).get(),
            self.pair_reserve_a(72u64).get(),
            self.pair_reserve_b(72u64).get(),
            self.pair_fee_percent(72u64).get(),
            self.pair_is_active(72u64).get(),
        ).into()
    }

    #[view(pairExistsPair72)]
    fn pair_exists_pair_72(&self) -> bool {
        self.registered_pair_ids().contains(&72u64)
    }

    #[view(getFeesPair72)]
    fn get_fees_pair_72(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(72u64).get(), self.pair_fees_b(72u64).get()).into()
    }

    #[view(getReservesPair73)]
    fn get_reserves_pair_73(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(73u64).get(), self.pair_reserve_b(73u64).get()).into()
    }

    #[view(getPairInfoPair73)]
    fn get_pair_info_pair_73(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(73u64).get(),
            self.pair_token_b(73u64).get(),
            self.pair_token_a_is_klv(73u64).get(),
            self.pair_token_b_is_klv(73u64).get(),
            self.pair_reserve_a(73u64).get(),
            self.pair_reserve_b(73u64).get(),
            self.pair_fee_percent(73u64).get(),
            self.pair_is_active(73u64).get(),
        ).into()
    }

    #[view(pairExistsPair73)]
    fn pair_exists_pair_73(&self) -> bool {
        self.registered_pair_ids().contains(&73u64)
    }

    #[view(getFeesPair73)]
    fn get_fees_pair_73(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(73u64).get(), self.pair_fees_b(73u64).get()).into()
    }

    #[view(getReservesPair74)]
    fn get_reserves_pair_74(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(74u64).get(), self.pair_reserve_b(74u64).get()).into()
    }

    #[view(getPairInfoPair74)]
    fn get_pair_info_pair_74(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(74u64).get(),
            self.pair_token_b(74u64).get(),
            self.pair_token_a_is_klv(74u64).get(),
            self.pair_token_b_is_klv(74u64).get(),
            self.pair_reserve_a(74u64).get(),
            self.pair_reserve_b(74u64).get(),
            self.pair_fee_percent(74u64).get(),
            self.pair_is_active(74u64).get(),
        ).into()
    }

    #[view(pairExistsPair74)]
    fn pair_exists_pair_74(&self) -> bool {
        self.registered_pair_ids().contains(&74u64)
    }

    #[view(getFeesPair74)]
    fn get_fees_pair_74(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(74u64).get(), self.pair_fees_b(74u64).get()).into()
    }

    #[view(getReservesPair75)]
    fn get_reserves_pair_75(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(75u64).get(), self.pair_reserve_b(75u64).get()).into()
    }

    #[view(getPairInfoPair75)]
    fn get_pair_info_pair_75(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(75u64).get(),
            self.pair_token_b(75u64).get(),
            self.pair_token_a_is_klv(75u64).get(),
            self.pair_token_b_is_klv(75u64).get(),
            self.pair_reserve_a(75u64).get(),
            self.pair_reserve_b(75u64).get(),
            self.pair_fee_percent(75u64).get(),
            self.pair_is_active(75u64).get(),
        ).into()
    }

    #[view(pairExistsPair75)]
    fn pair_exists_pair_75(&self) -> bool {
        self.registered_pair_ids().contains(&75u64)
    }

    #[view(getFeesPair75)]
    fn get_fees_pair_75(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(75u64).get(), self.pair_fees_b(75u64).get()).into()
    }

    #[view(getReservesPair76)]
    fn get_reserves_pair_76(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(76u64).get(), self.pair_reserve_b(76u64).get()).into()
    }

    #[view(getPairInfoPair76)]
    fn get_pair_info_pair_76(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(76u64).get(),
            self.pair_token_b(76u64).get(),
            self.pair_token_a_is_klv(76u64).get(),
            self.pair_token_b_is_klv(76u64).get(),
            self.pair_reserve_a(76u64).get(),
            self.pair_reserve_b(76u64).get(),
            self.pair_fee_percent(76u64).get(),
            self.pair_is_active(76u64).get(),
        ).into()
    }

    #[view(pairExistsPair76)]
    fn pair_exists_pair_76(&self) -> bool {
        self.registered_pair_ids().contains(&76u64)
    }

    #[view(getFeesPair76)]
    fn get_fees_pair_76(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(76u64).get(), self.pair_fees_b(76u64).get()).into()
    }

    #[view(getReservesPair77)]
    fn get_reserves_pair_77(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(77u64).get(), self.pair_reserve_b(77u64).get()).into()
    }

    #[view(getPairInfoPair77)]
    fn get_pair_info_pair_77(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(77u64).get(),
            self.pair_token_b(77u64).get(),
            self.pair_token_a_is_klv(77u64).get(),
            self.pair_token_b_is_klv(77u64).get(),
            self.pair_reserve_a(77u64).get(),
            self.pair_reserve_b(77u64).get(),
            self.pair_fee_percent(77u64).get(),
            self.pair_is_active(77u64).get(),
        ).into()
    }

    #[view(pairExistsPair77)]
    fn pair_exists_pair_77(&self) -> bool {
        self.registered_pair_ids().contains(&77u64)
    }

    #[view(getFeesPair77)]
    fn get_fees_pair_77(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(77u64).get(), self.pair_fees_b(77u64).get()).into()
    }

    #[view(getReservesPair78)]
    fn get_reserves_pair_78(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(78u64).get(), self.pair_reserve_b(78u64).get()).into()
    }

    #[view(getPairInfoPair78)]
    fn get_pair_info_pair_78(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(78u64).get(),
            self.pair_token_b(78u64).get(),
            self.pair_token_a_is_klv(78u64).get(),
            self.pair_token_b_is_klv(78u64).get(),
            self.pair_reserve_a(78u64).get(),
            self.pair_reserve_b(78u64).get(),
            self.pair_fee_percent(78u64).get(),
            self.pair_is_active(78u64).get(),
        ).into()
    }

    #[view(pairExistsPair78)]
    fn pair_exists_pair_78(&self) -> bool {
        self.registered_pair_ids().contains(&78u64)
    }

    #[view(getFeesPair78)]
    fn get_fees_pair_78(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(78u64).get(), self.pair_fees_b(78u64).get()).into()
    }

    #[view(getReservesPair79)]
    fn get_reserves_pair_79(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(79u64).get(), self.pair_reserve_b(79u64).get()).into()
    }

    #[view(getPairInfoPair79)]
    fn get_pair_info_pair_79(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(79u64).get(),
            self.pair_token_b(79u64).get(),
            self.pair_token_a_is_klv(79u64).get(),
            self.pair_token_b_is_klv(79u64).get(),
            self.pair_reserve_a(79u64).get(),
            self.pair_reserve_b(79u64).get(),
            self.pair_fee_percent(79u64).get(),
            self.pair_is_active(79u64).get(),
        ).into()
    }

    #[view(pairExistsPair79)]
    fn pair_exists_pair_79(&self) -> bool {
        self.registered_pair_ids().contains(&79u64)
    }

    #[view(getFeesPair79)]
    fn get_fees_pair_79(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(79u64).get(), self.pair_fees_b(79u64).get()).into()
    }

    #[view(getReservesPair80)]
    fn get_reserves_pair_80(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(80u64).get(), self.pair_reserve_b(80u64).get()).into()
    }

    #[view(getPairInfoPair80)]
    fn get_pair_info_pair_80(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(80u64).get(),
            self.pair_token_b(80u64).get(),
            self.pair_token_a_is_klv(80u64).get(),
            self.pair_token_b_is_klv(80u64).get(),
            self.pair_reserve_a(80u64).get(),
            self.pair_reserve_b(80u64).get(),
            self.pair_fee_percent(80u64).get(),
            self.pair_is_active(80u64).get(),
        ).into()
    }

    #[view(pairExistsPair80)]
    fn pair_exists_pair_80(&self) -> bool {
        self.registered_pair_ids().contains(&80u64)
    }

    #[view(getFeesPair80)]
    fn get_fees_pair_80(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(80u64).get(), self.pair_fees_b(80u64).get()).into()
    }

    #[view(getReservesPair81)]
    fn get_reserves_pair_81(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(81u64).get(), self.pair_reserve_b(81u64).get()).into()
    }

    #[view(getPairInfoPair81)]
    fn get_pair_info_pair_81(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(81u64).get(),
            self.pair_token_b(81u64).get(),
            self.pair_token_a_is_klv(81u64).get(),
            self.pair_token_b_is_klv(81u64).get(),
            self.pair_reserve_a(81u64).get(),
            self.pair_reserve_b(81u64).get(),
            self.pair_fee_percent(81u64).get(),
            self.pair_is_active(81u64).get(),
        ).into()
    }

    #[view(pairExistsPair81)]
    fn pair_exists_pair_81(&self) -> bool {
        self.registered_pair_ids().contains(&81u64)
    }

    #[view(getFeesPair81)]
    fn get_fees_pair_81(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(81u64).get(), self.pair_fees_b(81u64).get()).into()
    }

    #[view(getReservesPair82)]
    fn get_reserves_pair_82(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(82u64).get(), self.pair_reserve_b(82u64).get()).into()
    }

    #[view(getPairInfoPair82)]
    fn get_pair_info_pair_82(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(82u64).get(),
            self.pair_token_b(82u64).get(),
            self.pair_token_a_is_klv(82u64).get(),
            self.pair_token_b_is_klv(82u64).get(),
            self.pair_reserve_a(82u64).get(),
            self.pair_reserve_b(82u64).get(),
            self.pair_fee_percent(82u64).get(),
            self.pair_is_active(82u64).get(),
        ).into()
    }

    #[view(pairExistsPair82)]
    fn pair_exists_pair_82(&self) -> bool {
        self.registered_pair_ids().contains(&82u64)
    }

    #[view(getFeesPair82)]
    fn get_fees_pair_82(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(82u64).get(), self.pair_fees_b(82u64).get()).into()
    }

    #[view(getReservesPair83)]
    fn get_reserves_pair_83(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(83u64).get(), self.pair_reserve_b(83u64).get()).into()
    }

    #[view(getPairInfoPair83)]
    fn get_pair_info_pair_83(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(83u64).get(),
            self.pair_token_b(83u64).get(),
            self.pair_token_a_is_klv(83u64).get(),
            self.pair_token_b_is_klv(83u64).get(),
            self.pair_reserve_a(83u64).get(),
            self.pair_reserve_b(83u64).get(),
            self.pair_fee_percent(83u64).get(),
            self.pair_is_active(83u64).get(),
        ).into()
    }

    #[view(pairExistsPair83)]
    fn pair_exists_pair_83(&self) -> bool {
        self.registered_pair_ids().contains(&83u64)
    }

    #[view(getFeesPair83)]
    fn get_fees_pair_83(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(83u64).get(), self.pair_fees_b(83u64).get()).into()
    }

    #[view(getReservesPair84)]
    fn get_reserves_pair_84(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(84u64).get(), self.pair_reserve_b(84u64).get()).into()
    }

    #[view(getPairInfoPair84)]
    fn get_pair_info_pair_84(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(84u64).get(),
            self.pair_token_b(84u64).get(),
            self.pair_token_a_is_klv(84u64).get(),
            self.pair_token_b_is_klv(84u64).get(),
            self.pair_reserve_a(84u64).get(),
            self.pair_reserve_b(84u64).get(),
            self.pair_fee_percent(84u64).get(),
            self.pair_is_active(84u64).get(),
        ).into()
    }

    #[view(pairExistsPair84)]
    fn pair_exists_pair_84(&self) -> bool {
        self.registered_pair_ids().contains(&84u64)
    }

    #[view(getFeesPair84)]
    fn get_fees_pair_84(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(84u64).get(), self.pair_fees_b(84u64).get()).into()
    }

    #[view(getReservesPair85)]
    fn get_reserves_pair_85(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(85u64).get(), self.pair_reserve_b(85u64).get()).into()
    }

    #[view(getPairInfoPair85)]
    fn get_pair_info_pair_85(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(85u64).get(),
            self.pair_token_b(85u64).get(),
            self.pair_token_a_is_klv(85u64).get(),
            self.pair_token_b_is_klv(85u64).get(),
            self.pair_reserve_a(85u64).get(),
            self.pair_reserve_b(85u64).get(),
            self.pair_fee_percent(85u64).get(),
            self.pair_is_active(85u64).get(),
        ).into()
    }

    #[view(pairExistsPair85)]
    fn pair_exists_pair_85(&self) -> bool {
        self.registered_pair_ids().contains(&85u64)
    }

    #[view(getFeesPair85)]
    fn get_fees_pair_85(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(85u64).get(), self.pair_fees_b(85u64).get()).into()
    }

    #[view(getReservesPair86)]
    fn get_reserves_pair_86(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(86u64).get(), self.pair_reserve_b(86u64).get()).into()
    }

    #[view(getPairInfoPair86)]
    fn get_pair_info_pair_86(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(86u64).get(),
            self.pair_token_b(86u64).get(),
            self.pair_token_a_is_klv(86u64).get(),
            self.pair_token_b_is_klv(86u64).get(),
            self.pair_reserve_a(86u64).get(),
            self.pair_reserve_b(86u64).get(),
            self.pair_fee_percent(86u64).get(),
            self.pair_is_active(86u64).get(),
        ).into()
    }

    #[view(pairExistsPair86)]
    fn pair_exists_pair_86(&self) -> bool {
        self.registered_pair_ids().contains(&86u64)
    }

    #[view(getFeesPair86)]
    fn get_fees_pair_86(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(86u64).get(), self.pair_fees_b(86u64).get()).into()
    }

    #[view(getReservesPair87)]
    fn get_reserves_pair_87(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(87u64).get(), self.pair_reserve_b(87u64).get()).into()
    }

    #[view(getPairInfoPair87)]
    fn get_pair_info_pair_87(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(87u64).get(),
            self.pair_token_b(87u64).get(),
            self.pair_token_a_is_klv(87u64).get(),
            self.pair_token_b_is_klv(87u64).get(),
            self.pair_reserve_a(87u64).get(),
            self.pair_reserve_b(87u64).get(),
            self.pair_fee_percent(87u64).get(),
            self.pair_is_active(87u64).get(),
        ).into()
    }

    #[view(pairExistsPair87)]
    fn pair_exists_pair_87(&self) -> bool {
        self.registered_pair_ids().contains(&87u64)
    }

    #[view(getFeesPair87)]
    fn get_fees_pair_87(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(87u64).get(), self.pair_fees_b(87u64).get()).into()
    }

    #[view(getReservesPair88)]
    fn get_reserves_pair_88(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(88u64).get(), self.pair_reserve_b(88u64).get()).into()
    }

    #[view(getPairInfoPair88)]
    fn get_pair_info_pair_88(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(88u64).get(),
            self.pair_token_b(88u64).get(),
            self.pair_token_a_is_klv(88u64).get(),
            self.pair_token_b_is_klv(88u64).get(),
            self.pair_reserve_a(88u64).get(),
            self.pair_reserve_b(88u64).get(),
            self.pair_fee_percent(88u64).get(),
            self.pair_is_active(88u64).get(),
        ).into()
    }

    #[view(pairExistsPair88)]
    fn pair_exists_pair_88(&self) -> bool {
        self.registered_pair_ids().contains(&88u64)
    }

    #[view(getFeesPair88)]
    fn get_fees_pair_88(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(88u64).get(), self.pair_fees_b(88u64).get()).into()
    }

    #[view(getReservesPair89)]
    fn get_reserves_pair_89(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(89u64).get(), self.pair_reserve_b(89u64).get()).into()
    }

    #[view(getPairInfoPair89)]
    fn get_pair_info_pair_89(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(89u64).get(),
            self.pair_token_b(89u64).get(),
            self.pair_token_a_is_klv(89u64).get(),
            self.pair_token_b_is_klv(89u64).get(),
            self.pair_reserve_a(89u64).get(),
            self.pair_reserve_b(89u64).get(),
            self.pair_fee_percent(89u64).get(),
            self.pair_is_active(89u64).get(),
        ).into()
    }

    #[view(pairExistsPair89)]
    fn pair_exists_pair_89(&self) -> bool {
        self.registered_pair_ids().contains(&89u64)
    }

    #[view(getFeesPair89)]
    fn get_fees_pair_89(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(89u64).get(), self.pair_fees_b(89u64).get()).into()
    }

    #[view(getReservesPair90)]
    fn get_reserves_pair_90(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(90u64).get(), self.pair_reserve_b(90u64).get()).into()
    }

    #[view(getPairInfoPair90)]
    fn get_pair_info_pair_90(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(90u64).get(),
            self.pair_token_b(90u64).get(),
            self.pair_token_a_is_klv(90u64).get(),
            self.pair_token_b_is_klv(90u64).get(),
            self.pair_reserve_a(90u64).get(),
            self.pair_reserve_b(90u64).get(),
            self.pair_fee_percent(90u64).get(),
            self.pair_is_active(90u64).get(),
        ).into()
    }

    #[view(pairExistsPair90)]
    fn pair_exists_pair_90(&self) -> bool {
        self.registered_pair_ids().contains(&90u64)
    }

    #[view(getFeesPair90)]
    fn get_fees_pair_90(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(90u64).get(), self.pair_fees_b(90u64).get()).into()
    }

    #[view(getReservesPair91)]
    fn get_reserves_pair_91(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(91u64).get(), self.pair_reserve_b(91u64).get()).into()
    }

    #[view(getPairInfoPair91)]
    fn get_pair_info_pair_91(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(91u64).get(),
            self.pair_token_b(91u64).get(),
            self.pair_token_a_is_klv(91u64).get(),
            self.pair_token_b_is_klv(91u64).get(),
            self.pair_reserve_a(91u64).get(),
            self.pair_reserve_b(91u64).get(),
            self.pair_fee_percent(91u64).get(),
            self.pair_is_active(91u64).get(),
        ).into()
    }

    #[view(pairExistsPair91)]
    fn pair_exists_pair_91(&self) -> bool {
        self.registered_pair_ids().contains(&91u64)
    }

    #[view(getFeesPair91)]
    fn get_fees_pair_91(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(91u64).get(), self.pair_fees_b(91u64).get()).into()
    }

    #[view(getReservesPair92)]
    fn get_reserves_pair_92(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(92u64).get(), self.pair_reserve_b(92u64).get()).into()
    }

    #[view(getPairInfoPair92)]
    fn get_pair_info_pair_92(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(92u64).get(),
            self.pair_token_b(92u64).get(),
            self.pair_token_a_is_klv(92u64).get(),
            self.pair_token_b_is_klv(92u64).get(),
            self.pair_reserve_a(92u64).get(),
            self.pair_reserve_b(92u64).get(),
            self.pair_fee_percent(92u64).get(),
            self.pair_is_active(92u64).get(),
        ).into()
    }

    #[view(pairExistsPair92)]
    fn pair_exists_pair_92(&self) -> bool {
        self.registered_pair_ids().contains(&92u64)
    }

    #[view(getFeesPair92)]
    fn get_fees_pair_92(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(92u64).get(), self.pair_fees_b(92u64).get()).into()
    }

    #[view(getReservesPair93)]
    fn get_reserves_pair_93(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(93u64).get(), self.pair_reserve_b(93u64).get()).into()
    }

    #[view(getPairInfoPair93)]
    fn get_pair_info_pair_93(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(93u64).get(),
            self.pair_token_b(93u64).get(),
            self.pair_token_a_is_klv(93u64).get(),
            self.pair_token_b_is_klv(93u64).get(),
            self.pair_reserve_a(93u64).get(),
            self.pair_reserve_b(93u64).get(),
            self.pair_fee_percent(93u64).get(),
            self.pair_is_active(93u64).get(),
        ).into()
    }

    #[view(pairExistsPair93)]
    fn pair_exists_pair_93(&self) -> bool {
        self.registered_pair_ids().contains(&93u64)
    }

    #[view(getFeesPair93)]
    fn get_fees_pair_93(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(93u64).get(), self.pair_fees_b(93u64).get()).into()
    }

    #[view(getReservesPair94)]
    fn get_reserves_pair_94(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(94u64).get(), self.pair_reserve_b(94u64).get()).into()
    }

    #[view(getPairInfoPair94)]
    fn get_pair_info_pair_94(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(94u64).get(),
            self.pair_token_b(94u64).get(),
            self.pair_token_a_is_klv(94u64).get(),
            self.pair_token_b_is_klv(94u64).get(),
            self.pair_reserve_a(94u64).get(),
            self.pair_reserve_b(94u64).get(),
            self.pair_fee_percent(94u64).get(),
            self.pair_is_active(94u64).get(),
        ).into()
    }

    #[view(pairExistsPair94)]
    fn pair_exists_pair_94(&self) -> bool {
        self.registered_pair_ids().contains(&94u64)
    }

    #[view(getFeesPair94)]
    fn get_fees_pair_94(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(94u64).get(), self.pair_fees_b(94u64).get()).into()
    }

    #[view(getReservesPair95)]
    fn get_reserves_pair_95(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(95u64).get(), self.pair_reserve_b(95u64).get()).into()
    }

    #[view(getPairInfoPair95)]
    fn get_pair_info_pair_95(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(95u64).get(),
            self.pair_token_b(95u64).get(),
            self.pair_token_a_is_klv(95u64).get(),
            self.pair_token_b_is_klv(95u64).get(),
            self.pair_reserve_a(95u64).get(),
            self.pair_reserve_b(95u64).get(),
            self.pair_fee_percent(95u64).get(),
            self.pair_is_active(95u64).get(),
        ).into()
    }

    #[view(pairExistsPair95)]
    fn pair_exists_pair_95(&self) -> bool {
        self.registered_pair_ids().contains(&95u64)
    }

    #[view(getFeesPair95)]
    fn get_fees_pair_95(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(95u64).get(), self.pair_fees_b(95u64).get()).into()
    }

    #[view(getReservesPair96)]
    fn get_reserves_pair_96(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(96u64).get(), self.pair_reserve_b(96u64).get()).into()
    }

    #[view(getPairInfoPair96)]
    fn get_pair_info_pair_96(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(96u64).get(),
            self.pair_token_b(96u64).get(),
            self.pair_token_a_is_klv(96u64).get(),
            self.pair_token_b_is_klv(96u64).get(),
            self.pair_reserve_a(96u64).get(),
            self.pair_reserve_b(96u64).get(),
            self.pair_fee_percent(96u64).get(),
            self.pair_is_active(96u64).get(),
        ).into()
    }

    #[view(pairExistsPair96)]
    fn pair_exists_pair_96(&self) -> bool {
        self.registered_pair_ids().contains(&96u64)
    }

    #[view(getFeesPair96)]
    fn get_fees_pair_96(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(96u64).get(), self.pair_fees_b(96u64).get()).into()
    }

    #[view(getReservesPair97)]
    fn get_reserves_pair_97(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(97u64).get(), self.pair_reserve_b(97u64).get()).into()
    }

    #[view(getPairInfoPair97)]
    fn get_pair_info_pair_97(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(97u64).get(),
            self.pair_token_b(97u64).get(),
            self.pair_token_a_is_klv(97u64).get(),
            self.pair_token_b_is_klv(97u64).get(),
            self.pair_reserve_a(97u64).get(),
            self.pair_reserve_b(97u64).get(),
            self.pair_fee_percent(97u64).get(),
            self.pair_is_active(97u64).get(),
        ).into()
    }

    #[view(pairExistsPair97)]
    fn pair_exists_pair_97(&self) -> bool {
        self.registered_pair_ids().contains(&97u64)
    }

    #[view(getFeesPair97)]
    fn get_fees_pair_97(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(97u64).get(), self.pair_fees_b(97u64).get()).into()
    }

    #[view(getReservesPair98)]
    fn get_reserves_pair_98(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(98u64).get(), self.pair_reserve_b(98u64).get()).into()
    }

    #[view(getPairInfoPair98)]
    fn get_pair_info_pair_98(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(98u64).get(),
            self.pair_token_b(98u64).get(),
            self.pair_token_a_is_klv(98u64).get(),
            self.pair_token_b_is_klv(98u64).get(),
            self.pair_reserve_a(98u64).get(),
            self.pair_reserve_b(98u64).get(),
            self.pair_fee_percent(98u64).get(),
            self.pair_is_active(98u64).get(),
        ).into()
    }

    #[view(pairExistsPair98)]
    fn pair_exists_pair_98(&self) -> bool {
        self.registered_pair_ids().contains(&98u64)
    }

    #[view(getFeesPair98)]
    fn get_fees_pair_98(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(98u64).get(), self.pair_fees_b(98u64).get()).into()
    }

    #[view(getReservesPair99)]
    fn get_reserves_pair_99(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(99u64).get(), self.pair_reserve_b(99u64).get()).into()
    }

    #[view(getPairInfoPair99)]
    fn get_pair_info_pair_99(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(99u64).get(),
            self.pair_token_b(99u64).get(),
            self.pair_token_a_is_klv(99u64).get(),
            self.pair_token_b_is_klv(99u64).get(),
            self.pair_reserve_a(99u64).get(),
            self.pair_reserve_b(99u64).get(),
            self.pair_fee_percent(99u64).get(),
            self.pair_is_active(99u64).get(),
        ).into()
    }

    #[view(pairExistsPair99)]
    fn pair_exists_pair_99(&self) -> bool {
        self.registered_pair_ids().contains(&99u64)
    }

    #[view(getFeesPair99)]
    fn get_fees_pair_99(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(99u64).get(), self.pair_fees_b(99u64).get()).into()
    }

    #[view(getReservesPair100)]
    fn get_reserves_pair_100(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_reserve_a(100u64).get(), self.pair_reserve_b(100u64).get()).into()
    }

    #[view(getPairInfoPair100)]
    fn get_pair_info_pair_100(&self) -> MultiValue8<TokenIdentifier, TokenIdentifier, bool, bool, BigUint, BigUint, u64, bool> {
        (
            self.pair_token_a(100u64).get(),
            self.pair_token_b(100u64).get(),
            self.pair_token_a_is_klv(100u64).get(),
            self.pair_token_b_is_klv(100u64).get(),
            self.pair_reserve_a(100u64).get(),
            self.pair_reserve_b(100u64).get(),
            self.pair_fee_percent(100u64).get(),
            self.pair_is_active(100u64).get(),
        ).into()
    }

    #[view(pairExistsPair100)]
    fn pair_exists_pair_100(&self) -> bool {
        self.registered_pair_ids().contains(&100u64)
    }

    #[view(getFeesPair100)]
    fn get_fees_pair_100(&self) -> MultiValue2<BigUint, BigUint> {
        (self.pair_fees_a(100u64).get(), self.pair_fees_b(100u64).get()).into()
    }

    // ========================================================================
    // STORAGE
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

    #[storage_mapper("pair_fees_a")]
    fn pair_fees_a(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pair_fees_b")]
    fn pair_fees_b(&self, pair_id: u64) -> SingleValueMapper<BigUint>;

    #[storage_mapper("pair_fee_percent")]
    fn pair_fee_percent(&self, pair_id: u64) -> SingleValueMapper<u64>;

    #[storage_mapper("pair_is_active")]
    fn pair_is_active(&self, pair_id: u64) -> SingleValueMapper<bool>;
}
