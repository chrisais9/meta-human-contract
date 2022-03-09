// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HoneyXBadger is ERC721Enumerable, Ownable {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public immutable maxSupply;

    string public baseURI;

    bool public isMintActive = false;
    uint public maxTokenPurchase = 0;
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
    ) ERC721(_name, _symbol) {
        require((_maxSupply == 100) || (_maxSupply == 1000) || (_maxSupply == 10000), "Operations: Wrong max supply");
        maxSupply = _maxSupply;
    }

    /**
    * @notice toggles mint availability status, default is false
    * @dev Callable by owner
    */
    function toggleMintStatus() external onlyOwner {
        isMintActive = !isMintActive;
    }

    /**
     * @notice Allows user to mint a token to a specific address
     * @param tokenAmount: amount to mint token
     * @dev Callable by owner
     */
    function mintHoneyBadger(uint tokenAmount) public payable {
        require(isMintActive, "Mint is not active");
        require(maxTokenPurchase <= tokenAmount, "Too greedy" );
        require(totalSupply() + tokenAmount <= maxSupply, "Purchase would exceed max supply");
        require(tokenPrice * tokenAmount <= msg.value, "Insufficent ether value");

        for(uint i = 0; i < tokenAmount; i++) {
            uint256 mintIndex = totalSupply();
            if (totalSupply() < maxSupply) {
                _safeMint(msg.sender, mintIndex);
            }
        }
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
     * @notice Returns a list of token IDs owned by `user` given a `cursor` and `size` of its token list
     * @param user: address
     * @param cursor: cursor
     * @param size: size
     */
    function tokensOfOwnerBySize(
        address user,
        uint256 cursor,
        uint256 size
    ) external view returns (uint256[] memory, uint256) {
        uint256 length = size;
        if (length > balanceOf(user) - cursor) {
            length = balanceOf(user) - cursor;
        }

        uint256[] memory values = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            values[i] = tokenOfOwnerByIndex(user, cursor + i);
        }

        return (values, cursor + length);
    }

    /**
     * @notice Returns the Uniform Resource Identifier (URI) for a token ID
     * @param tokenId: token ID
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }
}
