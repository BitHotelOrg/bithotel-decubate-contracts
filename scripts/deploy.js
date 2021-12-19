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
  const toBN = web3.utils.toBN;

  const name = 'Bit Hotel Token';
  const symbol = 'BTH';
  const totalSupply = '1000000000000000000000000000';
  const now = new Date().valueOf();
  const nowBN = toBN(now);
  const blockSellUntil = nowBN.add(toBN(96400 * 1000));
  const Bithotel = await hre.ethers.getContractFactory('Bithotel');
  const token = await Bithotel.deploy(
    name,
    symbol,
    totalSupply,
    now,
    (86400 * 1000),
    blockSellUntil.toString(),
  );

  console.log(
    '----Arguments-----' +
    ' time= ' + now,
  );

  await token.deployed();

  console.log('Bithotel deployed to:', token.address);

  console.log('-------WHITELISTING--------');
  await token.whiteList('0xA140a478aE50b3E769E83608631a14ABdC7c5648', true);
  await token.whiteList('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe', true);

  // eslint-disable-next-line max-len
  console.log('0xA140a478aE50b3E769E83608631a14ABdC7c5648 whitelisted = ' + await token.isWhiteListed('0xA140a478aE50b3E769E83608631a14ABdC7c5648'));
  // eslint-disable-next-line max-len
  console.log('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe whitelisted = ' + await token.isWhiteListed('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe'));

  if (hre.network.name !== 'hardhat') {
    await hre.run('verify:verify', {
      address: token.address,
      constructorArguments: [
        name,
        symbol,
        totalSupply,
        now,
        (86400 * 1000),
        blockSellUntil.toString(),
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
