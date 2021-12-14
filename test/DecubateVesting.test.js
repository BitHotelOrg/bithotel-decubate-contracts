const { BN, constants, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require("hardhat");
const { ZERO_ADDRESS } = constants;

const DecubateERC20Whitelisted = artifacts.require('DecubateERC20Whitelisted');
const DecubateVesting = artifacts.require('DecubateVesting');

contract('DecubateVesting', function (accounts) {
  const [ initialHolder, anotherAccount ] = accounts;

  const name = 'My Token';
  const symbol = 'MTKN';

  const initialSupply = new BN(100);

  beforeEach(async function () {
    this.token = await DecubateERC20Whitelisted.new(name, symbol, initialSupply, 0, 0, 0);
    this.vesting = await DecubateVesting.new(this.token.address);
  });

  it('has a token', async function () {
    expect(await this.vesting.getToken()).to.equal(this.token.address);
  });

  it('change a token', async function () {
    await this.vesting.setToken(ZERO_ADDRESS);
    expect(await this.vesting.getToken()).to.equal(ZERO_ADDRESS);
  });

  context('addVestingStrategy', async function () {
    it('should revert non owner', async function () {
      await expect(this.vesting.addVestingStrategy(
        'Reverted Strategy',
        9327600,
        await time.latest(),
        await time.duration.minutes(10),
        100,
        false,
        { from: this.anotherAccount }
      )).to.be.revertedWith('Test');
    });
  });
});