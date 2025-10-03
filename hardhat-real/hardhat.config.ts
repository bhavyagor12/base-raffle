import type { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
dotenv.config();
const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    base: {
      type: "http",
      url: "https://mainnet.base.org",
      accounts: [configVariable("BASE_PRIVATE_KEY")],
      chainId: 8453,
    },
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: [
        configVariable("BASE_SEPOLIA_PRIVATE_KEY"),
        configVariable("BASE_SEPOLIA_PRIVATE_KEY_2"),
        configVariable("BASE_SEPOLIA_PRIVATE_KEY_3"),
      ],
      chainId: 84532,
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
};

export default config;
