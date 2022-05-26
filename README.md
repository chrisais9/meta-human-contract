<div align="center">
<img width="300" src="https://www.mhaf.io/assets/icons/mhaf_full_black.svg"/>
  <h2 align="center">META HUMAN</h2>
  <p align="center">contract written in sol for klaytn</p>
  <p align="center">{Address}</p>
  <p align="center">Authored by Koo Hyong Mo</p>
</div>

# API

### maxSupply

```solidity
uint256 maxSupply
```

### tokenPrice

```solidity
uint256 tokenPrice
```

### claimed

```solidity
mapping(address &#x3D;&gt; bool) claimed
```

### placeholder

```solidity
string placeholder
```

### baseUri

```solidity
string baseUri
```

### merkleRoot

```solidity
bytes32 merkleRoot
```

### maxMintAmount

```solidity
uint256 maxMintAmount
```

### isWhitelistMintActive

```solidity
bool isWhitelistMintActive
```

### isPublicMintActive

```solidity
bool isPublicMintActive
```

### isLocked

```solidity
bool isLocked
```

### constructor

```solidity
constructor(string _name, string _symbol, uint256 _maxSupply) public
```

Constructor

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_name      | string  |             |
| \_symbol    | string  |             |
| \_maxSupply | uint256 |             |

### lockContract

```solidity
function lockContract() external
```

Lock contract and make immutable

### \_startTokenId

```solidity
function _startTokenId() internal view virtual returns (uint256)
```

Starting token index

### startPublicMint

```solidity
function startPublicMint(uint256 _maxMintAmount, uint256 _tokenPrice) external
```

Start public mint availability

_Callable by owner_

| Name            | Type    | Description       |
| --------------- | ------- | ----------------- |
| \_maxMintAmount | uint256 | Max amout to Mint |
| \_tokenPrice    | uint256 | Mint Price        |

### startWhitelistMint

```solidity
function startWhitelistMint(uint256 _maxMintAmount, uint256 _tokenPrice, bytes32 _merkleRoot) external
```

Start whitelist mint availability

_Callable by owner_

| Name            | Type    | Description       |
| --------------- | ------- | ----------------- |
| \_maxMintAmount | uint256 | Max amout to Mint |
| \_tokenPrice    | uint256 | Mint Price        |
| \_merkleRoot    | bytes32 |                   |

### pauseWhitelistMint

```solidity
function pauseWhitelistMint() external
```

Pause public mint availability

_Callable by owner_

### pausePublicMint

```solidity
function pausePublicMint() external
```

Pause whitelist mint availability

_Callable by owner_

### isWhitelisted

```solidity
function isWhitelisted(bytes32[] merkleProof) public view returns (bool)
```

check if desired adress is whitelisted

| Name        | Type      | Description |
| ----------- | --------- | ----------- |
| merkleProof | bytes32[] |             |

### mintWhitelistMetaHuman

```solidity
function mintWhitelistMetaHuman(bytes32[] merkleProof, uint256 mintAmount) public payable
```

Allows user to mint a token to a specific address if whitelisted

| Name        | Type      | Description |
| ----------- | --------- | ----------- |
| merkleProof | bytes32[] |             |
| mintAmount  | uint256   |             |

### mintMetaHuman

```solidity
function mintMetaHuman(uint256 mintAmount) public payable
```

Allows user to mint a token to a specific address

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| mintAmount | uint256 |             |

### reserveMetaHuman

```solidity
function reserveMetaHuman(uint256 mintAmount) public
```

Allows owner to mint a token to a specific address

_Callable by owner_

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| mintAmount | uint256 |             |

### baseURI

```solidity
function baseURI() public view returns (string)
```

get base uri for unit test

### \_baseURI

```solidity
function _baseURI() internal view returns (string)
```

base uri for internal usage

### setBaseURI

```solidity
function setBaseURI(string _uri) external
```

Allows the owner to set the base URI to be used for all token IDs

_Callable by owner_

| Name  | Type   | Description |
| ----- | ------ | ----------- |
| \_uri | string |             |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_See {IERC721Metadata-tokenURI}._

### refundIfOver

```solidity
function refundIfOver(uint256 totalPrice) private
```

refund if recieved ETH value is bigger than totalPrice

_Callable by owner_

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| totalPrice | uint256 |             |

### withdraw

```solidity
function withdraw() public
```

Withdraw token to caller

_Callable by owner_
