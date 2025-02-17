const { Contract, providers, Wallet} = require("ethers");
const { PerformanceObserver, performance } = require('node:perf_hooks');
require("dotenv").config();

const RUNS = 10;
const rpcUrl = "https://testnet.skalenodes.com/v1/giant-half-dual-testnet";
const wssUrl = "wss://testnet.skalenodes.com/v1/ws/giant-half-dual-testnet";

const contractAddress = "0xB0B743c392cc6dC3ec597217C0E8f99Ac8e58aB8";
const abi = [
	"function increment() external"
];


const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry)
  })
})
perfObserver.observe({ entryTypes: ["measure"], buffer: true })


async function main() {

	for (let i = 5; i <= RUNS; i++) {
		let provider = new providers.JsonRpcProvider(rpcUrl);
		provider.pollingInterval = 200;
		const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
		const contract = new Contract(contractAddress, abi, wallet);

		performance.mark('start');
		const tx1 = await contract.increment();
		await tx1.wait();
		performance.mark('end');
		performance.measure('Tx', 'start', 'end');
	}

	for (let i = 5; i <= RUNS; i++) {
		let provider = new providers.WebSocketProvider(wssUrl);
		const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
		const contract = new Contract(contractAddress, abi, wallet);

		performance.mark('start');
		const tx1 = await contract.increment();
		await tx1.wait();
		performance.mark('end');
		performance.measure('Tx', 'start', 'end');
	}

	return;
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})