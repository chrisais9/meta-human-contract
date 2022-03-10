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

  this.beforeAll(async function () {
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
    it("Should set the right owner", async function () {
      expect(await honeyXBadger.owner()).to.equal(owner.address);
    });
    it("Should return right name", async function () {
      expect(await honeyXBadger.name()).to.equal("HoneyXBadger");
    });
    it("Should return right symbol", async function () {
      expect(await honeyXBadger.symbol()).to.equal("HXB");
    });
    it("Should return right max supply", async function () {
      expect(await honeyXBadger.maxSupply()).to.equal(10000);
    });
  });

  describe("Base URI", function () {
    const baseURI =
      "https://ipfs.io/ipfs/QmXFepCgTVs4Yyo9J43bdgXrtGGxWnT3Jt6KDKxN4xEnzt";

    it("Should fail if sender is not owner", async function () {
      await expect(
        honeyXBadger.connect(addr1).setBaseURI(baseURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set the right BaseURI", async function () {
      const baseURI =
        "https://ipfs.io/ipfs/QmXFepCgTVs4Yyo9J43bdgXrtGGxWnT3Jt6KDKxN4xEnzt";
      const setBaseURITx = await honeyXBadger.setBaseURI(baseURI);

      await setBaseURITx.wait();

      expect(await honeyXBadger.baseURI()).to.equal(baseURI);
    });
  });

  describe("Mint Sale Status", function () {
    const maxTokenPurchase = 1;
    const tokenPrice = "100000000000000000";

    it("Should sale status false by default", async function () {
      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });

    it("Should fail if sender is not owner", async function () {
      await expect(
        honeyXBadger.connect(addr1).startMintSale(maxTokenPurchase, tokenPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should start mint sale", async function () {
      const startMintSaleTx = await honeyXBadger.startMintSale(
        maxTokenPurchase,
        tokenPrice
      );

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(true);
    });

    it("Should set the right max mint amount", async function () {
      expect(await honeyXBadger.maxTokenPurchase()).to.equal(maxTokenPurchase);
    });

    it("Should set the right mint price", async function () {
      expect(await honeyXBadger.tokenPrice()).to.equal(tokenPrice);
    });

    it("Should pause mint sale", async function () {
      const startMintSaleTx = await honeyXBadger.pauseMintSale();

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });
  });
});
