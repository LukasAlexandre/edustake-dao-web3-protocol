const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS || "0xYourEduTokenAddress";
  const stakingAddress = process.env.STAKING_ADDRESS || "0xYourStakingAddress";
  const amountToStake = process.env.STAKE_AMOUNT || "100";

  if (!ethers.isAddress(tokenAddress) || !ethers.isAddress(stakingAddress)) {
    throw new Error("Update TOKEN_ADDRESS and STAKING_ADDRESS before running this script.");
  }

  const token = await ethers.getContractAt("EduToken", tokenAddress);
  const staking = await ethers.getContractAt("Staking", stakingAddress);
  const amount = ethers.parseUnits(amountToStake, 18);

  const approveTx = await token.approve(stakingAddress, amount);
  await approveTx.wait();
  console.log("Approval confirmed.");

  const stakeTx = await staking.stake(amount);
  const receipt = await stakeTx.wait();

  console.log(`Staked ${amountToStake} EDU successfully.`);
  console.log("Transaction hash:", receipt.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
