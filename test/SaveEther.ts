const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("hardhat");

describe("SaveEther", function () {
  let SaveEther;
  let saveEther: any;
  let owner: any;
  let otherAccount: any;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    SaveEther = await ethers.getContractFactory("SaveEther");
    saveEther = await SaveEther.deploy();
  });

  it("Should save ether to contract", async function () {
    await saveEther.deposit({ value: ethers.parseEther("1") });

    const userSavings = await saveEther.checkSavings(owner.address);
    expect(userSavings).to.equal(ethers.parseEther("1"));
  });

  it("Should withdraw ether from contract", async function () {
    // console.log("owner.address", owner.address);
    // console.log("otherAccount.address", otherAccount.address);
    // console.log("saveEther.address", saveEther.target);
    // console.log("ethers.utils.parseEther('1')", ethers.parseEther("1"));
    await saveEther.deposit({ value: ethers.parseEther("1") });
    await saveEther.withdraw();

    const userSavings = await saveEther.checkSavings(owner.address);
    expect(userSavings).to.equal(0);
  });

  it("Should transfer ether from one account to another", async function () {
    await saveEther.deposit({ value: ethers.parseEther("1") });
    const initialReceiverBalance = await saveEther.checkSavings(otherAccount.address);

    await saveEther.sendOutSaving(otherAccount.address, ethers.parseEther("0.5"));
    
    const finalReceiverBalance = await saveEther.checkSavings(otherAccount.address);
    console.log("finalReceiverBalance", finalReceiverBalance);
    const contractBalance = await saveEther.checkContractBal();
    console.log("contractBalance", contractBalance);

    expect(finalReceiverBalance.sub(initialReceiverBalance)).to.equal(ethers.parseEther("0.5"));
    console.log("contractBalance", contractBalance);
    expect(contractBalance).to.equal(ethers.parseEther("0.5"));
  });

  it("Should revert if trying to withdraw without savings", async function () {
    await expect(saveEther.withdraw()).to.be.revertedWith("you don't have any savings");
  });

  it("Should revert if trying to send out more savings than available", async function () {
    await saveEther.deposit({ value: ethers.parseEther("1") });

    await expect(saveEther.sendOutSaving(otherAccount.address, ethers.parseEther("2"))).to.be.reverted;
  });
});
