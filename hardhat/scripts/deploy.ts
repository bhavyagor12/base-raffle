import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const VRF_COORDINATOR = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"; // Base Sepolia
  const Raffle = await ethers.getContractFactory("Raffle50");
  const raffle = await Raffle.deploy(VRF_COORDINATOR);
  await raffle.waitForDeployment();

  console.log("Raffle deployed to:", await raffle.getAddress());
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
