import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, RAFFLE_ABI } from "@/lib/contract";
import { baseSepolia } from "viem/op-stack";

type RequestDrawArgs = {
  winnersCount: number;
  is_testnet?: boolean;
};

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x{string}`;

const testnet_rpc = "https://sepolia.base.org";
const mainnet_rpc = "https://mainnet.base.org";

const testnetPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(testnet_rpc),
});

const mainnetPublicClient = createPublicClient({
  chain: base,
  transport: http(mainnet_rpc),
});

export async function requestDraw({
  winnersCount,
  is_testnet = false,
}: RequestDrawArgs) {
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(mainnet_rpc),
  });

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "requestRandomness",
    args: [500000, 3, winnersCount],
  });
  let receipt;
  if (is_testnet) {
    receipt = await testnetPublicClient.waitForTransactionReceipt({ hash });
  } else {
    receipt = await mainnetPublicClient.waitForTransactionReceipt({ hash });
  }
  return receipt;
}
