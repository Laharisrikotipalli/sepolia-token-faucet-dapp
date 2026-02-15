const { ethers } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("Token deployed at:", tokenAddress);

  const Faucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();

  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed at:", faucetAddress);

  await token.setFaucet(faucetAddress);

  console.log("Faucet set as official minter");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
