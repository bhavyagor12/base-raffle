"use client";
import "@coinbase/onchainkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { MiniAppProvider } from "@neynar/react";
import { config } from "@/utils/config";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "viem/chains";

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            paymaster: process.env.NEXT_PUBLIC_ONCHAINKIT_PAYMASTER_URL,
          }}
        >
          <MiniAppProvider>{children}</MiniAppProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
