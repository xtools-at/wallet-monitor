import { type Address, type Chain } from 'viem';

export type DataInput = {
  timestamp: string;
  wallet: Address;
  network: string;
  symbol: string;
  balance: number;
  usdValue: number;
  usdRate: number;
};

export type TokenConfig = {
  symbol: string;
  address?: Address;
  coinGeckoId: string;
  decimals?: number;
};

export type NetworkConfig = {
  name: string;
  chain: Chain;
  wallets: Address[];
  tokens: TokenConfig[];
};
