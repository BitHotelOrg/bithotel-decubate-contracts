describe("getReleasableAmount", () => {
  it("should return the releasable amount", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      100000,
      current+100,
      60 * 60,
      100,
      false
    );

    const amount = await this.dcbVesting.getReleasableAmount(0, accounts[0]);
    assert.equal(amount, 0);
  });
});

describe("disable", () => {
  it("should disable and enable back a user from claiming vesting", async function () {
    await this.dcbVesting.addWhitelist(accounts[1], "1000000", 0);
    await this.dcbVesting.setVesting(0, accounts[1],true);
    await this.dcbVesting.setVesting(0, accounts[1],false);
  });
});

describe("claimDistribution", () => {
  it("should throw an error as there is not tokens to claim", async function () {
    await expectRevert(
      this.dcbVesting.claimDistribution(0, accounts[0]),
      "Zero amount to claim"
    );
  });
  it("should throw an error as user is disabled from claiming tokens", async function () {
    await this.dcbVesting.setVesting(0, accounts[1],true);
    await expectRevert(
      this.dcbVesting.claimDistribution(0, accounts[1]),
      "User is disabled from claiming token"
    );
  });

  it("should successfully claim 1 token as that is the max tranfer amount", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      0,
      current,
      0,
      100,
      false
    );
    await this.dcbVesting.setMaxTokenTransfer(1, true);

    const bal_before = await this.dcbToken.balanceOf(accounts[0]);

    await this.dcbVesting.claimDistribution(0, accounts[0]);
    await this.dcbVesting.setMaxTokenTransfer(0, false);

    const bal_after = await this.dcbToken.balanceOf(accounts[0]);

    assert.equal(bal_after.sub(bal_before), "1");
  });

  it("should successfully claim tokens", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      0,
      current,
      0,
      100,
      false
    );

    const bal_before = Number(await this.dcbToken.balanceOf(accounts[0]));

    await this.dcbVesting.claimDistribution(0, accounts[0]);

    const bal_after = Number(await this.dcbToken.balanceOf(accounts[0]));

    assert.equal(bal_after - bal_before, "999999");
  });
});

describe("getVestAmount", () => {
  it("should return 0 as start has not been reached", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      100000,
      current+100,
      60 * 60,
      100,
      false
    );
    const amount = await this.dcbVesting.getVestAmount(0, accounts[0]);
    assert.equal(amount, 0);
  });

  it("should return initial unlock as start has been reached", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      100000,
      current+100,
      60 * 60,
      100,
      false
    );
    await time.increase(101);
    const amount = await this.dcbVesting.getVestAmount(0, accounts[0]);
    assert.equal(amount, '100000');
  });

  it("should return full amount as total duration has been reached", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      0,
      current,
      0,
      100,
      false
    );

    const amount = await this.dcbVesting.getVestAmount(0, accounts[0]);
    assert.equal(amount, "1000000");
  });

  it("should return the initial unlock and unlock amount at different intervals", async function () {
    const current = Number(await time.latest());
    await this.dcbVesting.setVestingStrategy(
      0,
      "",
      100,
      current + 50,
      1000,
      100,
      false
    );

    let amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.equal(amount,0); //Start hasn't been reached, so 0 amount
    await time.increase(50);
    amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.equal(amount,100000); //Start has reached, so initial unlock
    await time.increase(200);

    //Total deposit = 1000000
    //100 seconds passed, initial unlock activated 
    //Initial inlock = 1000000/10 = 100000
    //Remaining token = 1000000 - 100000 = 900000
    //Another 100 seconds passed, of total 10000 seconds. So 1% of remaining should be unlocked
    //Total = 100000 + 900000/100 = 109000
    amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.isAbove(amount,109000);
    await time.increase(850);
    amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.isBelow(amount,1000000); //End date haven't reached, so will not get full amount
    await time.increase(100);
    amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.equal(amount,1000000);//End date over, so full amount
    await time.increase(60*60*24*7);
    amount = Number(await this.dcbVesting.getVestAmount(0, accounts[0]));
    assert.equal(amount,1000000);//One week passed after enddate, still same amount
  });
});