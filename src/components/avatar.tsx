"use client";
import { useMiniApp } from "@neynar/react";

export function AvatarBanner() {
  const { isSDKLoaded, context } = useMiniApp();

  if (!isSDKLoaded || !context) {
    return null;
  }

  const { user } = context;
  return (
    <div className="absolute right-4 top-4 flex items-center gap-2">
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={user.pfpUrl}
        alt={user.displayName ?? "pfp"}
        className="h-8 w-8 rounded-full object-cover"
      />
      <span className="text-sm font-medium">
        {user.displayName ?? user.username ?? `FID ${user.fid}`}
      </span>
    </div>
  );
}
