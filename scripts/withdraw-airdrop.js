const hre = require('hardhat');

async function main () {
  const [deployer] = await hre.ethers.getSigners();
  const Airdrop = await hre.ethers.getContractFactory('Airdrop');
  const airdrop = Airdrop.attach('0x3F8c10E5e5A67422A6D9e64dDE1185e1bABfC48B');
  const result = await airdrop.withdrawTokens('0x0A0cfF108658bFeC76284b71C192244BA47E9C2F',{ from: deployer.address });
  console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
    process.exit(1);
  });