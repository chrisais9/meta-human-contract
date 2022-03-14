/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HoneyXBadger } from '../typechain';

describe('HoneyXBadger', function () {
  const baseURI = 'https://ipfs.io/ipfs/QmXFepCgTVs4Yyo9J43bdgXrtGGxWnT3Jt6KDKxN4xEnzt/';

  const maxMintAmount = 5;
  const tokenPrice = ethers.utils.parseEther('0.1');

  let honeyXBadger: HoneyXBadger;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  this.beforeAll(async function () {
    const HoneyXBadgerContract = await ethers.getContractFactory('HoneyXBadger');

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    honeyXBadger = await HoneyXBadgerContract.deploy('HoneyXBadger', 'HXB', 10000);
    await honeyXBadger.deployed();
  });

  describe('Deployment', function () {
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
  });

  describe('Mint Sale Status', function () {
    it('Should sale status false by default', async function () {
      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });

    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).startMintSale(maxMintAmount, tokenPrice)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should start mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, tokenPrice);

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(true);
    });

    it('Should set the right max mint amount', async function () {
      expect(await honeyXBadger.maxMintAmount()).to.equal(maxMintAmount);
    });

    it('Should set the right mint price', async function () {
      expect(await honeyXBadger.tokenPrice()).to.equal(tokenPrice);
    });

    it('Should pause mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.pauseMintSale();

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(false);
    });
  });

  describe('Minting', function () {
    it('Should fail if mint sale is not started', async function () {
      await expect(honeyXBadger.mintHoneyBadger(1)).to.be.revertedWith('Mint is not active');
    });

    it('Should start mint sale', async function () {
      const startMintSaleTx = await honeyXBadger.startMintSale(maxMintAmount, tokenPrice);

      await startMintSaleTx.wait();

      expect(await honeyXBadger.isMintSaleActive()).to.equal(true);
    });

    it('Should fail mint amount is Bigger than max', async function () {
      await expect(honeyXBadger.mintHoneyBadger(9999)).to.be.revertedWith('Too greedy');
    });

    it('Should fail if insufficent ether value to mint - single', async function () {
      await expect(
        honeyXBadger.mintHoneyBadger(1, {
          value: ethers.utils.parseEther('0.001'),
        })
      ).to.be.revertedWith('Insufficent ether value');
    });

    it('Should fail if insufficent ether value to mint - multiple', async function () {
      await expect(
        honeyXBadger.mintHoneyBadger(4, {
          value: ethers.utils.parseEther('0.1'),
        })
      ).to.be.revertedWith('Insufficent ether value');
    });

    it('Should mint NFT to sender - single', async function () {
      const mintTx = await honeyXBadger.connect(addr1).mintHoneyBadger(1, { value: ethers.utils.parseEther('0.1') });

      await mintTx.wait();

      expect(await honeyXBadger.connect(addr1).ownerOf(1)).to.equal(addr1.address);
    });

    it('Should mint NFT to sender - multiple', async function () {
      const mintTx = await honeyXBadger.connect(addr2).mintHoneyBadger(4, { value: ethers.utils.parseEther('0.4') });

      await mintTx.wait();

      [2, 3, 4, 5].forEach(async (index) => {
        expect(await honeyXBadger.connect(addr2).ownerOf(index)).to.equal(addr2.address);
      });
    });

    it('Should return the right tokenURI', async function () {
      expect(await honeyXBadger.tokenURI(1)).to.equal(baseURI + '1');
      expect(await honeyXBadger.tokenURI(2)).to.equal(baseURI + '2');

      await expect(honeyXBadger.tokenURI(99999)).to.be.revertedWith('URIQueryForNonexistentToken()');
    });
  });

  describe('Minting - Owner', function () {
    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).reserveHoneyBadger(1)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should fail if mint amount exceed max supply', async function () {
      await expect(honeyXBadger.reserveHoneyBadger(10000)).to.be.revertedWith('Purchase would exceed max supply');
    });

    it('Should mint NFT to owner - multiple', async function () {
      const mintTx = await honeyXBadger.mintHoneyBadger(4, { value: ethers.utils.parseEther('0.4') });

      await mintTx.wait();

      [6, 7, 8, 9].forEach(async (index) => {
        expect(await honeyXBadger.ownerOf(index)).to.equal(owner.address);
      });
    });
  });

  describe('Withdraw', async function () {
    it('Should fail if sender is not owner', async function () {
      await expect(honeyXBadger.connect(addr1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should return the right balance of withdrawn', async function () {
      const withdrawTx = await honeyXBadger.withdraw();

      await expect(withdrawTx).to.changeEtherBalance(owner, ethers.utils.parseEther('0.9'));
    });
  });

  describe('Total Supply', function () {
    it('Should return the right supply', async function () {
      const mintTx = await honeyXBadger.reserveHoneyBadger(9991);

      await mintTx.wait();

      expect(await honeyXBadger.totalSupply()).to.equal(await honeyXBadger.maxSupply());
    });
  });
});
