import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RaffleModule", (m) => {
  const wrapper = m.getParameter<string>(
    "vrfWrapper",
    "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed"
  );
  const raffle = m.contract("Raffle50", [wrapper]);

  return { raffle };
});
