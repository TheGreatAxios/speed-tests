const { createPublicClient, http, createWalletClient, encodeFunctionData, parseAbi } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { skaleCalypsoTestnet } = require('viem/chains');
const { PerformanceObserver, performance } = require('node:perf_hooks');
require('dotenv').config();

const RUNS = 10;
const rpcUrl = 'https://testnet.skalenodes.com/v1/giant-half-dual-testnet';
const wssUrl = 'wss://testnet.skalenodes.com/v1/ws/giant-half-dual-testnet';

const contractAddress = '0xB0B743c392cc6dC3ec597217C0E8f99Ac8e58aB8';
const abi = [
  'function increment() external'
];

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry);
  });
});
perfObserver.observe({ entryTypes: ['measure'], buffer: true });

async function main() {
  // Using HTTP Provider
  for (let i = 5; i <= RUNS; i++) {
    const publicClient = createPublicClient({
      chain: skaleCalypsoTestnet,
      transport: http(),
      pollingInterval: 100
    });

    const walletClient = createWalletClient({
      account: privateKeyToAccount(process.env.PRIVATE_KEY),
      transport: http(),
      chain: skaleCalypsoTestnet,
      pollingInterval: 100
    });

    performance.mark('start');
    const tx1 = await walletClient.sendTransaction({
      to: contractAddress,
      data: encodeFunctionData({
        abi: parseAbi(abi),
        functionName: "increment"
      })
    });
    console.log("Tx1: ", tx1);
    const rec = await publicClient.waitForTransactionReceipt({ hash: tx1 });
    console.log("Rec: ", rec);
    performance.mark('end');
    performance.measure('Tx', 'start', 'end');
  }

  // Using WebSocket Provider
  // for (let i = 5; i <= RUNS; i++) {
  //   const client = createPublicClient({
  //     transport: http(wssUrl),
  //   });

  //   const wallet = privateKeyToAccount(process.env.PRIVATE_KEY);
  //   const contract = {
  //     address: contractAddress,
  //     abi: abi,
  //   };

  //   performance.mark('start');
  //   const tx1 = await client.writeContract({
  //     ...contract,
  //     functionName: 'increment',
  //     account: wallet,
  //   });
  //   await client.waitForTransactionReceipt(tx1.hash);
  //   performance.mark('end');
  //   performance.measure('Tx', 'start', 'end');
  // }

  return;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
