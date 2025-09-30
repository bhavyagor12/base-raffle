"use client";
import { Button } from "@/components/ui/button";
import { ADMIN_ADDRESS } from "@/lib/contract";
import { useAccount } from "wagmi";

export function AdminBar() {
  const { address } = useAccount();
  if (!address || address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
    return null;
  return (
    <div className="mt-4">
      <Button variant="secondary" className="w-full">
        Declare Results
      </Button>
    </div>
  );
}
