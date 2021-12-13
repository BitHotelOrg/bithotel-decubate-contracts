const { expect } = require("chai");
const { ethers } = require("hardhat");


const { time } = require("@openzeppelin/test-helpers");

describe("DecubateWhitelisted", function () {
  before(async function () {
    const initialTime = await time.duration.minutes(144);
    const blockSellUntil = await time.latest().this.add(10000);

    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    this.contractOwnerAddress = contractOwner.address;

    const DecubateWhitelisted = await ethers.getContractFactory(
      "DecubateWhitelisted"
    );
    const decubateWhitelisted = await DecubateWhitelisted.deploy(
      initialTime,
      await time.latest(),
      blockSellUntil);
    await decubateWhitelisted.deployed();
  });

  // context("Initial values", async function () {
  //   it("Deployer should whitelisted", async function () {
  //     expect(await decubateWhitelisted.isWhitelisted(this.contractOwnerAddress)).to.equal(true);
  //   });
  // });

  // it("Should return the new greeting once it's changed", async function () {
  //   const Greeter = await ethers.getContractFactory("Greeter");
  //   const greeter = await Greeter.deploy("Hello, world!");
  //   await greeter.deployed();

  //   expect(await greeter.greet()).to.equal("Hello, world!");

  //   const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

  //   // wait until the transaction is mined
  //   await setGreetingTx.wait();

  //   expect(await greeter.greet()).to.equal("Hola, mundo!");
  // });
});
