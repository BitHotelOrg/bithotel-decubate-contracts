// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const { time } = require('@openzeppelin/test-helpers');

// eslint-disable-next-line space-before-function-paren
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const name = 'Kick';
  const symbol = 'KICK';
  const totalSupply = '5000000000000000000000000000';
  const now = new Date().valueOf();
  const blockSellUntil = (await time.latest()).add(time.duration.days(3));
  const Bithotel = await hre.ethers.getContractFactory('getKicks');

  const token = await Bithotel.deploy(
    name,
    symbol,
    totalSupply,
    totalSupply,
    now,
    blockSellUntil.toString(),
    "0x34D8fA861A245219c244681dEB98db83986A0994"
  );

  console.log(
    '----Arguments-----' +
    ' time = ' + now +
    ' startTime = ' + (86400 * 1000) +
    ' blockSellUntil =' + blockSellUntil.toString(),
  );

  await token.deployed();

  console.log('Bithotel deployed to:', token.address);

  // console.log('-------WHITELISTING--------');
  // await token.whiteList('0xA140a478aE50b3E769E83608631a14ABdC7c5648', true);
  // await token.whiteList('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe', true);

  // if (hre.network.name !== 'binance') {
  //   await token.whiteList('0x10ED43C718714eb63d5aA57B78B54704E256024E', true);
  // } else if (hre.network.name !== 'binanceTesnet') {
  //   await token.whiteList('0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3', true);
  // }

  // eslint-disable-next-line max-len
  // console.log('0xA140a478aE50b3E769E83608631a14ABdC7c5648 whitelisted = ' + await token.isWhiteListed('0xA140a478aE50b3E769E83608631a14ABdC7c5648'));
  // // eslint-disable-next-line max-len
  // console.log('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe whitelisted = ' + await token.isWhiteListed('0x56ee5295014367e0308e00ae69dfd00e7c5fccbe'));

  // const BithotelPair = await hre.ethers.getContractFactory('BithotelPair');
  // const pair = await BithotelPair.deploy();
  // await pair.deployed();

  // console.log('BithotelPair deployed to:', pair.address);
  // const pairAddress = await pair.pairAddress();
  // console.log('PairAddress = ' + pairAddress);

  // console.log('-------SET PAIR ADDRESS--------');
  // await token.setPairAddress(pairAddress);

  if (hre.network.name !== 'hardhat') {
    await hre.run('verify:verify', {
      address: token.address,
      constructorArguments: [
        name,
        symbol,
        totalSupply,
        totalSupply,
        now,
        blockSellUntil.toString(),
        "0x34D8fA861A245219c244681dEB98db83986A0994"
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
