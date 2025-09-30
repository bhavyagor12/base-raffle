import { config as dotenv } from "dotenv";
dotenv();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";

const { PRIVATE_KEY, BASE_SEPOLIA_RPC } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      chainId: 84532,
      url: BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
export default config;
