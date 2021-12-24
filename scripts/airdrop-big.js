const hre = require('hardhat');
const assert = require('assert');
const data = require('./bithotel_airdrop_wei.json');

const addresses = data.wallet;
const amounts = data.amount;
const chunkSize = 100;

async function main () {
  const [deployer] = await hre.ethers.getSigners();
  const Airdrop = await hre.ethers.getContractFactory('Airdrop');
  const airdrop = Airdrop.attach('0xD6781788FEcc15A38c3eCd5Fb6C29F5e9EA946D6');
  console.log(addresses.length);
  console.log(amounts.length);
  // eslint-disable-next-line eqeqeq
  assert(addresses.length == amounts.length);
  const numTotal = addresses.length;
  const numChunks = Math.ceil(numTotal / chunkSize);
  const errorAddresses = [];
  for (let i = 0; i < numChunks; i++) {
    const addressesChunk = addresses.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    const amountsChunk = amounts.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    try {
      const result = await airdrop.dropTokens(addressesChunk, amountsChunk, { from: deployer.address });
      console.log('aj : ***** result => ', result);
    } catch (e) {
      errorAddresses.concat(errorAddresses);
      console.error(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
    process.exit(1);
  });