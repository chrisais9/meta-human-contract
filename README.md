<div align="center">
<img width="500" src="https://github.com/chrisais9/meta-human-contract/blob/master/images/header.jpg"/>
  <h1 align="center">
    <strong>MHAF</strong>
    <p>Meta Humans Always Fancy</p>
  </h1>
  <p align="center">contract written in solidity for klaytn</p>
  <p align="center"><b>Project Closed</b></p>
  <p align="center">Authored by Koo Hyong Mo</p>
  <a href="https://github.com/chrisais9/nft-generator" align="center">MHAF Generator</a>
</div>



## Prerequisite

`npm run test`
- Hardhat
- Solidity ^0.8.11

## Function

- Whitelist : Uses merkleproof algorithm to save gas consumption
- Reveal
- Mint

## Test

Using Mocha framework

Runs `npm run test` automatically using CI

See `/test` folder


## Gas Consumption

```
·----------------------------------------|---------------------------|-------------|-----------------------------·
|          Solc version: 0.8.12          ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·········································|···························|·············|······························
|  Methods                               ·              250 gwei/gas               ·       491.46 krw/klay       │
··············|··························|·············|·············|·············|···············|··············
|  Contract   ·  Method                  ·  Min        ·  Max        ·  Avg        ·  # calls      ·  krw (avg)  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  mintMetaHuman           ·      72365  ·    2007820  ·     379695  ·           13  ·      46.65  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  mintWhitelistMetaHuman  ·     107948  ·     115804  ·     111876  ·            4  ·      13.75  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  pausePublicMint         ·          -  ·          -  ·      28479  ·            2  ·       3.50  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  pauseWhitelistMint      ·          -  ·          -  ·      23700  ·            2  ·       2.91  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  reserveMetaHuman        ·          -  ·          -  ·      95601  ·            2  ·      11.75  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  setBaseURI              ·          -  ·          -  ·     114466  ·            4  ·      14.06  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  startPublicMint         ·      70296  ·      70308  ·      70299  ·            8  ·       8.64  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  startWhitelistMint      ·      75897  ·      75909  ·      75901  ·            6  ·       9.33  │
··············|··························|·············|·············|·············|···············|··············
|  MetaHuman  ·  withdraw                ·          -  ·          -  ·      30316  ·            2  ·       3.72  │
··············|··························|·············|·············|·············|···············|··············
|  Deployments                           ·                                         ·  % of limit   ·             │
·········································|·············|·············|·············|···············|··············
|  MetaHuman                             ·          -  ·          -  ·    2088555  ·          7 %  ·     256.61  │
·----------------------------------------|-------------|-------------|-------------|---------------|-------------·
```
