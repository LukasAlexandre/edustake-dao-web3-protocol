const { ethers } = require("hardhat");

async function main() {
  const nftAddress = process.env.NFT_ADDRESS || "0xYourEduBadgeNFTAddress";
  const recipient = process.env.NFT_RECIPIENT || "0xRecipientAddress";
  const tokenUri =
    process.env.NFT_TOKEN_URI || "https://example.com/metadata/edubadge-1.json";

  if (!ethers.isAddress(nftAddress) || !ethers.isAddress(recipient)) {
    throw new Error("Update NFT_ADDRESS and NFT_RECIPIENT before running this script.");
  }

  const nft = await ethers.getContractAt("EduBadgeNFT", nftAddress);
  const tx = await nft.mintBadge(recipient, tokenUri);
  const receipt = await tx.wait();

  console.log("NFT minted successfully.");
  console.log("Transaction hash:", receipt.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
