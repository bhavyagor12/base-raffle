"use client";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from "wagmi";
import { Spinner } from "@/components/spinner";

export function WalletCTA() {
  const { isConnected } = useAccount();
  const { connect, isPending, connectors } = useConnect();

  if (isConnected) return null;
  return (
    <Button
      className="w-full"
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
    >
      {isPending ? <Spinner label="Connecting" /> : "Connect Wallet"}
    </Button>
  );
}
