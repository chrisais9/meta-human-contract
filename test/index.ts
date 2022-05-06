/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line node/no-extraneous-import
import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import { MetaHuman } from "../typechain";

function parseEther(ether: number): BigNumber {
  return ethers.utils.parseUnits(ether.toString(), 18);
}

describe("MetaHuman", function () {
  const baseURI =
    "https://ipfs.io/ipfs/QmXFepCgTVs4Yyo9J43bdgXrtGGxWnT3Jt6KDKxN4xEnzt/";
  const placeholder =
    "https://ipfs.io/ipfs/QmQYTzPCpk7Hswtkzxck6f1eZhfHUEB9h892bMCFLeM2S7";

  const maxMintAmount = 5;
  const tokenPrice = 0.1;

  let metaHuman: MetaHuman;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let whitelistAddr: SignerWithAddress;
  let addrs: SignerWithAddress[];

  function getMerkleRoot(whitelists: string[]): string {
    const leafNodes = whitelists.map((addr) => keccak256(addr));

    const merkletree = new MerkleTree(leafNodes, keccak256, {
      sortPairs: true,
    });

    return merkletree.getHexRoot();
  }

  function getMerkleProof(address: string): string[] {
    const whitelistAddress = [whitelistAddr].map((addr) => addr.address);
    const leafNodes = whitelistAddress.map((addr) => keccak256(addr));

    const merkletree = new MerkleTree(leafNodes, keccak256, {
      sortPairs: true,
    });

    return merkletree.getHexProof(keccak256(address));
  }

  function verifyMerkleProof(address: string): boolean {
    const whitelistAddress = [whitelistAddr].map((addr) => addr.address);
    const leafNodes = whitelistAddress.map((addr) => keccak256(addr));

    const merkletree = new MerkleTree(leafNodes, keccak256, {
      sortPairs: true,
    });

    return merkletree.verify(
      merkletree.getHexProof(keccak256(address)),
      keccak256(address),
      merkletree.getHexRoot()
    );
  }

  describe("Deployment", function () {
    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();
    });

    it("Should set the right owner", async function () {
      expect(await metaHuman.owner()).to.equal(owner.address);
    });
    it("Should return right name", async function () {
      expect(await metaHuman.name()).to.equal("MetaHuman");
    });
    it("Should return right symbol", async function () {
      expect(await metaHuman.symbol()).to.equal("MHAF");
    });
    it("Should return right max supply", async function () {
      expect(await metaHuman.maxSupply()).to.equal(10000);
    });
  });

  describe("Base URI", function () {
    this.beforeAll(async function () {
      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();
    });

    it("Should fail if sender is not owner", async function () {
      await expect(
        metaHuman.connect(addr1).setBaseURI(baseURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set the right BaseURI", async function () {
      const setBaseURITx = await metaHuman.setBaseURI(baseURI);

      await setBaseURITx.wait();

      expect(await metaHuman.baseURI()).to.equal(baseURI);
    });

    it("Should revert if contract is locked", async function () {
      const lockTx = await metaHuman.lockContract();
      await lockTx.wait();

      await expect(metaHuman.setBaseURI(baseURI)).to.be.revertedWith(
        "Contract is locked"
      );
    });
  });

  describe("Mint Sale Status", function () {
    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();
    });

    it("Should sale status false by default", async function () {
      expect(await metaHuman.isPublicMintActive()).to.equal(false);
      expect(await metaHuman.isWhitelistMintActive()).to.equal(false);
    });

    it("Should fail if sender is not owner", async function () {
      await expect(
        metaHuman
          .connect(addr1)
          .startPublicMint(maxMintAmount, parseEther(tokenPrice))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      const whitelistAddresses = [whitelistAddr].map((addr) => addr.address);
      await expect(
        metaHuman
          .connect(addr1)
          .startWhitelistMint(
            maxMintAmount,
            parseEther(tokenPrice),
            getMerkleRoot(whitelistAddresses)
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should start mint sale and set configs correctly - Public", async function () {
      const startMintSaleTx = await metaHuman.startPublicMint(
        maxMintAmount,
        parseEther(tokenPrice)
      );
      await startMintSaleTx.wait();

      expect(await metaHuman.isPublicMintActive()).to.equal(true);

      expect(await metaHuman.maxMintAmount()).to.equal(maxMintAmount);
      expect(await metaHuman.tokenPrice()).to.equal(parseEther(tokenPrice));
    });

    it("Should start mint sale and set configs correctly - Whitelist", async function () {
      const whitelistAddresses = [whitelistAddr].map((addr) => addr.address);
      const startMintSaleTx = await metaHuman.startWhitelistMint(
        maxMintAmount,
        parseEther(tokenPrice),
        getMerkleRoot(whitelistAddresses)
      );
      await startMintSaleTx.wait();

      expect(await metaHuman.isWhitelistMintActive()).to.equal(true);

      expect(await metaHuman.maxMintAmount()).to.equal(maxMintAmount);
      expect(await metaHuman.tokenPrice()).to.equal(parseEther(tokenPrice));
    });

    it("Should pause mint sale - Public", async function () {
      const startMintSaleTx = await metaHuman.pausePublicMint();

      await startMintSaleTx.wait();

      expect(await metaHuman.isPublicMintActive()).to.equal(false);
    });

    it("Should pause mint sale - Whitelist", async function () {
      const startMintSaleTx = await metaHuman.pauseWhitelistMint();

      await startMintSaleTx.wait();

      expect(await metaHuman.isWhitelistMintActive()).to.equal(false);
    });
  });

  describe("Minting", function () {
    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();
    });

    it("Should fail if mint sale is not started", async function () {
      await expect(metaHuman.mintMetaHuman(1)).to.be.revertedWith(
        "Mint is not active"
      );
    });

    it("Should start mint sale - Public", async function () {
      const startMintSaleTx = await metaHuman.startPublicMint(
        maxMintAmount,
        parseEther(tokenPrice)
      );

      await startMintSaleTx.wait();

      expect(await metaHuman.isPublicMintActive()).to.equal(true);
    });

    it("Should start mint sale - Whitelist", async function () {
      const whitelistAddresses = [whitelistAddr].map((addr) => addr.address);
      const startMintSaleTx = await metaHuman.startWhitelistMint(
        maxMintAmount,
        parseEther(tokenPrice),
        getMerkleRoot(whitelistAddresses)
      );
      await startMintSaleTx.wait();

      expect(await metaHuman.isWhitelistMintActive()).to.equal(true);
    });

    it("Should fail address is not whitelisted", async function () {
      await expect(
        metaHuman.mintWhitelistMetaHuman(getMerkleProof(addr1.address), 1, {
          value: parseEther(tokenPrice),
        })
      ).to.be.revertedWith("not whitelisted");
    });

    it("Should fail mint amount is Bigger than max", async function () {
      await expect(metaHuman.mintMetaHuman(9999)).to.be.revertedWith(
        "Too greedy"
      );
    });

    it("Should fail if insufficent ether value to mint", async function () {
      const amountToMint = 4;
      await expect(
        metaHuman.mintMetaHuman(amountToMint, {
          value: parseEther(tokenPrice * (amountToMint - 1)),
        })
      ).to.be.revertedWith("Insufficent ether value");
    });

    it("Should mint NFT to sender - Public(single)", async function () {
      const mintTx = await metaHuman
        .connect(addr1)
        .mintMetaHuman(1, { value: parseEther(tokenPrice) });

      await mintTx.wait();

      expect(await metaHuman.connect(addr1).ownerOf(1)).to.equal(addr1.address);
    });

    it("Should mint NFT to sender - Public(multiple)", async function () {
      const mintTx = await metaHuman
        .connect(addr2)
        .mintMetaHuman(4, { value: parseEther(tokenPrice * 4) });

      await mintTx.wait();

      [2, 3, 4, 5].forEach(async (index) => {
        expect(await metaHuman.connect(addr2).ownerOf(index)).to.equal(
          addr2.address
        );
      });
    });

    it("Should mint NFT to sender - Whitelist(single)", async function () {
      const mintTx = await metaHuman
        .connect(whitelistAddr)
        .mintWhitelistMetaHuman(getMerkleProof(whitelistAddr.address), 1, {
          value: parseEther(tokenPrice),
        });

      await mintTx.wait();

      expect(await metaHuman.connect(whitelistAddr).ownerOf(6)).to.equal(
        whitelistAddr.address
      );
    });

    it("Should refund if sent ether value is bigger than price", async function () {
      const mintTx = await metaHuman
        .connect(addr2)
        .mintMetaHuman(1, { value: parseEther(tokenPrice + 0.5) });

      await mintTx.wait();

      await expect(mintTx).to.changeEtherBalance(
        addr2,
        parseEther(-tokenPrice)
      );
    });

    it("Should not mint NFT if claimed already- Whitelist(single)", async function () {
      await expect(
        metaHuman
          .connect(whitelistAddr)
          .mintWhitelistMetaHuman(getMerkleProof(whitelistAddr.address), 1, {
            value: parseEther(tokenPrice),
          })
      ).to.be.revertedWith("already claimed");
    });

    it("Should return the placeholder if base uri not set", async function () {
      expect(await metaHuman.tokenURI(1)).to.equal(placeholder);
      expect(await metaHuman.tokenURI(2)).to.equal(placeholder);

      await expect(metaHuman.tokenURI(99999)).to.be.revertedWith(
        "URIQueryForNonexistentToken()"
      );
    });

    it("Should return the right base uri for each token", async function () {
      const setBaseURITx = await metaHuman.setBaseURI(baseURI);
      await setBaseURITx.wait();

      expect(await metaHuman.tokenURI(1)).to.equal(baseURI + "1");
      expect(await metaHuman.tokenURI(2)).to.equal(baseURI + "2");

      await expect(metaHuman.tokenURI(99999)).to.be.revertedWith(
        "URIQueryForNonexistentToken()"
      );
    });
  });

  describe("Minting - Owner", function () {
    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();
    });

    it("Should fail if sender is not owner", async function () {
      await expect(
        metaHuman.connect(addr1).reserveMetaHuman(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should mint NFT to owner", async function () {
      const mintTx = await metaHuman.reserveMetaHuman(10);

      await mintTx.wait();

      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(async (index) => {
        expect(await metaHuman.ownerOf(index)).to.equal(owner.address);
      });
    });

    it("Should fail if mint amount exceed max supply", async function () {
      await expect(metaHuman.reserveMetaHuman(9999)).to.be.revertedWith(
        "Purchase would exceed max supply"
      );
    });
  });

  describe("Withdraw", async function () {
    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();

      const startMintSaleTx = await metaHuman.startPublicMint(
        maxMintAmount,
        parseEther(tokenPrice)
      );
      await startMintSaleTx.wait();

      const reserveMintTx = await metaHuman.mintMetaHuman(5, {
        value: parseEther(tokenPrice * 5),
      });
      await reserveMintTx.wait();
    });

    it("Should fail if sender is not owner", async function () {
      await expect(metaHuman.connect(addr1).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should return the right balance of withdrawn", async function () {
      const withdrawTx = await metaHuman.withdraw();

      await expect(withdrawTx).to.changeEtherBalance(
        owner,
        parseEther(tokenPrice * 5)
      );
    });
  });

  describe("Total Supply", function () {
    const reserveAmount = 5;
    const publicMintAmount = 990;
    const whitelistMintAmount = 5;
    const mintedAmount = 1000;

    this.beforeAll(async function () {
      [owner, addr1, addr2, whitelistAddr, ...addrs] =
        await ethers.getSigners();

      const metaHumanContract = await ethers.getContractFactory("MetaHuman");

      metaHuman = await metaHumanContract.deploy("MetaHuman", "MHAF", 10000);
      await metaHuman.deployed();

      const startPublicMintSaleTx = await metaHuman.startPublicMint(
        1000,
        parseEther(tokenPrice)
      );
      await startPublicMintSaleTx.wait();

      const whitelistAddresses = [whitelistAddr].map((addr) => addr.address);
      const startWhitelistMintSaleTx = await metaHuman.startWhitelistMint(
        1000,
        parseEther(tokenPrice),
        getMerkleRoot(whitelistAddresses)
      );
      await startWhitelistMintSaleTx.wait();

      const reserveMintTx = await metaHuman.mintMetaHuman(reserveAmount, {
        value: parseEther(tokenPrice * reserveAmount),
      });
      await reserveMintTx.wait();

      const mintTx = await metaHuman.mintMetaHuman(publicMintAmount, {
        value: parseEther(tokenPrice * publicMintAmount),
      });

      await mintTx.wait();

      const whitelistMintTx = await metaHuman
        .connect(whitelistAddr)
        .mintWhitelistMetaHuman(
          getMerkleProof(whitelistAddr.address),
          whitelistMintAmount,
          {
            value: parseEther(tokenPrice * whitelistMintAmount),
          }
        );

      await whitelistMintTx.wait();
    });

    it("Should return the right supply", async function () {
      expect(await metaHuman.totalSupply()).to.equal(mintedAmount);
    });
  });
});
