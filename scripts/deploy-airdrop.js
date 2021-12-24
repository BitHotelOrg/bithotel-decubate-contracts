// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

// eslint-disable-next-line space-before-function-paren
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Airdrop = await hre.ethers.getContractFactory('Airdrop');
  const airdrop = await Airdrop.deploy('0x83E3B33A69386dEB0DC9f860B480C79F1d8E3d8C');
  await airdrop.deployed();

  console.log('Airdrop Bithotel deployed to:', airdrop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
