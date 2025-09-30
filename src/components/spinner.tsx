"use client";
import { Loader2 } from "lucide-react";
export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label ?? "Loading"}
    </span>
  );
}
