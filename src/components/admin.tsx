"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestDraw } from "@/lib/admin";
import { useMiniApp } from "@neynar/react";
import { useRaffle } from "@/hooks/useRaffle";
import { ADMIN_FIDS } from "@/lib/contract";

export function AdminBar() {
  const { isSDKLoaded, context } = useMiniApp();
  const [loading, setLoading] = useState(false);
  const [winnersCount, setWinnersCount] = useState("");

  const { entrantsCount, loading: raffleLoading } = useRaffle();

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
    } catch (err) {
      console.error("Failed to request draw:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm text-muted-foreground">
        Current entrants: {raffleLoading ? "Loading..." : entrantsCount}
      </div>

      <Input
        type="number"
        placeholder="Number of winners"
        value={winnersCount}
        onChange={(e) => setWinnersCount(e.target.value)}
        min={1}
      />

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleRequestDraw}
        disabled={loading || raffleLoading}
      >
        {loading ? "Declaring..." : "Declare Results"}
      </Button>
    </div>
  );
}
