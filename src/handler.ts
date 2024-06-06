import 'dotenv/config';
import { formatUnits, parseAbi } from 'viem';
import { config, networks } from './config';
import { type DataInput } from './types';
import { getClient } from './utils/client';
import { pushToDb } from './utils/sheetsModule';
import { log, round, wait } from './utils/utils';
import('node-fetch');

// handler
export const handler = async () => {
  const timestamp = new Date().toISOString();
  log(`[${timestamp}] Starting wallet lookup for ${networks.length} chains...\n`, true);
  if (!process.env.COINGECKO_API_KEY) log(`x NOT using Coingecko Pro API (missing key).\n`);

  for (let i = 0; i < networks.length; i++) {
    // network setup
    const network = networks[i];
    const { wallets, tokens } = network;
    const client = getClient(network.chain);

    // lookup configured wallets
    for (let j = 0; j < wallets.length; j++) {
      const wallet = wallets[j];
      log(`\nLooking up wallet ${wallet} on ${network.name}`);

      // lookup each token
      for (let k = 0; k < tokens.length; k++) {
        const token = tokens[k];
        let balanceRaw = 0n;

        log(`- Looking up token ${token.symbol}${token.address ? ` @ ${token.address}` : ''}`);

        try {
          if (!token.address) {
            // native balance check
            balanceRaw = await client.getBalance({ address: wallet });
          } else {
            // erc20 balance check
            balanceRaw = await client.readContract({
              abi: parseAbi(['function balanceOf(address) returns (uint256)']),
              functionName: 'balanceOf',
              address: token.address,
              args: [wallet],
            });
          }
        } catch (e) {
          console.error(`xx ERROR: RPC call failed for ${token.symbol} on ${network.name}`, e);
          continue;
        }

        // format balance
        const decimals = token.decimals !== undefined ? token.decimals : 18;
        const balance = formatUnits(balanceRaw, decimals);

        // lookup USD value
        const apiKey = `${process.env.COINGECKO_API_KEY}`;
        const apiUrl = `https://${apiKey ? 'pro-' : ''}api.coingecko.com/api/v3/simple/price?ids=${token.coinGeckoId}&vs_currencies=usd`;
        const apiOptions = {
          method: 'GET',
          headers: apiKey
            ? {
                'x-cg-pro-api-key': apiKey,
              }
            : undefined,
        };
        let coingeckoResponse;
        try {
          coingeckoResponse = (await (await fetch(apiUrl, apiOptions)).json()) as Record<
            string,
            any
          >;
        } catch (e) {
          console.error(
            `xx ERROR: Coingecko call failed for ${token.symbol} on ${network.name}`,
            e,
          );
        }

        if (coingeckoResponse) {
          // FIXME: insecure conversions from bigint to number ahead
          const usdRate: number = coingeckoResponse[token.coinGeckoId].usd;
          const usdValue = round(Number(balance) * usdRate, 2);

          // push to db
          const data: DataInput = {
            timestamp,
            network: network.name,
            wallet,
            symbol: token.symbol,
            balance: round(Number(balance), 4),
            usdRate: round(usdRate, 4),
            usdValue,
          };

          log(
            `-- ${data.symbol} balance: ${data.balance} / USD conversion rate: $${data.usdRate} / USD value: $${data.usdValue}\n`,
          );

          try {
            await pushToDb(data);
          } catch (e) {
            console.error(`xx ERROR: DB push failed for ${token.symbol} on ${network.name}`, e);
          }
        }

        // end token
        await wait(config.waitAfterToken);
      }
    }
  }

  // end lookup
  log(`[${new Date().toISOString()}] Finished wallet lookup.\n`, true);
};
