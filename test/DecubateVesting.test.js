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

  const initialSupply = new BN(200);

  beforeEach(async function () {
    this.startTime = await time.latest();
    this.cliff = new BN(9327600);
    this.duration = await time.duration.minutes(10);


    this.token = await DecubateERC20Whitelisted.new(name, symbol, initialSupply, 0, 0, 0);
    this.vesting = await DecubateVesting.new(this.token.address, { from: initialHolder.address });
    await this.token.transfer(this.vesting.address, new BN(100), { from: initialHolder });
  });

  context('initial value', async function () {
    it('has a token', async function () {
      expect(await this.vesting.getToken()).to.equal(this.token.address);
    });
  
    it('has an owner', async function () {
      expect(await this.vesting.owner()).to.equal(initialHolder);
    });

    it('should have balance', async function () {
      expect(await this.token.balanceOf(this.vesting.address)).to.bignumber.equal(new BN(100));
    });
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
        1000,
        false,
        { from: anotherAccount }
      )).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should add vesting', async function () {
      // const startTime = await time.latest();
      // const cliff = new BN(9327600);
      // const duration = await time.duration.minutes(10);
      this.vesting.addVestingStrategy(
        'Added Strategy',
        this.cliff,
        this.startTime,
        this.duration,
        1000,
        false,
        { from: initialHolder }
      );

      const vestingPools = await this.vesting.vestingPools(0);
      expect(vestingPools.name).to.be.equal('Added Strategy');
      expect(vestingPools.cliff).to.be.bignumber.equal(new BN(this.startTime).add(this.cliff));
      expect(vestingPools.start).to.be.bignumber.equal(new BN(this.startTime));
      expect(vestingPools.duration).to.be.bignumber.equal(new BN(this.duration));
      expect(vestingPools.initialUnlockPercent).to.be.bignumber.equal(new BN(1000));
      expect(vestingPools.revocable).to.be.equal(false);

      const vestingInfo = await this.vesting.getVestingInfo(0);
      expect(vestingInfo.name).to.be.equal('Added Strategy');
      expect(vestingInfo.cliff).to.be.bignumber.equal(new BN(this.startTime).add(this.cliff));
      expect(vestingInfo.start).to.be.bignumber.equal(new BN(this.startTime));
      expect(vestingInfo.duration).to.be.bignumber.equal(new BN(this.duration));
      expect(vestingInfo.initialUnlockPercent).to.be.bignumber.equal(new BN(1000));
      expect(vestingInfo.revocable).to.be.equal(false);
    });

    beforeEach(async function () {
      // this.startTime = await time.latest();
      // this.cliff = new BN(9327600);
      // this.duration = await time.duration.minutes(10);
      await this.vesting.addVestingStrategy(
        'Added Strategy',
        this.cliff,
        this.startTime,
        this.duration,
        1000,
        false,
        { from: initialHolder }
      );
    });

    it('should have vestingInfo', async function () {
      const vestingInfo = await this.vesting.getVestingInfo(0);
      expect(vestingInfo.name).to.be.equal('Added Strategy');
      expect(vestingInfo.cliff).to.be.bignumber.equal(new BN(this.startTime).add(this.cliff));
      expect(vestingInfo.start).to.be.bignumber.equal(new BN(this.startTime));
      expect(vestingInfo.duration).to.be.bignumber.equal(new BN(this.duration));
      expect(vestingInfo.initialUnlockPercent).to.be.bignumber.equal(new BN(1000));
      expect(vestingInfo.revocable).to.be.equal(false);
    });

    context('setMaxTokenTransfer', async function () {
      it('should revert non owner', async function () {
        await expect(this.vesting.setMaxTokenTransfer(
          100,
          true,
          { from: anotherAccount }
        )).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it('should setMaxTokenTransfer', async function () {
        await this.vesting.setMaxTokenTransfer(200, true, { from: initialHolder });
        const maxTokenTransfer = await this.vesting.maxTokenTransfer();
        expect(maxTokenTransfer.amount).to.be.bignumber.equal(initialSupply);
        expect(maxTokenTransfer.active).to.be.equal(true);
      });
    });
  });
});