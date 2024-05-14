import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { formatEther, formatGwei, parseAbi, type Address } from 'viem';
import { getClient } from './utils/client';

// constants
const EXPIRY = 2019657600000n; // 2033-12-31; default value used by Aethir frontend
const CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS}` as Address;
const TX_GAS_USED = 56000n;
const CSV_PATH = '../data.csv';

// main
const main = async () => {
  console.log('Initializing Aethir batch setup, loading tx data...');

  // get values from CSV - "tokenId,nodeAddress"
  const filePath = path.resolve(__dirname, CSV_PATH);
  let csv = fs.readFileSync(filePath, { encoding: 'utf-8' }) as string | null;

  if (!csv) {
    throw new Error(`CSV file not found @ ${filePath}`);
  }

  // console.log(`Input data:\n${csv}\n`);
  const txInputs = csv
    .trim()
    .split('\n')
    .map(line => {
      const [tokenId, nodeAddress] = line.trim().split(',');
      return [BigInt(tokenId), nodeAddress, EXPIRY] as [bigint, Address, bigint];
    });
  csv = null;

  if (!txInputs || !txInputs.length) {
    throw new Error('Error parsing CSV, no entries found.');
  }

  console.log(
    `Prepared ${txInputs.length} Aethir setup transactions from input data, setting up and checking wallet...\n`,
  );

  // setup
  const walletClient = getClient();
  const walletAddress = walletClient.account.address;

  // - native balance check
  const balance = await walletClient.getBalance({ address: walletAddress });
  const gasPrice = await walletClient.getGasPrice();
  console.log(`Network fee @${formatGwei(gasPrice)} Gwei`);
  const minBalance = gasPrice * TX_GAS_USED * BigInt(txInputs.length);
  if (balance < minBalance) {
    throw new Error(
      `Native balance of ${formatEther(balance)} in wallet "${walletAddress}" is not sufficient -> min.: ${formatEther(minBalance)}`,
    );
  }

  console.log(
    `Using wallet "${walletAddress}" with a native balance of ${formatEther(balance)}. Starting batch execution, estimated fees: ${formatEther(minBalance)}.\n`,
  );

  // fire transactions one by one
  const contractBase = {
    address: CONTRACT_ADDRESS,
    abi: parseAbi(['function setUser(uint256,address,uint64)']),
    functionName: 'setUser',
  } as const;

  let errorCount = 0;
  for (let i = 0; i < txInputs.length; i++) {
    console.log(`Sending tx #${i} - Token ID ${txInputs[i][0]}`);
    try {
      // simulate
      const { request } = await walletClient.simulateContract({
        ...contractBase,
        args: txInputs[i],
      });

      // execute
      const txHash = await walletClient.writeContract(request);
      console.log(`- Sent tx: ${walletClient.chain.blockExplorers.default.url}/tx/${txHash}`);

      // wait
      await walletClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`- Tx validated successfully\n`);
    } catch (e) {
      errorCount++;
      console.error('\n### TX ERROR ###');
      console.error(e);
    }
  }

  console.log(`\nFinished processing ${txInputs.length} transactions. Tx errors: ${errorCount}`);
};

// start
main();
