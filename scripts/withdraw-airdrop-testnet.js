const hre = require("hardhat");

const AIRDROP_ADDRESS = "0xeE2bfDe1BcFF651776C042E3dC478e10C97DCf7f";

const RECIPIENT = "0x75ebfd016B71645f959D8f6D8Ff34CCffa87dacc";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = Airdrop.attach(AIRDROP_ADDRESS);
  const result = await airdrop.withdrawTokens(RECIPIENT, { from: deployer.address });
  console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
