// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "erc721a/contracts/ERC721A.sol";

contract MetaHuman is ERC721A, Ownable {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public immutable maxSupply;

    uint256 public tokenPublicPrice = 0.1 ether; //0.1 ETH
    uint256 public tokenWhitelistPrice = 0.1 ether; //0.1 ETH

    mapping(address => bool) public claimed;

    string public constant PLACEHOLDER =
        "https://ipfs.io/ipfs/Qme42XjH7tBpvqyCqQFoa6UmbXehnRbwk5NDVATCSVQvf3";
    string private baseUri;
    string private contractUri;
    bytes32 private merkleRoot;

    uint256 public maxPublicMintAmount = 0;
    uint256 public maxWhitelistMintAmount = 0;

    bool public isWhitelistMintActive = false;
    bool public isPublicMintActive = false;

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
        require(
            (_maxSupply == 100) ||
                (_maxSupply == 1000) ||
                (_maxSupply == 10000),
            "Operations: Wrong max supply"
        );
        maxSupply = _maxSupply;
    }

    /**
     * @notice Starting token index
     */
    function _startTokenId()
        internal
        view
        virtual
        override(ERC721A)
        returns (uint256)
    {
        return 1;
    }

    /**
     * @notice Start public mint availability
     * @param _maxMintAmount Max amout to Mint
     * @param _tokenPrice Mint Price
     * @dev Callable by owner
     */
    function startPublicMint(uint256 _maxMintAmount, uint256 _tokenPrice)
        external
        onlyOwner
    {
        isPublicMintActive = true;
        maxPublicMintAmount = _maxMintAmount;
        tokenPublicPrice = _tokenPrice;
    }

    /**
     * @notice Start whitelist mint availability
     * @param _maxMintAmount Max amout to Mint
     * @param _tokenPrice Mint Price
     * @dev Callable by owner
     */
    function startWhitelistMint(
        uint256 _maxMintAmount,
        uint256 _tokenPrice,
        bytes32 _merkleRoot
    ) external onlyOwner {
        isWhitelistMintActive = true;
        maxWhitelistMintAmount = _maxMintAmount;
        tokenWhitelistPrice = _tokenPrice;
        merkleRoot = _merkleRoot;
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
    function isWhitelisted(bytes32[] calldata merkleProof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    /**
     * @notice Allows user to mint a token to a specific address if whitelisted
     * @param merkleProof: merkle proof of sender address
     * @param mintAmount: amount to mint token
     */
    function mintWhitelistMetaHuman(
        bytes32[] calldata merkleProof,
        uint256 mintAmount
    ) public payable {
        require(isWhitelistMintActive, "Mint is not active");
        require(mintAmount <= maxWhitelistMintAmount, "Too greedy");
        require(
            totalSupply() + mintAmount <= maxSupply,
            "Purchase would exceed max supply"
        );
        require(
            tokenWhitelistPrice * mintAmount <= msg.value,
            "Insufficent ether value"
        );
        require(isWhitelisted(merkleProof), "not whitelisted");
        require(claimed[msg.sender] == false, "already claimed");

        _safeMint(msg.sender, mintAmount);
        refundIfOver(tokenWhitelistPrice * mintAmount);

        claimed[msg.sender] = true;
    }

    /**
     * @notice Allows user to mint a token to a specific address
     * @param mintAmount: amount to mint token
     */
    function mintMetaHuman(uint256 mintAmount) public payable {
        require(isPublicMintActive, "Mint is not active");
        require(mintAmount <= maxPublicMintAmount, "Too greedy");
        require(
            totalSupply() + mintAmount <= maxSupply,
            "Purchase would exceed max supply"
        );
        require(
            tokenPublicPrice * mintAmount <= msg.value,
            "Insufficent ether value"
        );

        _safeMint(msg.sender, mintAmount);
        refundIfOver(tokenPublicPrice * mintAmount);
    }

    /**
     * @notice Allows owner to mint a token to a specific address
     * @param mintAmount: amount to mint token
     * @dev Callable by owner
     */
    function reserveMetaHuman(uint256 mintAmount) public onlyOwner {
        require(
            totalSupply() + mintAmount <= maxSupply,
            "Purchase would exceed max supply"
        );
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
    function _baseURI()
        internal
        view
        override(ERC721A)
        returns (string memory)
    {
        return baseUri;
    }

    /**
     * @notice Allows the owner to set the base URI to be used for all token IDs
     * @param _uri: base URI
     * @dev Callable by owner
     */
    function setBaseURI(string memory _uri) external onlyOwner {
        baseUri = _uri;
    }

    /**
     * @notice token URI for each token. returns PLACEHOLDER if base URI is not set
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721A)
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory uri = _baseURI();
        return
            bytes(uri).length != 0
                ? string(abi.encodePacked(uri, tokenId.toString()))
                : PLACEHOLDER;
    }

    /**
     * @notice Allows the owner to set the contract URI
     * @param _uri: contract URI
     * @dev Callable by owner
     */
    function setContractURI(string memory _uri) external onlyOwner {
        contractUri = _uri;
    }

    /**
     * @notice Contract level URI for Opensea
     * see https://docs.opensea.io/docs/contract-level-metadata
     */
    function contractURI() public view returns (string memory) {
        return contractUri;
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
