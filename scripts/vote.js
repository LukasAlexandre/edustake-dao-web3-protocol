const { ethers } = require("hardhat");

async function main() {
  const daoAddress = process.env.DAO_ADDRESS || "0xYourSimpleDAOAddress";
  const action = process.env.DAO_ACTION || "create";

  if (!ethers.isAddress(daoAddress)) {
    throw new Error("Update DAO_ADDRESS before running this script.");
  }

  const dao = await ethers.getContractAt("SimpleDAO", daoAddress);

  if (action === "create") {
    const title = process.env.PROPOSAL_TITLE || "Nova badge para finalistas";
    const description =
      process.env.PROPOSAL_DESCRIPTION ||
      "Proposta academica para emitir uma nova badge de conclusao.";
    const duration = Number(process.env.PROPOSAL_DURATION || "86400");

    const tx = await dao.createProposal(title, description, duration);
    const receipt = await tx.wait();

    console.log("Proposal created successfully.");
    console.log("Transaction hash:", receipt.hash);
    return;
  }

  const proposalId = Number(process.env.PROPOSAL_ID || "1");
  const support = (process.env.VOTE_SUPPORT || "true").toLowerCase() === "true";

  const tx = await dao.vote(proposalId, support);
  const receipt = await tx.wait();

  console.log(`Vote registered on proposal ${proposalId}.`);
  console.log("Transaction hash:", receipt.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
