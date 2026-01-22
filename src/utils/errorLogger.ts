/**
 * Error Logging Utilities
 * 
 * Comprehensive error capture and formatting for debugging.
 * Captures all relevant context: browser, network, transaction details, etc.
 */

import { ErrorLog, BrowserInfo, TransactionErrorDetails, ApiErrorDetails } from '@/types/errorLog';
import { APP_CONFIG } from '@/config/app';

/**
 * Truncates wallet address for privacy while keeping it identifiable
 * @example klv1abc...def123
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 15) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

/**
 * Detects browser information from user agent
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    if (match?.[1]) browserVersion = match[1];
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/);
    if (match?.[1]) browserVersion = match[1];
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    if (match?.[1]) browserVersion = match[1];
  } else if (ua.includes('Edg')) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+\.\d+)/);
    if (match?.[1]) browserVersion = match[1];
  }
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  // Detect device type
  let device: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = 'mobile';
  }
  
  return {
    name: browserName,
    version: browserVersion,
    os,
    device,
    userAgent: ua,
  };
}

/**
 * Gets current network from config or wallet
 */
export function getCurrentNetwork(): 'mainnet' | 'testnet' | 'unknown' {
  return APP_CONFIG.network as 'mainnet' | 'testnet';
}

/**
 * Creates a comprehensive error log with all debugging information
 */
export function createErrorLog(params: {
  title: string;
  message: string;
  error?: Error;
  userAddress?: string;
  component?: string;
  action?: string;
  transaction?: TransactionErrorDetails;
  api?: ApiErrorDetails;
}): ErrorLog {
  const {
    title,
    message,
    error,
    userAddress,
    component,
    action,
    transaction,
    api,
  } = params;
  
  return {
    // Basic error info
    title,
    message,
    stackTrace: error?.stack,
    
    // Context
    timestamp: new Date().toISOString(),
    userAddress: userAddress ? truncateAddress(userAddress) : undefined,
    route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    component,
    action,
    
    // Environment
    browser: getBrowserInfo(),
    network: getCurrentNetwork(),
    appVersion: APP_CONFIG.version,
    
    // Transaction details
    transaction,
    
    // API details
    api,
  };
}

/**
 * Formats error log as readable text for copying
 */
export function formatErrorLogForCopy(errorLog: ErrorLog): string {
  const sections: string[] = [];
  
  // Header
  sections.push('='.repeat(60));
  sections.push('DIGIKO ERROR LOG');
  sections.push('='.repeat(60));
  sections.push('');
  
  // Error Info
  sections.push('ERROR DETAILS:');
  sections.push(`Title: ${errorLog.title}`);
  sections.push(`Message: ${errorLog.message}`);
  if (errorLog.stackTrace) {
    sections.push(`Stack Trace:\n${errorLog.stackTrace}`);
  }
  sections.push('');
  
  // Context
  sections.push('CONTEXT:');
  sections.push(`Timestamp: ${errorLog.timestamp}`);
  sections.push(`Route: ${errorLog.route}`);
  if (errorLog.userAddress) {
    sections.push(`User Address: ${errorLog.userAddress}`);
  }
  if (errorLog.component) {
    sections.push(`Component: ${errorLog.component}`);
  }
  if (errorLog.action) {
    sections.push(`Action Attempted: ${errorLog.action}`);
  }
  sections.push('');
  
  // Environment
  sections.push('ENVIRONMENT:');
  sections.push(`App Version: ${errorLog.appVersion}`);
  sections.push(`Network: ${errorLog.network}`);
  sections.push(`Browser: ${errorLog.browser.name} ${errorLog.browser.version}`);
  sections.push(`OS: ${errorLog.browser.os}`);
  sections.push(`Device: ${errorLog.browser.device}`);
  sections.push(`User Agent: ${errorLog.browser.userAgent}`);
  sections.push('');
  
  // Transaction Details
  if (errorLog.transaction) {
    sections.push('TRANSACTION DETAILS:');
    sections.push(`Type: ${errorLog.transaction.type}`);
    if (errorLog.transaction.tokenSymbol) {
      sections.push(`Token: ${errorLog.transaction.tokenSymbol}`);
    }
    if (errorLog.transaction.amount) {
      sections.push(`Amount: ${errorLog.transaction.amount}`);
    }
    if (errorLog.transaction.recipient) {
      sections.push(`Recipient: ${errorLog.transaction.recipient}`);
    }
    if (errorLog.transaction.txHash) {
      sections.push(`TX Hash: ${errorLog.transaction.txHash}`);
    }
    if (errorLog.transaction.gasUsed) {
      sections.push(`Gas Used: ${errorLog.transaction.gasUsed}`);
    }
    if (errorLog.transaction.rawError) {
      sections.push(`Raw Error: ${errorLog.transaction.rawError}`);
    }
    sections.push('');
  }
  
  // API Details
  if (errorLog.api) {
    sections.push('API DETAILS:');
    sections.push(`Endpoint: ${errorLog.api.endpoint}`);
    sections.push(`Method: ${errorLog.api.method}`);
    if (errorLog.api.statusCode) {
      sections.push(`Status Code: ${errorLog.api.statusCode}`);
    }
    if (errorLog.api.requestBody) {
      sections.push(`Request Body: ${errorLog.api.requestBody}`);
    }
    if (errorLog.api.responseBody) {
      sections.push(`Response Body: ${errorLog.api.responseBody}`);
    }
    sections.push('');
  }
  
  // Footer
  sections.push('='.repeat(60));
  sections.push('END OF ERROR LOG');
  sections.push('='.repeat(60));
  
  return sections.join('\n');
}

/**
 * Copies error log to clipboard
 */
export async function copyErrorLogToClipboard(errorLog: ErrorLog): Promise<boolean> {
  try {
    const formattedLog = formatErrorLogForCopy(errorLog);
    await navigator.clipboard.writeText(formattedLog);
    return true;
  } catch (error) {
    console.error('Failed to copy error log:', error);
    return false;
  }
}
