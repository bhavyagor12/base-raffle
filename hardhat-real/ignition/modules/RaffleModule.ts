import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RaffleModule", (m) => {
  const wrapper = m.getParameter<string>(
    "vrfWrapper",
    "0xb0407dbe851f8318bd31404A49e658143C982F23"
  );
  const raffle = m.contract("Raffle50", [wrapper]);

  return { raffle };
});
