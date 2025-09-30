"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMiniApp } from "@neynar/react";

export function UserHeader() {
  const { isSDKLoaded, context } = useMiniApp();
  const { user } = context;

  if (!isSDKLoaded || !user) {
    return null;
  }
  return (
    <Card className="mt-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl md:text-2xl">Welcome to Base</CardTitle>
        <p className="text-sm text-muted-foreground">
          Raffle Giveaway (50 winners)
        </p>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={user.pfpUrl}
          alt={user.displayName ?? "pfp"}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-base font-medium">
            {user.displayName ?? `FID ${user.fid}`}
          </span>
          <span className="text-sm text-muted-foreground">
            @{user.username ?? user.fid}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
