import { useRaffle } from "@/hooks/useRaffle";
import { Spinner } from "./spinner";
import { ADMIN_FIDS, Phase } from "@/lib/contract";
import { Button } from "./ui/button";
import { useMiniApp } from "@neynar/react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { WalletCTA } from "./wallet-cta";

export function CTASection() {
  const { isSDKLoaded, context } = useMiniApp();
  const {
    isConnected,
    phase,
    alreadyEntered,
    isWinner,
    enter,
    loading,
    txPending,
  } = useRaffle();

  if (!isSDKLoaded || !context) return null;

  const { user } = context;

  if (!user) return null;

  if (ADMIN_FIDS.includes(user.fid)) return null;

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );

  if (!isConnected) {
    return (
      <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
        <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
          <Image
            src="/mystery.svg"
            alt="Mystery Box"
            width={200}
            height={200}
          />
          <div className="text-white mt-4">
            <p className="text-[20px] leading-tight opacity-90">
              Connect your wallet to
            </p>
            <p className="text-[20px] font-semibold leading-snug mt-2">
              participate in the Giveaway.
            </p>
          </div>
          <WalletCTA />
        </CardContent>
      </Card>
    );
  }
  if (phase === Phase.Enter) {
    if (alreadyEntered)
      return (
        <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
          <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
            <Image src="/tick.svg" alt="Tick" width={200} height={200} />
            <div className="text-white mt-4">
              <p className="text-[20px] leading-tight opacity-90">Good luck!</p>
              <p className="text-[20px] font-semibold leading-snug mt-2">
                You have entered the giveaway.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    return (
      <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
        <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
          <Image
            src="/mystery.svg"
            alt="Mystery Box"
            width={220}
            height={220}
          />
          <div className="text-white mt-4">
            <p className="text-[20px] leading-tight opacity-90">
              Here is your chance to
            </p>
            <p className="text-[20px] font-semibold leading-snug">
              win the <span className="font-bold">Give Away.</span>
            </p>
          </div>
          <Button
            className="w-[80%] bg-white text-base-blue mt-8 hover:bg-white"
            onClick={() => enter()}
            disabled={txPending}
          >
            {txPending ? <Spinner label="Submitting" /> : "Enter the Giveaway"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === Phase.DrawRequested) {
    return (
      <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
        <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
          <Image src="/time.svg" alt="Time" width={160} height={160} />
          <div className="text-white mt-4">
            <p className="text-[20px] leading-tight opacity-90">Stay tuned!</p>
            <p className="text-[20px] font-semibold leading-snug mt-2">
              Results will be out soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return isWinner ? (
    <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
      <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
        <Image src="/crown.svg" alt="Crown" width={200} height={200} />
        <div className="text-white mt-4">
          <p className="text-[20px] leading-tight opacity-90">
            Congratulations!
          </p>
          <p className="text-[20px] font-semibold leading-snug mt-2">
            You won, go claim your prize.
          </p>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="relative w-[100%] rounded-2xl border-0 shadow-lg overflow-hidden bg-base-blue">
      <CardContent className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
        <Image src="/game.svg" alt="Game" width={160} height={160} />
        <div className="text-white mt-4">
          <p className="text-[24px] leading-tight opacity-90">
            Better luck next time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
