/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HoneyXBadger } from "../typechain";

describe("HoneyXBadger", function () {
  let honeyXBadger: HoneyXBadger;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const HoneyXBadgerContract = await ethers.getContractFactory(
      "HoneyXBadger"
    );

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    honeyXBadger = await HoneyXBadgerContract.deploy(
      "HoneyXBadger",
      "HXB",
      10000
    );
    await honeyXBadger.deployed();
  });
  describe("Deployment", function () {
    it("Should return right name", async function () {
      expect(await honeyXBadger.name()).to.equal("HoneyXBadger");
    });
    it("Should return right symbol", async function () {
      expect(await honeyXBadger.symbol()).to.equal("HXB");
    });
    it("Should return right max supply", async function () {
      expect(await honeyXBadger.maxSupply()).to.equal(10000);
    });
    // it("Should return right name", async function () {
    //   const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    //   // wait until the transaction is mined
    //   await setGreetingTx.wait();

    //   expect(await greeter.greet()).to.equal("Hola, mundo!");
    // });
  });
});
