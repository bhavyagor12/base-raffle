"use client";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from "wagmi";
import { Spinner } from "@/components/spinner";
import { useMiniApp } from "@neynar/react";
import { ADMIN_FIDS } from "@/lib/contract";

export function WalletCTA() {
  const { isConnected } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { isSDKLoaded, context } = useMiniApp();

  if (!isSDKLoaded || !context) return null;

  const { user } = context;

  if (!user) return null;

  if (ADMIN_FIDS.includes(user.fid)) return null; // dont allow admin

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
