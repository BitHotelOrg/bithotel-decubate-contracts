const hre = require('hardhat');
const assert = require('assert');
const data = require('./wallets_not_found.json');

const addresses = data.wallet;
const amounts = data.amount;
const chunkSize = 1;

async function main () {
  const [deployer] = await hre.ethers.getSigners();
  const Airdrop = await hre.ethers.getContractFactory('Airdrop');
  const airdrop = Airdrop.attach('0x3F8c10E5e5A67422A6D9e64dDE1185e1bABfC48B');
  console.log(addresses.length);
  console.log(amounts.length);
  // eslint-disable-next-line eqeqeq
  assert(addresses.length == amounts.length);
  const numTotal = addresses.length;
  const numChunks = Math.ceil(numTotal / chunkSize);
  const errorAddresses = [];
  let nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  console.log('nonce =' + nonce);
  for (let i = 0; i < numChunks; i++) {
    const addressesChunk = addresses.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    const amountsChunk = amounts.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    try {
      const result = await airdrop.dropTokens(addressesChunk, amountsChunk, { from: deployer.address, nonce: nonce });
      nonce += 1;
      console.log('***** result => ', result);
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
