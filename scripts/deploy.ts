import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of LandChain contracts...");

  // 1. Deploy LandRegistry
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();
  const landRegistryAddress = await landRegistry.getAddress();
  console.log(`LandRegistry deployed successfully to: ${landRegistryAddress}`);

  // 2. Deploy PropertyTransfer passing LandRegistry address
  const PropertyTransfer = await ethers.getContractFactory("PropertyTransfer");
  const propertyTransfer = await PropertyTransfer.deploy(landRegistryAddress);
  await propertyTransfer.waitForDeployment();
  const propertyTransferAddress = await propertyTransfer.getAddress();
  console.log(`PropertyTransfer deployed successfully to: ${propertyTransferAddress}`);

  console.log("\nDeployment finished!");
  console.log(`Contract Addresses config:`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${landRegistryAddress}`);
  console.log(`NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS=${propertyTransferAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
