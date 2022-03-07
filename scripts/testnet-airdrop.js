const hre = require("hardhat");
const assert = require("assert");
const addresses = require("./bitkeep.json");

const AMOUNT_PER_ADDRESS = "255000000000000000000"; // 255 ether

const chunkSize = 10;

const AIRDROP_ADDRESS = "0xA1DFcaC1904177B614F67575269c7E2ee95f964d";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = Airdrop.attach(AIRDROP_ADDRESS);
  let amounts = [];

  // set amounts in array:
  for (let i = 0; i < addresses.length; i++) {
    amounts.push(AMOUNT_PER_ADDRESS);
  }
  console.log(addresses.length);
  console.log(amounts.length);
  // eslint-disable-next-line eqeqeq
  assert(addresses.length == amounts.length);
  const numTotal = addresses.length;
  const numChunks = Math.ceil(numTotal / chunkSize);
  const errorAddresses = [];
  let nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  console.log("nonce =" + nonce);
  for (let i = 0; i < numChunks; i++) {
    const addressesChunk = addresses.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    const amountsChunk = amounts.slice(chunkSize * i, Math.min(chunkSize * i + chunkSize, numTotal));
    try {
      const result = await airdrop.dropTokens(addressesChunk, amountsChunk, { from: deployer.address, nonce: nonce });
      nonce += 1;
      console.log("***** result => ", result);
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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
