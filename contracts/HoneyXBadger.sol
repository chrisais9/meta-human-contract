// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "erc721a/contracts/ERC721A.sol";

contract HoneyXBadger is ERC721A, Ownable{
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public immutable maxSupply;
    uint256 public tokenPrice = 0.1 ether; //0.1 ETH


    mapping(address => bool) public claimed;

    string private placeholder = "https://ipfs.io/ipfs/QmQYTzPCpk7Hswtkzxck6f1eZhfHUEB9h892bMCFLeM2S7";
    string private baseUri;
    bytes32 private merkleRoot;
    
    uint public maxMintAmount = 0;
    
    bool public isWhitelistMintActive = false;
    bool public isPublicMintActive = false;
    bool private isLocked = false;

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
     * @notice Lock contract and make immutable
     */
    function lockContract() external onlyOwner {
        isLocked = true;
    }

    /**
     * @notice Starting token index
     */
    function _startTokenId() internal view virtual override(ERC721A) returns (uint256) {
        return 1;
    }

    /**
    * @notice Start public mint availability
    * @param _maxMintAmount Max amout to Mint
    * @param _tokenPrice Mint Price
    * @dev Callable by owner
    */
    function startPublicMint(uint _maxMintAmount, uint256 _tokenPrice) external onlyOwner {
        isPublicMintActive = true;
        maxMintAmount = _maxMintAmount;
        tokenPrice = _tokenPrice;
    }

    /**
    * @notice Start whitelist mint availability
    * @param _maxMintAmount Max amout to Mint
    * @param _tokenPrice Mint Price
    * @dev Callable by owner
    */
    function startWhitelistMint(uint _maxMintAmount, uint _tokenPrice) external onlyOwner {
        isWhitelistMintActive = true;
        maxMintAmount = _maxMintAmount;
        tokenPrice = _tokenPrice;
    }

    /**
    * @notice Pause public mint availability
    * @dev Callable by owner
    */
    function pauseWhitelistMint() external onlyOwner {
        isWhitelistMintActive = false;
    }

    /**
    * @notice Pause whitelist mint availability
    * @dev Callable by owner
    */
    function pausePublicMint() external onlyOwner {
        isPublicMintActive = false;
    }

    /**
     * @notice check if desired adress is whitelisted
     * @param merkleProof: merkle proof of sender address
     */
    function isWhitelisted(bytes32[] calldata merkleProof) public view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    /**
     * @notice Allows user to mint a token to a specific address if whitelisted
     * @param merkleProof: merkle proof of sender address
     * @param mintAmount: amount to mint token
     */
    function mintWhitelistHoneyBadger(bytes32[] calldata merkleProof, uint mintAmount) public payable {
        require(isWhitelistMintActive, "Mint is not active");
        require(mintAmount <= maxMintAmount, "Too greedy");
        require(totalSupply() + mintAmount <= maxSupply, "Purchase would exceed max supply");
        require(tokenPrice * mintAmount <= msg.value, "Insufficent ether value");
        require(isWhitelisted(merkleProof), "not whitelisted");
        require(claimed[msg.sender] == false, "already claimed");

        _safeMint(msg.sender, mintAmount);
        refundIfOver(tokenPrice * mintAmount);

        claimed[msg.sender] = true;
    }

    /**
     * @notice Allows user to mint a token to a specific address
     * @param mintAmount: amount to mint token
     */
    function mintHoneyBadger(uint mintAmount) public payable {
        require(isPublicMintActive, "Mint is not active");
        require(mintAmount <= maxMintAmount, "Too greedy");
        require(totalSupply() + mintAmount <= maxSupply, "Purchase would exceed max supply");
        require(tokenPrice * mintAmount <= msg.value, "Insufficent ether value");
        
        _safeMint(msg.sender, mintAmount);
        refundIfOver(tokenPrice * mintAmount);
    }

    /**
     * @notice Allows owner to mint a token to a specific address
     * @param mintAmount: amount to mint token
     * @dev Callable by owner
     */
    function reserveHoneyBadger(uint mintAmount) public onlyOwner {
        require(totalSupply() + mintAmount <= maxSupply, "Purchase would exceed max supply");
        _safeMint(msg.sender, mintAmount);
    }

    /**
     * @notice get base uri for unit test
     */
    function baseURI() public view returns (string memory) {
        return baseUri;
    }


    /**
     * @notice base uri for internal usage
     */
    function _baseURI() internal view override(ERC721A) returns (string memory) {
        return baseUri;
    }

    /**
     * @notice Allows the owner to set the base URI to be used for all token IDs
     * @param _uri: base URI
     * @dev Callable by owner
     */
    function setBaseURI(string memory _uri) external onlyOwner {
        require(!isLocked, "Contract is locked");
        baseUri = _uri;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721A) returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory uri = _baseURI();
        return bytes(uri).length != 0 ? string(abi.encodePacked(uri, tokenId.toString())) : placeholder;
    }

    /**
     * @notice refund if recieved ETH value is bigger than totalPrice
     * @param totalPrice: total price
     * @dev Callable by owner
     */
    function refundIfOver(uint256 totalPrice) private {
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
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
