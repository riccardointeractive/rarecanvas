export interface KleverWebProvider {
  initialize: () => Promise<void>;
  getWalletAddress: () => Promise<string>;
  getAccountInfo: (address: string) => Promise<AccountInfo>;
  sendTransaction: (tx: any) => Promise<TransactionResponse>;
  signTransaction: (tx: any) => Promise<string>;
  buildTransaction?: (contracts: any[], metadata?: string[]) => Promise<any>;
  broadcastTransactions?: (txs: any[]) => Promise<any>;
  [key: string]: any;
}

export interface KleverWindow {
  kleverWeb?: KleverWebProvider;
}

export interface AccountInfo {
  address: string;
  balance: number;
  nonce: number;
  allowance?: number;
  assets?: Asset[];
}

export interface Asset {
  assetId: string;
  balance: number;
  frozenBalance?: number;
  unfrozenBalance?: UnfrozenBalance[]; // Added for unstaking queue
}

export interface UnfrozenBalance {
  amount: number;
  unlockTime: number; // Epoch time in SECONDS
}

export interface Transaction {
  type: number;
  sender: string;
  nonce: number;
  data?: string[];
  kda?: string;
  kdaFee?: string;
  contract?: string[];
  permID?: number;
  toAddress?: string;
  amount?: number;
}

export interface TransactionResponse {
  hash: string;
  success: boolean;
  error?: string;
  code?: string;
  data?: any;
}

export interface ContractData {
  address: string;
  abi?: any;
  counter?: number;
}

export type Network = 'mainnet' | 'testnet';

export interface KleverContextType {
  address: string | null;
  balance: string;
  network: Network;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: Network) => void;
  sendKLV: (to: string, amount: number) => Promise<TransactionResponse>;
  getAccountInfo: () => Promise<AccountInfo | null>;
  refreshBalance: () => void;
}