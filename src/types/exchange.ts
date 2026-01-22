/**
 * Shared Exchange Types
 * Used across token pages and documentation
 */

export interface Exchange {
  name: string;
  type: string;
  url: string;
  logo: string;
  pair?: string;
}
