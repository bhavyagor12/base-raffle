"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phase, CHAIN_ID } from "@/lib/contract";
import { Callout } from "@/components/callout";
import { Spinner } from "@/components/spinner";
import { useRaffle } from "@/hooks/useRaffle";

export function RaffleStatusCard() {
  const {
    isConnected,
    chainId,
    phase,
    alreadyEntered,
    isWinner,
    enter,
    loading,
    txPending,
  } = useRaffle();

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Giveaway</h2>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label="Checking raffle status…" />
          </div>
        )}

        {!isConnected && !loading && (
          <p className="text-sm text-muted-foreground">
            Please connect your wallet first.
          </p>
        )}

        {isConnected && chainId && chainId !== CHAIN_ID && (
          <p className="text-xs text-amber-600">
            You’re on chain {chainId}. Please switch to Base Sepolia ({CHAIN_ID}
            ).
          </p>
        )}

        {isConnected && !loading && chainId === CHAIN_ID && (
          <div className="space-y-3">
            {phase === Phase.Enter &&
              (alreadyEntered ? (
                <p className="text-sm">
                  You’ve entered. Results will be announced soon.
                </p>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => enter([])}
                  disabled={txPending}
                >
                  {txPending ? (
                    <Spinner label="Submitting" />
                  ) : (
                    "Enter Giveaway"
                  )}
                </Button>
              ))}

            {phase === Phase.DrawRequested &&
              (alreadyEntered ? (
                <p className="text-sm">
                  You’ve entered. Results will be announced soon.
                </p>
              ) : (
                <p className="text-sm">Entries closed.</p>
              ))}

            {phase === Phase.Drawn &&
              (isWinner ? (
                <Callout tone="success" title="Congrats!">
                  Your address was selected. Check claim instructions in the
                  app.
                </Callout>
              ) : (
                <Callout tone="neutral" title="Better luck next time">
                  The raffle has ended and this address was not selected.
                </Callout>
              ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Powered by Base Sepolia · Fair draw on-chain
        </p>
      </CardContent>
    </Card>
  );
}
