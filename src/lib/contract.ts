import { parseAbi } from "viem";

export const CHAIN_ID = 84532; // Base Sepolia
export const CONTRACT_ADDRESS = "0xYourRaffleAddressOnBaseSepolia" as const; // TODO
export const ADMIN_ADDRESS = "0xAdminAddress" as const; // TODO: your admin wallet address

export const RAFFLE_ABI = parseAbi([
  "function phase() view returns (uint8)",
  "function isEntrant(address a) view returns (bool)",
  "function isWinner(address a) view returns (bool)",
  "function enter(bytes32[] proof)",
]);

export enum Phase {
  Enter = 0,
  DrawRequested = 1,
  Drawn = 2,
}
