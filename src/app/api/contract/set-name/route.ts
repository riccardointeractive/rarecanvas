import { NextRequest, NextResponse } from 'next/server';
import { debugLog } from '@/utils/debugMode';
import { Account, TransactionType, utils } from '@klever/sdk-node';

// Set provider for Node SDK
utils.setProviders({
  api: 'https://api.mainnet.klever.org',
  node: 'https://node.mainnet.klever.org',
});

// Contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SWAP_CONTRACT_ADDRESS || 
  'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h';

/**
 * POST /api/contract/set-name
 * 
 * Builds an unsigned SetAccountName transaction to set the contract's display name
 * 
 * Body:
 * {
 *   "ownerAddress": "klv1...",  // Contract owner wallet address
 *   "contractName": "Digiko DEX" // Desired contract name
 * }
 */
export async function POST(request: NextRequest) {
  try {
    debugLog('🏷️  Building SetAccountName transaction...');
    
    // Parse request body
    const body = await request.json();
    const { ownerAddress, contractName } = body;
    
    // Validate inputs
    if (!ownerAddress || typeof ownerAddress !== 'string') {
      return NextResponse.json(
        { error: 'Valid ownerAddress is required' },
        { status: 400 }
      );
    }
    
    if (!contractName || typeof contractName !== 'string') {
      return NextResponse.json(
        { error: 'Valid contractName is required' },
        { status: 400 }
      );
    }
    
    debugLog('📋 Parameters:');
    debugLog('  Owner:', ownerAddress);
    debugLog('  Contract:', CONTRACT_ADDRESS);
    debugLog('  Name:', contractName);
    
    // Get nonce for owner address
    const accountResponse = await fetch(
      `https://api.mainnet.klever.org/v1.0/address/${ownerAddress}`
    );
    
    if (!accountResponse.ok) {
      throw new Error('Failed to fetch account nonce');
    }
    
    const accountData = await accountResponse.json();
    const nonce = accountData.data?.account?.nonce || 0;
    
    debugLog('🔢 Current nonce:', nonce);
    
    // Create temporary account for building transaction
    const tempAccount = new Account();
    await tempAccount.ready;
    
    // Build SetAccountName transaction
    // This transaction will be sent FROM the owner address
    // but sets the name for the contract address
    const unsignedTx = await tempAccount.buildTransaction(
      [
        {
          type: TransactionType.SetAccountName, // Type 12
          payload: {
            name: contractName,
          },
        },
      ],
      [], // No metadata needed
      {
        nonce: nonce,
        sender: ownerAddress,
      }
    );
    
    debugLog('✅ Transaction built successfully!');
    debugLog('📤 Unsigned TX:', JSON.stringify(unsignedTx, null, 2));
    
    return NextResponse.json({
      success: true,
      unsignedTx,
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      nonce,
      message: `Transaction ready to set contract name to "${contractName}"`,
    });
    
  } catch (error: any) {
    console.error('❌ Error building SetAccountName transaction:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || error?.toString() || 'Failed to build transaction',
      },
      { status: 500 }
    );
  }
}
