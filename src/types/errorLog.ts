/**
 * Comprehensive Error Log Types
 * 
 * These types define the structure for capturing detailed error information
 * that can be sent to developers for debugging purposes.
 */

export interface ErrorLog {
  // Basic error info
  title: string;
  message: string;
  stackTrace?: string;
  
  // Context
  timestamp: string;
  userAddress?: string; // Truncated for privacy (first 8 + last 6)
  route: string;
  component?: string;
  action?: string;
  
  // Environment
  browser: BrowserInfo;
  network: 'mainnet' | 'testnet' | 'unknown';
  appVersion: string;
  
  // Transaction details (if applicable)
  transaction?: TransactionErrorDetails;
  
  // API details (if applicable)
  api?: ApiErrorDetails;
}

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  userAgent: string;
}

export interface TransactionErrorDetails {
  type: 'stake' | 'unstake' | 'claim' | 'swap' | 'send' | 'other';
  tokenSymbol?: string;
  amount?: string;
  recipient?: string; // Truncated
  txHash?: string;
  gasUsed?: string;
  rawError?: string;
}

export interface ApiErrorDetails {
  endpoint: string;
  method: string;
  statusCode?: number;
  responseBody?: string;
  requestBody?: string;
}

export interface ErrorModalProps {
  isOpen: boolean;
  status: 'success' | 'error' | 'loading';
  title?: string;
  message?: string;
  txHash?: string;
  errorLog?: ErrorLog; // Enhanced: full error log
  onClose: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}
