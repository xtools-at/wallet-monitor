import { createWalletClient, http, publicActions, type Chain } from 'viem';
import { generatePrivateKey, mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';

export const getClient = (viemChain: Chain) => {
  const account = process.env.MNEMONIC
    ? mnemonicToAccount(process.env.MNEMONIC)
    : privateKeyToAccount(generatePrivateKey());

  const client = createWalletClient({
    account,
    chain: viemChain,
    transport: http(),
    pollingInterval: 2_000,
  }).extend(publicActions);

  return client;
};
