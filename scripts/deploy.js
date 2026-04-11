const fs = require("node:fs");
const path = require("node:path");
const { ethers, network } = require("hardhat");

const LOCAL_CHAIN_IDS = new Set([31337, 1337]);
const DEFAULT_SEPOLIA_AGGREGATOR = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

function isLocalNetwork(networkName, chainId) {
  return networkName === "localhost" || networkName === "hardhat" || LOCAL_CHAIN_IDS.has(Number(chainId));
}

function saveLocalDeployment(payload) {
  const targetPath = path.join(__dirname, "..", "frontend", "local-contracts.json");
  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log("Saved local contract addresses for the frontend:", targetPath);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const currentNetwork = await ethers.provider.getNetwork();
  const localMode = isLocalNetwork(network.name, currentNetwork.chainId);

  const initialSupply = ethers.parseUnits("1000000", 18);
  const initialRewardPool = ethers.parseUnits(process.env.INITIAL_REWARD_POOL || "100000", 18);
  let aggregatorAddress = process.env.CHAINLINK_AGGREGATOR || DEFAULT_SEPOLIA_AGGREGATOR;

  console.log("Deploying with account:", deployer.address);
  console.log("Network:", network.name, `(${currentNetwork.chainId})`);

  if (localMode) {
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const mockAggregator = await MockV3Aggregator.deploy(8, 2000n * 10n ** 8n);
    await mockAggregator.waitForDeployment();
    aggregatorAddress = await mockAggregator.getAddress();
    console.log("Using local mock ETH/USD aggregator:", aggregatorAddress);
  } else {
    console.log("Using ETH/USD aggregator:", aggregatorAddress);
  }

  const EduToken = await ethers.getContractFactory("EduToken");
  const eduToken = await EduToken.deploy(initialSupply);
  await eduToken.waitForDeployment();

  const EduBadgeNFT = await ethers.getContractFactory("EduBadgeNFT");
  const eduBadgeNFT = await EduBadgeNFT.deploy();
  await eduBadgeNFT.waitForDeployment();

  const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
  const priceConsumer = await PriceConsumer.deploy(aggregatorAddress);
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

  if (localMode) {
    saveLocalDeployment({
      network: {
        name: network.name,
        chainId: Number(currentNetwork.chainId),
      },
      contracts: {
        token: await eduToken.getAddress(),
        nft: await eduBadgeNFT.getAddress(),
        staking: await staking.getAddress(),
        dao: await simpleDAO.getAddress(),
        priceConsumer: await priceConsumer.getAddress(),
      },
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
