// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "erc721a/contracts/ERC721A.sol";

contract HoneyXBadger is ERC721A, Ownable{
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public immutable maxSupply;

    string public baseURI;

    bool public isMintSaleActive = false;
    uint public maxMintAmount = 0;
    uint256 public tokenPrice = 100000000000000000; //0.1 ETH

    /**
     * @notice Constructor
     * @param _name: NFT name
     * @param _symbol: NFT symbol
     * @param _maxSupply: NFT max totalSupply
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply
    ) ERC721A(_name, _symbol) {
        require((_maxSupply == 100) || (_maxSupply == 1000) || (_maxSupply == 10000), "Operations: Wrong max supply");
        maxSupply = _maxSupply;
    }

    /**
     * @notice Starting token index
     */
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    /**
    * @notice Start mint availability
    * @param _maxMintAmount Max amout to Mint
    * @param _tokenPrice Mint Price
    * @dev Callable by owner
    */
    function startMintSale(uint _maxMintAmount, uint256 _tokenPrice) external onlyOwner {
        isMintSaleActive = true;
        maxMintAmount = _maxMintAmount;
        tokenPrice = _tokenPrice;
    }

    /**
    * @notice Pause mint availability
    * @dev Callable by owner
    */
    function pauseMintSale() external onlyOwner {
        isMintSaleActive = false;
    }

    /**
     * @notice Allows user to mint a token to a specific address
     * @param mintAmount: amount to mint token
     */
    function mintHoneyBadger(uint mintAmount) public payable {
        require(isMintSaleActive, "Mint is not active");
        require(mintAmount <= maxMintAmount, "Too greedy");
        require(totalSupply() + mintAmount <= maxSupply, "Purchase would exceed max supply");
        require(tokenPrice * mintAmount <= msg.value, "Insufficent ether value");
        
        _safeMint(msg.sender, mintAmount);
    }

    function reserveHoneyBadger(uint mintAmount) public onlyOwner {
        require(totalSupply() + mintAmount <= maxSupply, "Purchase would exceed max supply");
        _safeMint(msg.sender, mintAmount);
    }

    /**
     * @notice Allows the owner to set the base URI to be used for all token IDs
     * @param _uri: base URI
     * @dev Callable by owner
     */
    function setBaseURI(string memory _uri) external onlyOwner {
        baseURI = _uri;
    }

    /**
     * @notice Returns the Uniform Resource Identifier (URI) for a token ID
     * @param tokenId: token ID
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        super.tokenURI(tokenId);

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    /**
     * @notice Withdraw token to caller
     * @dev Callable by owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
