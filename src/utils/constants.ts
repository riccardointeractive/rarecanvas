export type Network = 'mainnet' | 'testnet';

export const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    nodeUrl: 'https://api.mainnet.klever.org',  // Correct .org domain
    chainId: 100,
  },
  testnet: {
    name: 'Testnet',
    nodeUrl: 'https://api.testnet.klever.org',  // Correct .org domain
    chainId: 101,
  },
} as const;

export const TX_TYPES = {
  TRANSFER: 0,
  CREATE_ASSET: 1,
  CREATE_VALIDATOR: 2,
  VALIDATOR_CONFIG: 3,
  FREEZE: 4,
  UNFREEZE: 5,
  DELEGATE: 6,
  UNDELEGATE: 7,
  WITHDRAW: 8,
  CLAIM: 9,
  UNJAIL: 10,
  ASSET_TRIGGER: 11,
  SET_ACCOUNT_NAME: 12,
  PROPOSAL: 13,
  VOTE: 14,
  CONFIG_ITO: 15,
  SET_ITO_PRICES: 16,
  BUY: 17,
  SELL: 18,
  CANCEL_MARKET_ORDER: 19,
  CREATE_MARKETPLACE: 20,
  CONFIG_MARKETPLACE: 21,
  DEPOSIT: 22,
  SMART_CONTRACT: 23,
} as const;

export const CONTRACT_ADDRESS = 'klv1YOUR_CONTRACT_ADDRESS_HERE'; // Replace after deployment

export const KLEVER_DECIMALS = 6;

// Re-export formatters for backward compatibility
// New code should import directly from '@/utils/formatters'
export { formatKLVFromKaons as formatKLV } from './formatters';

export const parseKLV = (amount: number, precision: number = KLEVER_DECIMALS): number => {
  return Math.floor(amount * Math.pow(10, precision));
};