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

  // ---- Reads ----
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

  const entrantsCountQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "entrantsCount",
    chainId: CHAIN_ID,
  });

  const winnersQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getWinners",
    chainId: CHAIN_ID,
  });

  const winnersTargetQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "winnersTarget",
    chainId: CHAIN_ID,
  });

  const randomSeedQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "randomSeed",
    chainId: CHAIN_ID,
  });

  const vrfRequestIdQuery = useReadContract({
    abi: RAFFLE_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "vrfRequestId",
    chainId: CHAIN_ID,
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
  } = useWriteContract();

  const wait = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: CHAIN_ID,
  });

  const guard = React.useCallback(() => {
    if (!isConnected) throw new Error("Wallet not connected");
    if (chainId !== CHAIN_ID) throw new Error("Wrong chain");
  }, [isConnected, chainId]);

  const enter = React.useCallback(() => {
    guard();
    writeContract({
      abi: RAFFLE_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "enter",
      chainId: CHAIN_ID,
    });
  }, [guard, writeContract]);

  const claim = React.useCallback(() => {
    guard();
    writeContract({
      abi: RAFFLE_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "claim",
      chainId: CHAIN_ID,
    });
  }, [guard, writeContract]);

  // ---- Refetch on tx success ----
  const refetchAll = React.useCallback(() => {
    phaseQuery.refetch();
    entrantQuery.refetch();
    winnerQuery.refetch();
    entrantsCountQuery.refetch();
    winnersQuery.refetch();
    winnersTargetQuery.refetch();
    randomSeedQuery.refetch();
    vrfRequestIdQuery.refetch();
  }, [
    phaseQuery,
    entrantQuery,
    winnerQuery,
    entrantsCountQuery,
    winnersQuery,
    winnersTargetQuery,
    randomSeedQuery,
    vrfRequestIdQuery,
  ]);

  React.useEffect(() => {
    if (wait.isSuccess) refetchAll();
  }, [wait.isSuccess, refetchAll]);

  // ---- Derived UI state ----
  const phaseNum = Number(phaseQuery.data ?? Phase.Enter) as Phase;
  const alreadyEntered = Boolean(entrantQuery.data);
  const isWinner = Boolean(winnerQuery.data);
  const entrantsCount = Number(entrantsCountQuery.data ?? 0);
  const winners = (winnersQuery.data as `0x${string}`[] | undefined) ?? [];
  const winnersTarget = Number(winnersTargetQuery.data ?? 0);
  const randomSeed = randomSeedQuery.data as bigint | undefined;
  const vrfRequestId = vrfRequestIdQuery.data as bigint | undefined;

  const loading =
    phaseQuery.isLoading ||
    entrantQuery.isLoading ||
    winnerQuery.isLoading ||
    entrantsCountQuery.isLoading ||
    winnersQuery.isLoading ||
    winnersTargetQuery.isLoading ||
    randomSeedQuery.isLoading ||
    vrfRequestIdQuery.isLoading ||
    isWriting ||
    wait.isLoading;

  return {
    // connection
    address,
    isConnected,
    chainId,

    // reads
    phase: phaseNum,
    alreadyEntered,
    isWinner,
    entrantsCount,
    winners,
    winnersTarget,
    randomSeed,
    vrfRequestId,

    // refetch
    refetchAll,

    // writes
    enter,
    claim,

    // tx
    txHash,
    txPending: isWriting || wait.isLoading,
    txSuccess: wait.isSuccess,

    // ui
    loading,
    canEnter: phaseNum === Phase.Enter && !alreadyEntered,
    canClaim: phaseNum === Phase.Drawn && isWinner,
  };
}
