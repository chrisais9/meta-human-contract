/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line node/no-extraneous-import
import { BigNumber } from '@ethersproject/bignumber';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HoneyXBadger } from '../typechain';

describe('HoneyXBadger', function () {
  const baseURI = 'https://ipfs.io/ipfs/QmXFepCgTVs4Yyo9J43bdgXrtGGxWnT3Jt6KDKxN4xEnzt/';
  const placeholder = 'https://ipfs.io/ipfs/QmQYTzPCpk7Hswtkzxck6f1eZhfHUEB9h892bMCFLeM2S7';

  const maxMintAmount = 5;
  const tokenPrice = 0.1;

  let honeyXBadger: HoneyXBadger;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  describe('Deployment', function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();
    });

    it('Should set the right owner', async function () {
      expect(await honeyXBadger.owner()).to.equal(owner.address);
    });
    it('Should return right name', async function () {
      expect(await honeyXBadger.name()).to.equal('HoneyXBadger');
    });
    it('Should return right symbol', async function () {
      expect(await honeyXBadger.symbol()).to.equal('HXB');
    });
    it('Should return right max supply', async function () {
      expect(await honeyXBadger.maxSupply()).to.equal(10000);
    });
  });

  describe('Base URI', function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();
    });

    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).setBaseURI(baseURI)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should set the right BaseURI', async function () {
      const setBaseURITx = await honeyXBadger.setBaseURI(baseURI);

      await setBaseURITx.wait();

      expect(await honeyXBadger.baseURI()).to.equal(baseURI);
    });

    it('Should revert if contract is locked', async function () {
      const lockTx = await honeyXBadger.lockContract();
      await lockTx.wait();

      await expect(honeyXBadger.setBaseURI(baseURI)).to.be.revertedWith('Contract is locked');
    });
  });

  describe('Mint Sale Status', function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();
    });

    it('Should sale status false by default', async function () {
      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });

    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).startMintSale(maxMintAmount, parseEther(tokenPrice))).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should start mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, parseEther(tokenPrice));

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(true);
    });

    it('Should set the right max mint amount', async function () {
      expect(await honeyXBadger.maxMintAmount()).to.equal(maxMintAmount);
    });

    it('Should set the right mint price', async function () {
      expect(await honeyXBadger.tokenPrice()).to.equal(parseEther(tokenPrice));
    });

    it('Should pause mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.pauseMintSale();

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });
  });

  describe('Minting', function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();
    });

    it('Should fail if mint sale is not started', async function () {
      await expect(honeyXBadger.mintHoneyBadger(1)).to.be.revertedWith('Mint is not active');
    });

    it('Should start mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, parseEther(tokenPrice));

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(true);
    });

    it('Should fail mint amount is Bigger than max', async function () {
      await expect(honeyXBadger.mintHoneyBadger(9999)).to.be.revertedWith('Too greedy');
    });

    it('Should fail if insufficent ether value to mint', async function () {
      const amountToMint = 4;
      await expect(
        honeyXBadger.mintHoneyBadger(amountToMint, {
          value: parseEther(tokenPrice * (amountToMint - 1)),
        })
      ).to.be.revertedWith('Insufficent ether value');
    });

    it('Should mint NFT to sender - single', async function () {
      const mintTx = await honeyXBadger.connect(addr1).mintHoneyBadger(1, { value: parseEther(tokenPrice) });

      await mintTx.wait();

      expect(await honeyXBadger.connect(addr1).ownerOf(1)).to.equal(addr1.address);
    });

    it('Should mint NFT to sender - multiple', async function () {
      const mintTx = await honeyXBadger.connect(addr2).mintHoneyBadger(4, { value: parseEther(tokenPrice * 4) });

      await mintTx.wait();

      [2, 3, 4, 5].forEach(async (index) => {
        expect(await honeyXBadger.connect(addr2).ownerOf(index)).to.equal(addr2.address);
      });
    });

    it('Should refund if sent ether value is bigger than price', async function () {
      const mintTx = await honeyXBadger.connect(addr2).mintHoneyBadger(1, { value: parseEther(tokenPrice + 0.5) });

      await mintTx.wait();

      await expect(mintTx).to.changeEtherBalance(addr2, parseEther(-tokenPrice));
    });

    it('Should return the placeholder if base uri not set', async function () {
      expect(await honeyXBadger.tokenURI(1)).to.equal(placeholder);
      expect(await honeyXBadger.tokenURI(2)).to.equal(placeholder);

      await expect(honeyXBadger.tokenURI(99999)).to.be.revertedWith('URIQueryForNonexistentToken()');
    });

    it('Should return the right base uri for each token', async function () {
      const setBaseURITx = await honeyXBadger.setBaseURI(baseURI);
      await setBaseURITx.wait();

      expect(await honeyXBadger.tokenURI(1)).to.equal(baseURI + '1');
      expect(await honeyXBadger.tokenURI(2)).to.equal(baseURI + '2');

      await expect(honeyXBadger.tokenURI(99999)).to.be.revertedWith('URIQueryForNonexistentToken()');
    });
  });

  describe('Minting - Owner', function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();

      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, parseEther(tokenPrice));
      await startMintSaleTx.wait();
    });

    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).reserveHoneyBadger(1)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should mint NFT to owner', async function () {
      const mintTx = await honeyXBadger.reserveHoneyBadger(10);

      await mintTx.wait();

      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(async (index) => {
        expect(await honeyXBadger.ownerOf(index)).to.equal(owner.address);
      });
    });

    it('Should fail if mint amount exceed max supply', async function () {
      await expect(honeyXBadger.reserveHoneyBadger(9999)).to.be.revertedWith('Purchase would exceed max supply');
    });
  });

  describe('Withdraw', async function () {
    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();

      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, parseEther(tokenPrice));
      await startMintSaleTx.wait();

      const reserveMintTx = await honeyXBadger.mintHoneyBadger(5, { value: parseEther(tokenPrice * 5) });
      await reserveMintTx.wait();
    });

    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return the right balance of withdrawn', async function () {
      const withdrawTx = await honeyXBadger.withdraw();

      await expect(withdrawTx).to.changeEtherBalance(owner, parseEther(tokenPrice * 5));
    });
  });

  describe('Total Supply', function () {
    const mintedAmount = 1000;

    this.beforeAll(async function () {
      const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
      await honeyXBadger.deployed();

      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, parseEther(tokenPrice));
      await startMintSaleTx.wait();

      const reserveMintTx = await honeyXBadger.reserveHoneyBadger(mintedAmount);
      await reserveMintTx.wait();
    });

    it('Should return the right supply', async function () {
      expect(await honeyXBadger.totalSupply()).to.equal(mintedAmount);
    });
  });
});

function parseEther(ether: number): BigNumber {
  return ethers.utils.parseUnits(ether.toString(), 18);
}
