"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Spinner } from "@/components/spinner";

const shortAddr = (a?: `0x${string}`) =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

export function WalletSection() {
  const { isConnected, address } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {!isConnected ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Connect your wallet on Base Sepolia to enter.
            </p>
            <Button
              onClick={() => connect({ connector: connectors[0] })}
              disabled={isPending}
            >
              {isPending ? <Spinner label="Connecting" /> : "Connect Wallet"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Connected</p>
              <div className="text-sm font-medium">{shortAddr(address)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
