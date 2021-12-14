const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const DecubateERC20Whitelisted = artifacts.require('DecubateERC20Whitelisted');
const DecubateVesting = artifacts.require('DecubateVesting');

contract('DecubateVesting', function (accounts) {
  const [ initialHolder ] = accounts;

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
});