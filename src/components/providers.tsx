"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { MiniAppProvider } from "@neynar/react";
import { config } from "@/utils/config";

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider>{children}</MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
