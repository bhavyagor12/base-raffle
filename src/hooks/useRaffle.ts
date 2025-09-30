"use client";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RAFFLE_ABI, CONTRACT_ADDRESS, CHAIN_ID, Phase } from "@/lib/contract";
import * as React from "react";

export function useRaffle() {
  const { address, isConnected, chainId } = useAccount();

  const phaseQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "phase",
    chainId: CHAIN_ID,
  });

  const entrantQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "isEntrant",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const winnerQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "isWinner",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    chainId: CHAIN_ID,
  });

  const enter = React.useCallback(
    (proof: `0x${string}`[] = []) => {
      if (!isConnected) throw new Error("Wallet not connected");
      if (chainId !== CHAIN_ID) throw new Error("Wrong chain");
      write.writeContract({
        abi: RAFFLE_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "enter",
        args: [proof],
        chainId: CHAIN_ID,
      });
    },
    [isConnected, chainId, write.writeContract],
  );

  React.useEffect(() => {
    if (wait.isSuccess) {
      entrantQuery.refetch();
      winnerQuery.refetch();
      phaseQuery.refetch();
    }
  }, [wait.isSuccess]);

  const loading =
    phaseQuery.isLoading ||
    entrantQuery.isLoading ||
    winnerQuery.isLoading ||
    write.isPending ||
    wait.isLoading;

  return {
    // connection
    address,
    isConnected,
    chainId,

    // reads
    phase: Number(phaseQuery.data ?? Phase.Enter) as Phase,
    alreadyEntered: Boolean(entrantQuery.data),
    isWinner: Boolean(winnerQuery.data),
    refetchAll: () => {
      phaseQuery.refetch();
      entrantQuery.refetch();
      winnerQuery.refetch();
    },

    // writes
    enter,
    txHash: write.data,
    txPending: write.isPending || wait.isLoading,
    txSuccess: wait.isSuccess,

    // ui
    loading,
  };
}
