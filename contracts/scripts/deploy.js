const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Sepolia USDT address — replace with actual testnet token if needed
  const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";

  // --- Deploy AgentRegistry ---
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("AgentRegistry deployed to:", registryAddr);

  // --- Deploy TipSplitter ---
  const TipSplitter = await hre.ethers.getContractFactory("TipSplitter");
  const splitter = await TipSplitter.deploy(USDT_ADDRESS, deployer.address);
  await splitter.waitForDeployment();
  const splitterAddr = await splitter.getAddress();
  console.log("TipSplitter deployed to:", splitterAddr);

  // --- Deploy AgentEscrow ---
  const AgentEscrow = await hre.ethers.getContractFactory("AgentEscrow");
  const escrow = await AgentEscrow.deploy(USDT_ADDRESS, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("AgentEscrow deployed to:", escrowAddr);

  // --- Summary ---
  console.log("\n=== Deployment Summary ===");
  console.log("Network:        ", hre.network.name);
  console.log("USDT token:     ", USDT_ADDRESS);
  console.log("AgentRegistry:  ", registryAddr);
  console.log("TipSplitter:    ", splitterAddr);
  console.log("AgentEscrow:    ", escrowAddr);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
