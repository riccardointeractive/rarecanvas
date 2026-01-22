// Global type declarations for Klever Extension
declare global {
  interface Window {
    kleverWeb?: {
      signTransaction: (tx: any) => Promise<any>;
      initialize: () => Promise<void>;
      [key: string]: any;
    };
  }
}

export {};
