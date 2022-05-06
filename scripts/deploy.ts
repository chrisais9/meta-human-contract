import { ethers } from "hardhat";

async function main() {
  const maxSupply = 10000;
  const name = "MetaHuman";
  const symbol = "MHAF";

  const METAHUMAN = await ethers.getContractFactory("MetaHuman");
  const metaHuman = await METAHUMAN.deploy(name, symbol, maxSupply);

  await metaHuman.deployed();
  console.log("MetaHuman deployed to", metaHuman.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
