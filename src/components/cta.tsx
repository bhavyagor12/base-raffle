import { useRaffle } from "@/hooks/useRaffle";
import { useAccount } from "wagmi";
import { Spinner } from "./spinner";
import { CHAIN_ID, Phase } from "@/lib/contract";
import { Button } from "./ui/button";
import { Callout } from "./callout";

export function CTASection() {
  const { chainId } = useAccount();
  const {
    isConnected,
    // phase,
    alreadyEntered,
    // isWinner,
    enter,
    loading,
    txPending,
  } = useRaffle();

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );

  if (!isConnected) {
    return null;
  }

  if (chainId && chainId !== CHAIN_ID) {
    return (
      <p className="text-center text-xs text-amber-600">
        Switch to Base Sepolia ({CHAIN_ID}).
      </p>
    );
  }
  let isWinner = false;
  let phase = Phase.Drawn;

  if (phase === Phase.Enter) {
    if (alreadyEntered)
      return (
        <p className="text-center text-sm">Wait for the exciting results</p>
      );
    return (
      <Button className="w-full" onClick={() => enter([])} disabled={txPending}>
        {txPending ? <Spinner label="Submitting" /> : "Enter the Giveaway"}
      </Button>
    );
  }

  if (phase === Phase.DrawRequested) {
    return (
      <p className="flex flex-col text-center text-lg">
        Results will be shown soon!
        <span> Till then Stay Based!</span>
      </p>
    );
  }

  return isWinner ? (
    <Callout tone="success" title="Congrats!">
      You won. 🎉 Go claim your prize!
    </Callout>
  ) : (
    <Callout tone="neutral" title="Better luck next time">
      Results are out. Looks like you didn’t win this time.
    </Callout>
  );
}
