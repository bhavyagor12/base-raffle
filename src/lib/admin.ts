import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, RAFFLE_ABI } from "@/lib/contract";
import { baseSepolia } from "viem/op-stack";

type RequestDrawArgs = {
  winnersCount: number;
  is_testnet?: boolean;
};

let privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x{string}`;

let testnet_rpc = "https://sepolia.base.org";
let mainnet_rpc = "https://mainnet.base.org";

const testnetPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(testnet_rpc),
});

const mainnetPublicClient = createPublicClient({
  chain: base,
  transport: http(mainnet_rpc),
});

const DEFAULT_REQUEST_CONFIRMATIONS = 5;

const MAX_CALLBACK_GAS = 2_500_000;

export async function requestDraw({
  winnersCount,
  is_testnet = false,
}: RequestDrawArgs) {
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: is_testnet ? baseSepolia : base,
    transport: http(is_testnet ? testnet_rpc : mainnet_rpc),
  });

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "requestRandomness",
    args: [MAX_CALLBACK_GAS, DEFAULT_REQUEST_CONFIRMATIONS, winnersCount],
  });
  let receipt;
  if (is_testnet) {
    receipt = await testnetPublicClient.waitForTransactionReceipt({ hash });
  } else {
    receipt = await mainnetPublicClient.waitForTransactionReceipt({ hash });
  }
  return receipt;
}
