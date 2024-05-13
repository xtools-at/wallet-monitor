import {
  createWalletClient,
  getContract,
  http,
  publicActions,
  type Abi,
  type Address,
  type Chain,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import checkerLicenseNftAbi from '../abi/CheckerLicenseNFT';

export const getClient = (viemChain?: Chain) => {
  if (!process.env.MNEMONIC && !process.env.PRIVATE_KEY) {
    throw new Error('No keys found, please add mnemonic to ENV file.');
  }

  const account = process.env.MNEMONIC
    ? mnemonicToAccount(process.env.MNEMONIC)
    : privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  const chain = viemChain || (process.env.TESTNET ? arbitrumSepolia : arbitrum);

  const client = createWalletClient({
    account,
    chain,
    transport: http(),
    pollingInterval: 2_000,
  }).extend(publicActions);

  return client;
};

export const getContractInstance = (
  contractAddress: Address,
  client?: WalletClient & PublicClient,
  viemAbi?: Abi,
) => {
  const abi = viemAbi || checkerLicenseNftAbi;

  const contract = getContract({
    address: contractAddress,
    abi,
    client: client || getClient(),
  });

  return contract;
};
