const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BN, constants } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;

// const {
//   shouldBehaveLikeERC20,
//   shouldBehaveLikeERC20Transfer,
//   shouldBehaveLikeERC20Approve,
// } = require('./token/ERC20/ERC20.behavior');

describe("DecubateERC20Whitelisted", function () {
  before(async function () {
    this.name = "My Token";
    this.symbol = "MTKN";
    this.initialSupply = 100;
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    this.contractOwner = contractOwner.address;
    const recipient = accounts[1];
    this.recipient = recipient.address;
    const anotherAccount = accounts[2];
    this.anotherAccount = anotherAccount.address;

    const DecubateERC20Whitelisted = await ethers.getContractFactory(
      "DecubateERC20Whitelisted"
    );
    this.token = await DecubateERC20Whitelisted.deploy(
      this.name,
      this.symbol,
      this.initialSupply,
      0,
      0,
      0
    );
  });

  it("has a name", async function () {
    expect(await this.token.name()).to.equal(this.name);
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal(this.symbol);
  });

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.be.equal(18);
  });

  //shouldBehaveLikeERC20('ERC20', new BN(100), this.contractOwner, this.recipient, this.anotherAccount);

  describe("total supply", function () {
    it("returns the total amount of tokens", async function () {
      expect(await this.token.totalSupply()).to.be.equal(100);
    });
  });

  describe("balanceOf", function () {
    describe("when the requested account has no tokens", function () {
      it("returns zero", async function () {
        expect(await this.token.balanceOf(this.anotherAccount)).to.be.equal(0);
      });
    });

    describe("when the requested account has some tokens", function () {
      it("returns the total amount of tokens", async function () {
        expect(await this.token.balanceOf(this.contractOwner)).to.be.equal(100);
      });
    });

    describe("transfer", function () {
      describe("when the recipient is not the zero address", function () {
        describe("when the sender does not have enough balance", function () {
          const amount = 101;

          it("reverts", async function () {
            await expect(
              this.token.transfer(this.recipient, amount, {
                from: this.contractOwner,
              })
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            // Owner balance shouldn't have changed.
            expect(await this.token.balanceOf(this.contractOwner)).to.equal(
              100
            );
          });
        });

        describe("when the sender transfers all balance", function () {
          const amount = 100;

          it("transfers the requested amount", async function () {
            expect(
              await this.token.transfer(this.recipient, amount, {
                from: this.contractOwner,
              })
            ).to.emit(this.token, "Transfer");

            expect(await this.token.balanceOf(this.contractOwner)).to.equal(0);

            expect(await this.token.balanceOf(this.recipient)).to.equal(amount);
          });
        });
      });

      describe("when the recipient is the zero address", function () {
        it("reverts", async function () {
          await expect(
            this.token.transfer(ZERO_ADDRESS, 100, {
              from: this.contractOwner,
            })
          ).to.be.revertedWith("ERC20: transfer to the zero address");
        });
      });
    });
    describe("transfer from", function () {
      describe("when the token owner is not the zero address", function () {
        describe("when the recipient is not the zero address", function () {
          describe("when the spender has enough approved balance", function () {
            beforeEach(async function () {
              await this.token.approve(this.recipient, 100, {
                from: this.contractOwner,
              });
            });
            describe("when the token owner has enough balance", function () {
              it("transfers the requested amount", async function () {
                await this.token.transferFrom(this.contractOwner, this.anotherAccount, 100, { from: this.recipient });
  
                //expect(await this.token.balanceOf(tokenOwner)).to.be.bignumber.equal('0');
  
                //expect(await this.token.balanceOf(to)).to.be.bignumber.equal(amount);
              });
            });
          });
        });
      });
    });
  });
});

// contract('DecubateERC20Whitelisted', function (accounts) {
//   const [ initialHolder, recipient, anotherAccount ] = accounts;

//   const name = 'My Token';
//   const symbol = 'MTKN';

//   const initialSupply = new BN(100);

//   beforeEach(async function () {
//     this.token = await ERC20Mock.new(name, symbol, initialHolder, initialSupply);
//   });

//   it('has a name', async function () {
//     expect(await this.token.name()).to.equal(name);
//   });

//   it('has a symbol', async function () {
//     expect(await this.token.symbol()).to.equal(symbol);
//   });

//   it('has 18 decimals', async function () {
//     expect(await this.token.decimals()).to.be.bignumber.equal('18');
//   });

//   describe('set decimals', function () {
//     const decimals = new BN(6);

//     it('can set decimals during construction', async function () {
//       const token = await ERC20DecimalsMock.new(name, symbol, decimals);
//       expect(await token.decimals()).to.be.bignumber.equal(decimals);
//     });
//   });

//   shouldBehaveLikeERC20('ERC20', initialSupply, initialHolder, recipient, anotherAccount);

//   describe('decrease allowance', function () {
//     describe('when the spender is not the zero address', function () {
//       const spender = recipient;

//       function shouldDecreaseApproval (amount) {
//         describe('when there was no approved amount before', function () {
//           it('reverts', async function () {
//             await expectRevert(this.token.decreaseAllowance(
//               spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero',
//             );
//           });
//         });

//         describe('when the spender had an approved amount', function () {
//           const approvedAmount = amount;

//           beforeEach(async function () {
//             ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
//           });

//           it('emits an approval event', async function () {
//             const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

//             expectEvent.inLogs(logs, 'Approval', {
//               owner: initialHolder,
//               spender: spender,
//               value: new BN(0),
//             });
//           });

//           it('decreases the spender allowance subtracting the requested amount', async function () {
//             await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('1');
//           });

//           it('sets the allowance to zero when all allowance is removed', async function () {
//             await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('0');
//           });

//           it('reverts when more than the full allowance is removed', async function () {
//             await expectRevert(
//               this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder }),
//               'ERC20: decreased allowance below zero',
//             );
//           });
//         });
//       }

//       describe('when the sender has enough balance', function () {
//         const amount = initialSupply;

//         shouldDecreaseApproval(amount);
//       });

//       describe('when the sender does not have enough balance', function () {
//         const amount = initialSupply.addn(1);

//         shouldDecreaseApproval(amount);
//       });
//     });

//     describe('when the spender is the zero address', function () {
//       const amount = initialSupply;
//       const spender = ZERO_ADDRESS;

//       it('reverts', async function () {
//         await expectRevert(this.token.decreaseAllowance(
//           spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero',
//         );
//       });
//     });
//   });

//   describe('increase allowance', function () {
//     const amount = initialSupply;

//     describe('when the spender is not the zero address', function () {
//       const spender = recipient;

//       describe('when the sender has enough balance', function () {
//         it('emits an approval event', async function () {
//           const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//           expectEvent.inLogs(logs, 'Approval', {
//             owner: initialHolder,
//             spender: spender,
//             value: amount,
//           });
//         });

//         describe('when there was no approved amount before', function () {
//           it('approves the requested amount', async function () {
//             await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
//           });
//         });

//         describe('when the spender had an approved amount', function () {
//           beforeEach(async function () {
//             await this.token.approve(spender, new BN(1), { from: initialHolder });
//           });

//           it('increases the spender allowance adding the requested amount', async function () {
//             await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
//           });
//         });
//       });

//       describe('when the sender does not have enough balance', function () {
//         const amount = initialSupply.addn(1);

//         it('emits an approval event', async function () {
//           const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//           expectEvent.inLogs(logs, 'Approval', {
//             owner: initialHolder,
//             spender: spender,
//             value: amount,
//           });
//         });

//         describe('when there was no approved amount before', function () {
//           it('approves the requested amount', async function () {
//             await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
//           });
//         });

//         describe('when the spender had an approved amount', function () {
//           beforeEach(async function () {
//             await this.token.approve(spender, new BN(1), { from: initialHolder });
//           });

//           it('increases the spender allowance adding the requested amount', async function () {
//             await this.token.increaseAllowance(spender, amount, { from: initialHolder });

//             expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
//           });
//         });
//       });
//     });

//     describe('when the spender is the zero address', function () {
//       const spender = ZERO_ADDRESS;

//       it('reverts', async function () {
//         await expectRevert(
//           this.token.increaseAllowance(spender, amount, { from: initialHolder }), 'ERC20: approve to the zero address',
//         );
//       });
//     });
//   });

//   describe('_mint', function () {
//     const amount = new BN(50);
//     it('rejects a null account', async function () {
//       await expectRevert(
//         this.token.mint(ZERO_ADDRESS, amount), 'ERC20: mint to the zero address',
//       );
//     });

//     describe('for a non zero account', function () {
//       beforeEach('minting', async function () {
//         const { logs } = await this.token.mint(recipient, amount);
//         this.logs = logs;
//       });

//       it('increments totalSupply', async function () {
//         const expectedSupply = initialSupply.add(amount);
//         expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
//       });

//       it('increments recipient balance', async function () {
//         expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
//       });

//       it('emits Transfer event', async function () {
//         const event = expectEvent.inLogs(this.logs, 'Transfer', {
//           from: ZERO_ADDRESS,
//           to: recipient,
//         });

//         expect(event.args.value).to.be.bignumber.equal(amount);
//       });
//     });
//   });

//   describe('_burn', function () {
//     it('rejects a null account', async function () {
//       await expectRevert(this.token.burn(ZERO_ADDRESS, new BN(1)),
//         'ERC20: burn from the zero address');
//     });

//     describe('for a non zero account', function () {
//       it('rejects burning more than balance', async function () {
//         await expectRevert(this.token.burn(
//           initialHolder, initialSupply.addn(1)), 'ERC20: burn amount exceeds balance',
//         );
//       });

//       const describeBurn = function (description, amount) {
//         describe(description, function () {
//           beforeEach('burning', async function () {
//             const { logs } = await this.token.burn(initialHolder, amount);
//             this.logs = logs;
//           });

//           it('decrements totalSupply', async function () {
//             const expectedSupply = initialSupply.sub(amount);
//             expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
//           });

//           it('decrements initialHolder balance', async function () {
//             const expectedBalance = initialSupply.sub(amount);
//             expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(expectedBalance);
//           });

//           it('emits Transfer event', async function () {
//             const event = expectEvent.inLogs(this.logs, 'Transfer', {
//               from: initialHolder,
//               to: ZERO_ADDRESS,
//             });

//             expect(event.args.value).to.be.bignumber.equal(amount);
//           });
//         });
//       };

//       describeBurn('for entire balance', initialSupply);
//       describeBurn('for less amount than balance', initialSupply.subn(1));
//     });
//   });

//   describe('_transfer', function () {
//     shouldBehaveLikeERC20Transfer('ERC20', initialHolder, recipient, initialSupply, function (from, to, amount) {
//       return this.token.transferInternal(from, to, amount);
//     });

//     describe('when the sender is the zero address', function () {
//       it('reverts', async function () {
//         await expectRevert(this.token.transferInternal(ZERO_ADDRESS, recipient, initialSupply),
//           'ERC20: transfer from the zero address',
//         );
//       });
//     });
//   });

//   describe('_approve', function () {
//     shouldBehaveLikeERC20Approve('ERC20', initialHolder, recipient, initialSupply, function (owner, spender, amount) {
//       return this.token.approveInternal(owner, spender, amount);
//     });

//     describe('when the owner is the zero address', function () {
//       it('reverts', async function () {
//         await expectRevert(this.token.approveInternal(ZERO_ADDRESS, recipient, initialSupply),
//           'ERC20: approve from the zero address',
//         );
//       });
//     });
//   });
// });