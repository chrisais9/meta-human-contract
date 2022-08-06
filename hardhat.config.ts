import * as dotenv from "dotenv";

import { MerkleTree } from "merkletreejs";
import { HardhatUserConfig, task, types } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "solidity-docgen";
import "hardhat-abi-exporter";
import { keccak256 } from "ethers/lib/utils";
import whitelist from "./whitelist.json";

require("hardhat-abi-exporter");
dotenv.config();

const deployedAddress = "...";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// npx hardhat sale --type public --status start --max 10 --price 0.1 --network baobab
// npx hardhat sale --type whitelist --status --merkleroot 0x23D21NDNEFEUURRLAPFIVNLZKDUE2343BR start --max 10 --price 0.1 --network baobab
task("sale", "mint sale status")
  .addOptionalParam(
    "type",
    "sale type (public, whitelist), defaults to public",
    "public",
    types.string
  )
  .addOptionalParam(
    "status",
    "mint status (start, pause), defaults to start",
    "start",
    types.string
  )
  .addOptionalParam("merkleroot", "Merkleroot of whitelist")
  .addOptionalParam("max", "Max mint amount", 5, types.int)
  .addOptionalParam("price", "Price per nft (unit: KLAY)", "0.1")
  .setAction(async ({ type, status, merkleroot, max, price }, hre) => {
    const METAHUMAN = await hre.ethers.getContractFactory("MetaHuman");
    const metaHuman = METAHUMAN.attach(deployedAddress);

    async function startPublicMint() {
      const tx = await metaHuman.startPublicMint(
        max,
        hre.ethers.utils.parseEther(price)
      );
      console.log(tx.hash);
      await tx.wait();
    }

    async function startWhitelistMint() {
      if (!merkleroot) {
        console.log("wrong argument: merkleroot missing");
        return;
      }
      const tx = await metaHuman.startWhitelistMint(
        max,
        hre.ethers.utils.parseEther(price),
        merkleroot
      );
      console.log(tx.hash);
      await tx.wait();
    }

    switch (status) {
      case "start":
        if (type === "public") {
          await startPublicMint();
          console.log("success");
        } else if (type === "whitelist") {
          await startWhitelistMint();
          console.log("success");
        } else {
          console.log("wrong argument: type");
        }
        break;
      case "pause":
        if (type === "public") {
          const tx = await metaHuman.pausePublicMint();
          console.log(tx.hash);
          await tx.wait();
          console.log("success");
        } else if (type === "whitelist") {
          const tx = await metaHuman.pauseWhitelistMint();
          console.log(tx.hash);
          await tx.wait();
          console.log("success");
        }
        break;

      default:
        console.log("wrong argument: status");
        break;
    }
  });

task("generatewl", "generate whitelist").setAction(async (taskArgs, hre) => {
  const whitelistAddress = whitelist.address;
  const leafNodes = whitelistAddress.map((addr) => keccak256(addr));

  const merkletree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  const rootHash = merkletree.getHexRoot();

  console.log("root:", rootHash.toString());
  console.log("======================");
  console.log(merkletree.toString());
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  docgen: {
    pages: "files",
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baobab: {
      url: "https://api.baobab.klaytn.net:8651",
      httpHeaders: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.KAS_ACCESS_ID + ":" + process.env.KAS_SECRECT_ACCESS_KEY
          ).toString("base64"),
        "x-chain-id": "1001",
      },
      accounts:
        process.env.DEPLOYER_BAOBAB !== undefined
          ? [process.env.DEPLOYER_BAOBAB]
          : [],
      chainId: 1001,
      gas: 2500000,
      gasPrice: 250000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "KRW",
    token: "KLAY",
    gasPrice: 250,
    coinmarketcap: process.env.COIN_MARKET_CAP_API,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  },
};

export default config;
