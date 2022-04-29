const { BN, constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC20 } = require("./token/ERC20/ERC20.behavior");
const { shouldBehaveLikeERC20Capped } = require("./token/ERC20/extensions/ERC20Capped.behavior");

const getKicks = artifacts.require("getKicks");
const pairAddress = "0x0000000000000000000000000000000000000001";

contract("getKicks", function (accounts) {
  const [initialHolder, bannedSender, bannedRecipient, recipient, account, anotherAccount, depositor] = accounts;
  const BANNEDLISTED_ROLE = web3.utils.soliditySha3("BANNEDLISTED_ROLE");

  const name = "My Token";
  const symbol = "MTKN";

  const initialSupply = new BN(100);

  it("requires a non-zero cap", async function () {
    await expectRevert(
      getKicks.new(name, symbol, initialSupply, new BN(0), 0, 0, { from: initialHolder }),
      "ERC20Capped: cap is 0"
    );
  });

  beforeEach(async function () {
    this.token = await getKicks.new(name, symbol, initialSupply, initialSupply, 0, 0);
  });

  it("has a name", async function () {
    expect(await this.token.name()).to.equal(name);
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal(symbol);
  });

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal("18");
  });

  shouldBehaveLikeERC20("ERC20", initialSupply, initialHolder, recipient, anotherAccount);
  shouldBehaveLikeERC20Capped(initialHolder, [anotherAccount], initialSupply);

  describe("decrease allowance", function () {
    describe("when the spender is not the zero address", function () {
      const spender = recipient;

      function shouldDecreaseApproval(amount) {
        describe("when there was no approved amount before", function () {
          it("reverts", async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, amount, { from: initialHolder }),
              "ERC20: decreased allowance below zero"
            );
          });
        });

        describe("when the spender had an approved amount", function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
          });

          it("emits an approval event", async function () {
            const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

            expectEvent.inLogs(logs, "Approval", {
              owner: initialHolder,
              spender: spender,
              value: new BN(0),
            });
          });

          it("decreases the spender allowance subtracting the requested amount", async function () {
            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal("1");
          });

          it("sets the allowance to zero when all allowance is removed", async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal("0");
          });

          it("reverts when more than the full allowance is removed", async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder }),
              "ERC20: decreased allowance below zero"
            );
          });
        });
      }

      describe("when the sender has enough balance", function () {
        const amount = initialSupply;

        shouldDecreaseApproval(amount);
      });

      describe("when the sender does not have enough balance", function () {
        const amount = initialSupply.addn(1);

        shouldDecreaseApproval(amount);
      });
    });

    describe("when the spender is the zero address", function () {
      const amount = initialSupply;
      const spender = ZERO_ADDRESS;

      it("reverts", async function () {
        await expectRevert(
          this.token.decreaseAllowance(spender, amount, { from: initialHolder }),
          "ERC20: decreased allowance below zero"
        );
      });
    });
  });

  describe("increase allowance", function () {
    const amount = initialSupply;

    describe("when the spender is not the zero address", function () {
      const spender = recipient;

      describe("when the sender has enough balance", function () {
        it("emits an approval event", async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

          expectEvent.inLogs(logs, "Approval", {
            owner: initialHolder,
            spender: spender,
            value: amount,
          });
        });

        describe("when there was no approved amount before", function () {
          it("approves the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe("when the spender had an approved amount", function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it("increases the spender allowance adding the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });

      describe("when the sender does not have enough balance", function () {
        const amount = initialSupply.addn(1);

        it("emits an approval event", async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

          expectEvent.inLogs(logs, "Approval", {
            owner: initialHolder,
            spender: spender,
            value: amount,
          });
        });

        describe("when there was no approved amount before", function () {
          it("approves the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe("when the spender had an approved amount", function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it("increases the spender allowance adding the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });
    });

    describe("when the spender is the zero address", function () {
      const spender = ZERO_ADDRESS;

      it("reverts", async function () {
        await expectRevert(
          this.token.increaseAllowance(spender, amount, { from: initialHolder }),
          "ERC20: approve to the zero address"
        );
      });
    });
  });

  context("banned", function () {
    beforeEach(async function () {
      await this.token.transfer(bannedSender, 100, { from: initialHolder });
      await this.token.grantRole(BANNEDLISTED_ROLE, bannedSender);
      await this.token.grantRole(BANNEDLISTED_ROLE, bannedRecipient);
    });

    it("should hasRole BANNEDLISTED_ROLE", async function () {
      expect(await this.token.hasRole(BANNEDLISTED_ROLE, bannedSender)).to.be.equal(true);
      expect(await this.token.hasRole(BANNEDLISTED_ROLE, bannedRecipient)).to.be.equal(true);
    });

    it("revert when transfer to banned address", async function () {
      await expectRevert(
        this.token.transfer(bannedRecipient, 100, { from: initialHolder }),
        "getKicks: to address banned"
      );
    });

    it("revert when transfer from banned address", async function () {
      await expectRevert(
        this.token.transfer(anotherAccount, 100, { from: bannedSender }),
        "getKicks: from address banned"
      );
    });
  });

  describe("_burn", function () {
    describe("for a non zero account", function () {
      it("rejects burning more than balance", async function () {
        await expectRevert(this.token.burn(initialSupply.addn(1)), "ERC20: burn amount exceeds balance");
      });

      const describeBurn = function (description, amount) {
        describe(description, function () {
          beforeEach("burning", async function () {
            const { logs } = await this.token.burn(amount);
            this.logs = logs;
          });

          it("decrements totalSupply", async function () {
            const expectedSupply = initialSupply.sub(amount);
            expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
          });

          it("decrements initialHolder balance", async function () {
            const expectedBalance = initialSupply.sub(amount);
            expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(expectedBalance);
          });

          it("emits Transfer event", async function () {
            const event = expectEvent.inLogs(this.logs, "Transfer", {
              from: initialHolder,
              to: ZERO_ADDRESS,
            });

            expect(event.args.value).to.be.bignumber.equal(amount);
          });
        });
      };

      describeBurn("for entire balance", initialSupply);
      describeBurn("for less amount than balance", initialSupply.subn(1));
    });
  });
  describe("bulkBannedList", function () {
    beforeEach(async function () {
      await this.token.transfer(bannedSender, 100, { from: initialHolder });
      await this.token.bulkBannedList([bannedSender, bannedRecipient]);
    });

    it("should hasRole BANNEDLISTED_ROLE", async function () {
      expect(await this.token.hasRole(BANNEDLISTED_ROLE, bannedSender)).to.be.equal(true);
      expect(await this.token.hasRole(BANNEDLISTED_ROLE, bannedRecipient)).to.be.equal(true);
    });

    it("revert when transfer to banned address", async function () {
      await expectRevert(
        this.token.transfer(bannedRecipient, 100, { from: initialHolder }),
        "getKicks: to address banned"
      );
    });

    it("revert when transfer from banned address", async function () {
      await expectRevert(
        this.token.transfer(anotherAccount, 100, { from: bannedSender }),
        "getKicks: from address banned"
      );
    });
  });
  describe("setPairAddress", function () {
    it("should set pair address", async function () {
      await this.token.setPairAddress(pairAddress);
      expect(await this.token.pairAddress()).to.be.equal(pairAddress);
    });
  });
  describe("_beforeTokenTransfer", function () {
    let token;
    let currentTime;
    describe("isTimeLocked", function () {
      beforeEach(async function () {
        let currentNumber = await ethers.provider.getBlockNumber();
        let currentBlock = await ethers.provider.getBlock(currentNumber);
        currentTime = currentBlock.timestamp;
        token = await getKicks.new(name, symbol, initialSupply, initialSupply, currentTime + 10000, 0);
      });
      it("should revert on time locked", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 10]);
        await expectRevert(token.transfer(account, 100, { from: anotherAccount }), "getKicks: Trading not enabled yet");
      });
      it("should not revert on time locked on admin", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 20]);
        expect(await token.transfer(anotherAccount, 100, { from: initialHolder }));
      });
      it("should transfer after time lock timestamp", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 20000]);
        expect(await token.transfer(account, 100, { from: initialHolder }));
        expect(await token.transfer(anotherAccount, 100, { from: account }));
      });
    });
    describe("isSaleBlocked", function () {
      beforeEach(async function () {
        let currentNumber = await ethers.provider.getBlockNumber();
        let currentBlock = await ethers.provider.getBlock(currentNumber);
        currentTime = currentBlock.timestamp;
        token = await getKicks.new(name, symbol, initialSupply, initialSupply, 0, currentTime + 10000);
        await token.setPairAddress(pairAddress);
      });
      it("should revert on sale blocked", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 10]);
        await token.transfer(account, 100, { from: initialHolder });
        await expectRevert(token.transfer(pairAddress, 100, { from: account }), "getKicks: Sell disabled!");
      });
      it("should not revert on sale blocked admin", async function () {
        await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 10]);
        await token.transfer(account, 100, { from: initialHolder });
        await expectRevert(token.transfer(pairAddress, 100, { from: account }), "getKicks: Sell disabled!");
      });
    });
  });
});
