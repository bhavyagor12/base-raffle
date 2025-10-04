"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestDraw } from "@/lib/admin";
import { useMiniApp } from "@neynar/react";
import { useRaffle } from "@/hooks/useRaffle";
import { ADMIN_FIDS, Phase } from "@/lib/contract";

export function AdminBar() {
  const { isSDKLoaded, context } = useMiniApp();
  const [loading, setLoading] = useState(false);
  const [winnersCount, setWinnersCount] = useState("");
  const [declaredLocal, setDeclaredLocal] = useState(false);

  const {
    entrantsCount,
    loading: raffleLoading,
    winners,
    phase, // assume Phase enum from your hook
  } = useRaffle();

  // On-chain or local-declared states that should disable the button.
  const winnersDeclared = useMemo(() => {
    const onchainDeclared =
      phase === Phase.DrawRequested ||
      phase === Phase.Drawn ||
      (winners?.length ?? 0) > 0;
    return onchainDeclared || declaredLocal;
  }, [phase, winners, declaredLocal]);

  if (!isSDKLoaded || !context) return null;
  const { user } = context;
  if (!ADMIN_FIDS.includes(user.fid)) return null;

  const handleRequestDraw = async () => {
    const count = parseInt(winnersCount, 10);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid winners count.");
      return;
    }

    try {
      setLoading(true);
      const receipt = await requestDraw({
        winnersCount: count,
        is_testnet: false,
      });
      console.log("Draw requested. Tx receipt:", receipt);
      // Optimistic UI: immediately mark as declared and lock UI.
      setDeclaredLocal(true);
      // Optional: clear input
      // setWinnersCount("");
    } catch (err) {
      console.error("Failed to request draw:", err);
    } finally {
      setLoading(false);
    }
  };

  const winnersLen = winners?.length ?? 0;

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm text-muted-foreground">
        {winnersDeclared ? (
          <>Winners declared: {winnersLen > 0 ? winnersLen : "pending..."}</>
        ) : (
          <>Current entrants: {raffleLoading ? "Loading..." : entrantsCount}</>
        )}
      </div>

      <Input
        type="number"
        placeholder="Number of winners"
        value={winnersCount}
        onChange={(e) => setWinnersCount(e.target.value)}
        min={1}
        disabled={winnersDeclared || loading || raffleLoading}
      />

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleRequestDraw}
        disabled={winnersDeclared || loading || raffleLoading}
      >
        {winnersDeclared
          ? "Results Declared"
          : loading
            ? "Declaring..."
            : "Declare Results"}
      </Button>
    </div>
  );
}
