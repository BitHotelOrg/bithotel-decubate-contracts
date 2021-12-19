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
  const name = 'Bithotel.io';
  const symbol = 'BMT';
  const now = new Date().valueOf();
  // const tradingTime = ;
  // const blockSellTime = ;
  const Bithotel = await hre.ethers.getContractFactory('Bithotel');
  const token = await Bithotel.deploy(
    name,
    symbol,
    '1000000000000000000000000',
    now,
    now + 1,
    now + 2,
  );

  console.log(
    '----Arguments-----' +
    ' time= ' + now,
  );

  await token.deployed();

  console.log('Bithotel deployed to:', token.address);

  if (hre.network.name !== 'hardhat') {
    await hre.run('verify:verify', {
      address: token.address,
      constructorArguments: [
        name,
        symbol,
        now,
        now + 1,
        now + 2,
      ],
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
