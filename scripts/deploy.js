const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const initialSupply = ethers.parseUnits("1000000", 18);
  const initialRewardPool = ethers.parseUnits(process.env.INITIAL_REWARD_POOL || "100000", 18);
  const sepoliaEthUsdAggregator =
    process.env.CHAINLINK_AGGREGATOR || "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  console.log("Deploying with account:", deployer.address);
  console.log("Using ETH/USD aggregator:", sepoliaEthUsdAggregator);

  const EduToken = await ethers.getContractFactory("EduToken");
  const eduToken = await EduToken.deploy(initialSupply);
  await eduToken.waitForDeployment();

  const EduBadgeNFT = await ethers.getContractFactory("EduBadgeNFT");
  const eduBadgeNFT = await EduBadgeNFT.deploy();
  await eduBadgeNFT.waitForDeployment();

  const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
  const priceConsumer = await PriceConsumer.deploy(sepoliaEthUsdAggregator);
  await priceConsumer.waitForDeployment();

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await eduToken.getAddress(), await priceConsumer.getAddress());
  await staking.waitForDeployment();

  const SimpleDAO = await ethers.getContractFactory("SimpleDAO");
  const simpleDAO = await SimpleDAO.deploy(await eduToken.getAddress());
  await simpleDAO.waitForDeployment();

  // Funding the reward pool keeps the staking flow usable immediately after deployment.
  const approveTx = await eduToken.approve(await staking.getAddress(), initialRewardPool);
  await approveTx.wait();

  const fundTx = await staking.fundRewards(initialRewardPool);
  await fundTx.wait();

  console.log("\nContracts deployed successfully:");
  console.log("EduToken:      ", await eduToken.getAddress());
  console.log("EduBadgeNFT:   ", await eduBadgeNFT.getAddress());
  console.log("PriceConsumer: ", await priceConsumer.getAddress());
  console.log("Staking:       ", await staking.getAddress());
  console.log("SimpleDAO:     ", await simpleDAO.getAddress());
  console.log("Reward reserve:", ethers.formatUnits(initialRewardPool, 18), "EDU");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
