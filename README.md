# Aethir Bulk Setup

## Quick start

- clone repo, install Node.js >= 20 and pnpm >= 8, init with `pnpm i`
- duplicate `.env.example` and rename to `.env`
  - add your `MNEMONIC` and the `CONTRACT_ADDRESS` of the license NFT, and set `TESTNET` accordingly
- put a CSV list of license token IDs and Aethir node addresses in the repo root as `data.csv`. The format should look like `tokenId,nodeAddress` without headers, e.g.:

```
10101,0x0000000000000000000000000000000000000B0b
20202,0x00000000000000000000000000000000000a71CE
```

- make sure that the wallet you've set up earlier either owns all the NFTs in the CSV, or is approved by the owner
  - if approvals are necessary, visit the token on the Arbiscan block explorer and call `setApprovalForAll(operator, approved)` from the NFT owner wallet, to approve your wallet as an operator
  - you should revoke this approval after running the script
- run `pnpm build` to build the script
- run `pnpm start` to start batch transactions with your configured input data csv and wallet
