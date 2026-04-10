const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("EduStake DAO Web3 Protocol", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const mockAggregator = await MockV3Aggregator.deploy(8, 2000n * 10n ** 8n);
    await mockAggregator.waitForDeployment();

    const EduToken = await ethers.getContractFactory("EduToken");
    const eduToken = await EduToken.deploy(ethers.parseUnits("1000000", 18));
    await eduToken.waitForDeployment();

    const EduBadgeNFT = await ethers.getContractFactory("EduBadgeNFT");
    const eduBadgeNFT = await EduBadgeNFT.deploy();
    await eduBadgeNFT.waitForDeployment();

    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    const priceConsumer = await PriceConsumer.deploy(await mockAggregator.getAddress());
    await priceConsumer.waitForDeployment();

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await eduToken.getAddress(), await priceConsumer.getAddress());
    await staking.waitForDeployment();

    const SimpleDAO = await ethers.getContractFactory("SimpleDAO");
    const simpleDAO = await SimpleDAO.deploy(await eduToken.getAddress());
    await simpleDAO.waitForDeployment();

    await eduToken.transfer(user1.address, ethers.parseUnits("1000", 18));
    await eduToken.transfer(user2.address, ethers.parseUnits("500", 18));

    const rewardPool = ethers.parseUnits("10000", 18);
    await eduToken.approve(await staking.getAddress(), rewardPool);
    await staking.fundRewards(rewardPool);

    return {
      owner,
      user1,
      user2,
      eduToken,
      eduBadgeNFT,
      priceConsumer,
      staking,
      simpleDAO,
      mockAggregator,
    };
  }

  it("deploys the token with correct name, symbol and initial supply", async function () {
    const { owner, eduToken } = await loadFixture(deployFixture);

    expect(await eduToken.name()).to.equal("EduToken");
    expect(await eduToken.symbol()).to.equal("EDU");
    expect(await eduToken.balanceOf(owner.address)).to.equal(ethers.parseUnits("988500", 18));
  });

  it("mints an NFT badge with token URI", async function () {
    const { user1, eduBadgeNFT } = await loadFixture(deployFixture);

    await eduBadgeNFT.mintBadge(user1.address, "ipfs://badge-1");

    expect(await eduBadgeNFT.ownerOf(1)).to.equal(user1.address);
    expect(await eduBadgeNFT.tokenURI(1)).to.equal("ipfs://badge-1");
  });

  it("executes a basic staking flow with rewards", async function () {
    const { user1, eduToken, staking } = await loadFixture(deployFixture);

    const initialBalance = await eduToken.balanceOf(user1.address);
    const stakeAmount = ethers.parseUnits("100", 18);

    await eduToken.connect(user1).approve(await staking.getAddress(), stakeAmount);
    await staking.connect(user1).stake(stakeAmount);

    expect(await staking.getStakedBalance(user1.address)).to.equal(stakeAmount);

    await time.increase(30 * 24 * 60 * 60);

    const pendingRewards = await staking.getPendingRewards(user1.address);
    expect(pendingRewards).to.be.gt(0);

    await staking.connect(user1).unstake(stakeAmount);

    const finalBalance = await eduToken.balanceOf(user1.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("creates a DAO proposal", async function () {
    const { user1, simpleDAO } = await loadFixture(deployFixture);

    await simpleDAO
      .connect(user1)
      .createProposal("Atualizar trilha", "Adicionar uma nova badge ao curso.", 3 * 24 * 60 * 60);

    const proposal = await simpleDAO.getProposal(1);
    expect(proposal.title).to.equal("Atualizar trilha");
    expect(proposal.proposer).to.equal(user1.address);
  });

  it("registers a DAO vote based on token balance", async function () {
    const { user1, user2, simpleDAO, eduToken } = await loadFixture(deployFixture);

    await simpleDAO
      .connect(user1)
      .createProposal("Bolsa de incentivo", "Distribuir EDU para participantes ativos.", 3 * 24 * 60 * 60);

    await simpleDAO.connect(user2).vote(1, true);

    const proposal = await simpleDAO.getProposal(1);
    expect(proposal.yesVotes).to.equal(await eduToken.balanceOf(user2.address));
    expect(await simpleDAO.hasVoted(1, user2.address)).to.equal(true);
  });
});
