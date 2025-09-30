"use client";
import * as React from "react";

import Image from "next/image";
import { AvatarBanner } from "@/components/avatar";
import { WalletCTA } from "@/components/wallet-cta";
import { CTASection } from "@/components/cta";
import { AdminBar } from "@/components/admin";

export default function Page() {
  return (
    <div className="min-h-screen h-dvh w-full bg-[#2BA9E1] text-white relative">
      <div className="grid grid-rows-4 h-full">
        <div className="relative">
          <AvatarBanner />
        </div>

        <div className="row-span-2 flex flex-col items-center justify-center text-center px-6 gap-3">
          <div className="mb-2 border-primary border-8">
            <Image
              src="/base_white_logo.svg"
              width={56}
              height={56}
              alt="Base"
            />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Welcome to</h1>
            <Image
              src="/base_name_logo.svg"
              width={56}
              height={56}
              alt="Base"
            />
          </div>
          <p className="text-sm opacity-95">
            Here is your chance to win a giveaway
          </p>
        </div>

        <div className="flex flex-col justify-end px-4 pb-6 gap-3">
          <WalletCTA />
          <CTASection />

          <AdminBar />
        </div>
      </div>
    </div>
  );
}
