"use client";
import * as React from "react";
import Image from "next/image";
import { AvatarBanner } from "@/components/avatar";
import { CTASection } from "@/components/cta";
import { AdminBar } from "@/components/admin";

export default function Page() {
  return (
    <div className="min-h-screen h-dvh w-full bg-white text-black relative">
      <div className="flex flex-col h-full w-full justify-between">
        <div className="relative">
          <AvatarBanner />
          <div className="flex flex-col items-center justify-center text-center mt-14">
            <h1 className="text-[22px]">Welcome to</h1>
            <h1 className="text-[26px]">Based Around the World 🇮🇳</h1>
          </div>
        </div>

        <div className="flex flex-col justify-end px-4 pb-6 gap-3">
          <CTASection />
          <AdminBar />
        </div>
        <div className="flex items-center justify-center mb-4">
          <Image src="/base_blue.svg" alt="Background" width={60} height={60} />
        </div>
      </div>
    </div>
  );
}
