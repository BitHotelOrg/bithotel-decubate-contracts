const hre = require("hardhat");

// MAINNET
const TOKEN_ADDRESS = "0x57Bc18F6177cDafFb34aCE048745bc913a1B1b54";

// TESTNET
// const TOKEN_ADDRESS = "0x3c268E859abE250016646BE0de15e7aa88ED7666";

// eslint-disable-next-line space-before-function-paren
async function main() {
  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(TOKEN_ADDRESS);
  await airdrop.deployed();

  console.log("Airdrop Bithotel deployed to:", airdrop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
