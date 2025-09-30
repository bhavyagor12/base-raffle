"use client";
import { cn } from "@/lib/utils";
export function Callout({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "success" | "neutral" | "warn";
  title: string;
  children?: React.ReactNode;
}) {
  const toneCls =
    tone === "success"
      ? "border-emerald-600/30 bg-emerald-600/5"
      : tone === "warn"
        ? "border-amber-600/30 bg-amber-600/5"
        : "border-muted bg-muted/30";
  return (
    <div className={cn("rounded-xl border p-3 text-sm", toneCls)}>
      <div className="font-semibold mb-1">{title}</div>
      <div className="">{children}</div>
    </div>
  );
}
