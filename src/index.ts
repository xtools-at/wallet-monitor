import { parseAbi, type Address } from 'viem';
import { getClient } from './utils/client';

// constants
const EXPIRY = 2019657600000n; // 2033-12-31
const BATCH_SIZE = 1024; // for multicall, in Bytes
const CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS}` as Address;

// main
const main = async () => {
  console.log('Initializing Aethir batch setup, loading tx data...');

  // TODO: get values - "tokenId,nodeAddress"
  const csv = `10101,0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
20202,0x175e79B5DB1575476794e0153AaE721505Aa4b40`;

  const txInputs = csv
    .trim()
    .split('\n')
    .map(line => {
      const [tokenId, nodeAddress] = line.trim().split(',');
      return [BigInt(tokenId), nodeAddress, EXPIRY] as [bigint, Address, bigint];
    });

  console.log(
    `Prepared ${txInputs.length} Aethir setup transactions, starting multicall batch execution.`,
  );

  // fire multicall transactions
  const walletClient = getClient();

  const contractBase = {
    address: CONTRACT_ADDRESS,
    abi: parseAbi(['function setUser(uint256,address,uint64)']),
    functionName: 'setUser',
  } as const;

  const results = await walletClient.multicall({
    contracts: txInputs.map(args => {
      return {
        ...contractBase,
        args,
      };
    }),
    allowFailure: true,
    batchSize: BATCH_SIZE,
  });

  results.forEach((result, i) => {
    const success = !result.error && result.status === 'success';
    console.log(
      success ? 'SUCCESS' : 'ERROR',
      `- call #${i}: token id ${txInputs[i][0].toString()} `,
      !success ? `${JSON.stringify(result, undefined, 2)}\n` : undefined,
    );
  });
};

// start
main();
