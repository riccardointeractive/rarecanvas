/**
 * READY TO USE: Enhanced Staking Actions with Debug Mode & Error Logging
 * 
 * This is an example showing EXACTLY how to integrate both:
 * 1. Debug mode (force errors)
 * 2. Enhanced error logging
 * 
 * Copy the relevant parts into your useStakingActions.ts
 */

import { kleverService, TransactionType } from '@/utils/klever';
import { formatKLV, parseKLV } from '@/utils/constants';
import { web } from '@klever/sdk-web';
import { DEV_MODE, TOKEN_IDS, TOKEN_PRECISIONS } from '../config/staking.config';
import { TokenSymbol } from '../types/staking.types';

// ✨ ADD THESE IMPORTS:
import { createErrorLog } from '@/utils/errorLogger';
import { checkForForcedError, debugLog } from '@/utils/debugMode';
import { ErrorLog } from '@/types/errorLog';

/**
 * EXAMPLE: Enhanced handleStake with Debug Mode & Error Logging
 */
export function useStakingActions(
  selectedToken: TokenSymbol,
  address: string | null,
  // ... other params ...
  showSuccessModal: (title: string, message?: string, txHash?: string) => void,
  showErrorModal: (title: string, message: string, errorLog?: ErrorLog) => void, // ← Update signature
  showLoadingModal: (title: string, message?: string) => void,
) {
  
  const handleStake = async (stakeAmount: string, setStakeAmount: (amount: string) => void) => {
    if (!address) {
      // Simple validation errors don't need full error log
      showErrorModal('Wallet Not Connected', 'Please connect your wallet to stake tokens');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      showErrorModal('Invalid Amount', 'Please enter a valid amount to stake');
      return;
    }

    const availableBalanceNum = parseFloat(availableBalance.replace(/,/g, ''));
    const stakeAmountNum = parseFloat(stakeAmount);

    if (stakeAmountNum > availableBalanceNum) {
      // ✨ Enhanced: Add error log for insufficient balance
      const errorLog = createErrorLog({
        title: 'Insufficient Balance',
        message: `You don't have enough ${selectedToken} to stake this amount`,
        userAddress: address,
        component: 'StakingPage',
        action: `Attempt to stake ${stakeAmount} ${selectedToken}`,
        transaction: {
          type: 'stake',
          tokenSymbol: selectedToken,
          amount: stakeAmount,
          rawError: `Required: ${stakeAmount} ${selectedToken}, Available: ${availableBalance} ${selectedToken}`,
        },
      });
      
      showErrorModal(
        'Insufficient Balance',
        `You don't have enough ${selectedToken} to stake this amount`,
        errorLog
      );
      return;
    }

    // 🐛 DEBUG MODE: Force errors for testing
    try {
      checkForForcedError('insufficient_balance');
      checkForForcedError('wallet_rejected');
    } catch (error: any) {
      debugLog('Forced error triggered', { scenario: error.scenario });
      
      const errorLog = createErrorLog({
        title: 'Staking Failed (Debug Mode)',
        message: error.message,
        error: error as Error,
        userAddress: address,
        component: 'StakingPage',
        action: `Stake ${stakeAmount} ${selectedToken}`,
        transaction: {
          type: 'stake',
          tokenSymbol: selectedToken,
          amount: stakeAmount,
          rawError: `Debug Mode: ${error.scenario}`,
        },
      });
      
      showErrorModal('Staking Failed (Debug Mode)', error.message, errorLog);
      setIsLoading(false);
      return;
    }

    // 🚀 PRODUCTION MODE: Real transaction
    try {
      showLoadingModal('Processing Stake', `Staking ${stakeAmount} ${selectedToken}...`);
      setIsLoading(true);

      const accountInfo = await kleverService.getAccountInfo(address);
      const precision = TOKEN_PRECISIONS[selectedToken];
      const amountInUnits = parseKLV(parseFloat(stakeAmount), precision);

      const payload = {
        amount: amountInUnits,
        kda: TOKEN_IDS[selectedToken],
      };

      const unsignedTx = await kleverService.createTransaction(
        TransactionType.Freeze,
        payload,
        [address]
      );

      if (!unsignedTx) {
        throw new Error('Failed to create transaction');
      }

      unsignedTx.sender = address;
      unsignedTx.nonce = accountInfo.nonce;

      // 🐛 DEBUG MODE: Check for transaction failure
      try {
        checkForForcedError('transaction_failed');
      } catch (error: any) {
        throw new Error(`Transaction failed: ${error.message}`);
      }

      const signedTx = await web.signTransaction(unsignedTx);
      const txHash = await web.broadcastTransactions([signedTx]);

      console.log('Stake successful!', txHash);

      showSuccessModal(
        'Stake Successful',
        `Successfully staked ${stakeAmount} ${selectedToken}!`,
        txHash[0]
      );

      setStakeAmount('');
      setIsLoading(false);
      
      setTimeout(() => {
        fetchBalances();
        fetchTotalStaked();
      }, 2000);

    } catch (error: any) {
      console.error('Staking error:', error);
      
      // ✨ Enhanced: Create comprehensive error log
      const errorLog = createErrorLog({
        title: 'Staking Failed',
        message: 'Unable to complete staking transaction. Please try again.',
        error: error as Error,
        userAddress: address,
        component: 'StakingPage',
        action: `Stake ${stakeAmount} ${selectedToken}`,
        transaction: {
          type: 'stake',
          tokenSymbol: selectedToken,
          amount: stakeAmount,
          rawError: error.message || error.toString(),
        },
      });
      
      showErrorModal(
        'Staking Failed',
        'Unable to complete staking transaction. Please try again.',
        errorLog
      );
      
      setIsLoading(false);
    }
  };

  /**
   * EXAMPLE: Enhanced handleUnstake
   */
  const handleUnstake = async (unstakeAmount: string, setUnstakeAmount: (amount: string) => void) => {
    // Similar structure to handleStake...
    
    try {
      // 🐛 DEBUG MODE: Force errors
      checkForForcedError('transaction_failed');
      
      // ... your unstake logic ...
      
    } catch (error: any) {
      const errorLog = createErrorLog({
        title: 'Unstaking Failed',
        message: 'Unable to unstake tokens',
        error: error as Error,
        userAddress: address,
        component: 'StakingPage',
        action: `Unstake ${unstakeAmount} ${selectedToken}`,
        transaction: {
          type: 'unstake',
          tokenSymbol: selectedToken,
          amount: unstakeAmount,
          rawError: error.message,
        },
      });
      
      showErrorModal('Unstaking Failed', 'Unable to unstake tokens', errorLog);
      setIsLoading(false);
    }
  };

  return {
    handleStake,
    handleUnstake,
    // ... other handlers
  };
}

/**
 * SUMMARY OF CHANGES:
 * 
 * 1. Import debug utilities:
 *    import { createErrorLog } from '@/utils/errorLogger';
 *    import { checkForForcedError, debugLog } from '@/utils/debugMode';
 *    import { ErrorLog } from '@/types/errorLog';
 * 
 * 2. Update showErrorModal signature:
 *    showErrorModal: (title: string, message: string, errorLog?: ErrorLog) => void
 * 
 * 3. Add debug checks in try blocks:
 *    checkForForcedError('insufficient_balance');
 *    checkForForcedError('wallet_rejected');
 *    checkForForcedError('transaction_failed');
 * 
 * 4. Create error logs in catch blocks:
 *    const errorLog = createErrorLog({
 *      title, message, error, userAddress, component, action, transaction
 *    });
 *    showErrorModal(title, message, errorLog);
 * 
 * That's it! Now you can force errors in debug mode and test error logging!
 */
