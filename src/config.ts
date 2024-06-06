import { beam, immutableZkEvm } from 'viem/chains';
import { type NetworkConfig } from './types';

export const config = {
  waitAfterToken: 5_000,
  cronSchedule: '* */4 * * *', // every 4h
};

export const networks: NetworkConfig[] = [
  {
    name: 'Beam',
    chain: beam,
    wallets: ['0xF0D8145b9e0A04eD5daA533B2a2Ab65eDc133839'],
    tokens: [
      {
        symbol: 'BEAM',
        coinGeckoId: 'beam-2',
      },
      {
        symbol: 'WBEAM',
        address: '0xD51BFa777609213A653a2CD067c9A0132a2D316A',
        coinGeckoId: 'wrapped-merit-circle',
      },
      {
        symbol: 'USDC',
        address: '0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304',
        coinGeckoId: 'usd-coin',
        decimals: 6,
      },
      {
        symbol: 'RST',
        address: '0xe338aa35d844d5c1a4e052380dbfa939e0cce13f',
        coinGeckoId: 'raini-studios-token',
      },
    ],
  },
  {
    name: 'Immutable zkEVM',
    chain: immutableZkEvm,
    wallets: ['0xF0D8145b9e0A04eD5daA533B2a2Ab65eDc133839'],
    tokens: [
      {
        symbol: 'IMX',
        coinGeckoId: 'immutable-x',
      },
      {
        symbol: 'WIMX',
        address: '0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D',
        coinGeckoId: 'immutable-x',
      },
      {
        symbol: 'USDC',
        address: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
        coinGeckoId: 'usd-coin',
        decimals: 6,
      },
      {
        symbol: 'ETH',
        address: '0x52a6c53869ce09a731cd772f245b97a4401d3348',
        coinGeckoId: 'ethereum',
      },
    ],
  },
];
