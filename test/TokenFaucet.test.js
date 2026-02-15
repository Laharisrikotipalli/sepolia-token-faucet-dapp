const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Token & Faucet Integration", function () {

  let token, faucet;
  let owner, user1, user2;

  beforeEach(async function () {

    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    await token.setFaucet(await faucet.getAddress());
  });

  it("Should deploy contracts correctly", async function () {
    expect(await token.name()).to.equal("Partnr Token");
    expect(await token.symbol()).to.equal("PRT");
    expect(await faucet.admin()).to.equal(owner.address);
  });

  it("Should allow user to claim tokens", async function () {
    await faucet.connect(user1).requestTokens();
    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(ethers.parseEther("100"));
  });

  it("Should enforce 24-hour cooldown", async function () {
    await faucet.connect(user1).requestTokens();
    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cannot claim yet");
  });

  it("Should allow claim after cooldown period", async function () {
    await faucet.connect(user1).requestTokens();
    await network.provider.send("evm_increaseTime", [86400]);
    await network.provider.send("evm_mine");
    await faucet.connect(user1).requestTokens();
    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(ethers.parseEther("200"));
  });

  it("Should enforce lifetime claim limit", async function () {

    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await network.provider.send("evm_increaseTime", [86400]);
      await network.provider.send("evm_mine");
    }

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime limit reached");
  });

  it("Should pause faucet", async function () {
    await faucet.setPaused(true);
    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  it("Only admin can pause", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Only admin");
  });

  it("Should emit TokensClaimed event", async function () {
    await expect(
      faucet.connect(user1).requestTokens()
    ).to.emit(faucet, "TokensClaimed");
  });

  it("Should track users independently", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    const balance1 = await token.balanceOf(user1.address);
    const balance2 = await token.balanceOf(user2.address);

    expect(balance1).to.equal(ethers.parseEther("100"));
    expect(balance2).to.equal(ethers.parseEther("100"));
  });

});
