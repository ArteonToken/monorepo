// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import './../../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol';
import './../../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import './../../node_modules/@openzeppelin/contracts/security/Pausable.sol';
import './../gpu/ArteonGPU.sol';
import './../token/interfaces/IArteonToken.sol';
import './ArteonListing.sol';

contract ArteonExchange is Ownable, Pausable {
  address public ARTEON_TOKEN;

  struct Listing {
    address owner;
    address gpu;
    uint256 tokenId;
    uint256 price;
    uint256 index;
  }

  address[] public listings;

  mapping (address => mapping(uint256 => address)) public getListing;
  mapping (address => Listing) public lists;

  event ListingCreated(address ArteonGPU, uint256 tokenId, address listing, uint, uint256 price);
  event Delist(address gpu, uint256 tokenId);
  event Buy(address gpu, uint256 tokenId, address listing, address owner, uint256 price);

  constructor(address token) {
    ARTEON_TOKEN = token;
  }

  modifier isListed(address gpu, uint256 tokenId) {
    address listing = getListing[gpu][tokenId];
    require(listing != address(0), 'ArteonExchange: NOT_LISTED');
    _;
  }

  function listingLength() external view returns (uint256) {
    return listings.length;
  }

  function list(address gpu, uint256 tokenId, uint256 price) external returns (address listing) {
    require(getListing[gpu][tokenId] == address(0), 'ArteonExchange: LISTING_EXISTS');
    require(IERC721(gpu).ownerOf(tokenId) == msg.sender, 'ArteonExchange: NOT_AN_OWNER');
    bytes memory bytecode = type(ArteonListing).creationCode;
    bytes32 salt = keccak256(abi.encodePacked(gpu, tokenId));
    assembly {
      listing := create2(0, add(bytecode, 32), mload(bytecode), salt)
    }

    getListing[gpu][tokenId] = listing;
    listings.push(listing);
    lists[listing].owner = msg.sender;
    lists[listing].gpu = gpu;
    lists[listing].price = price;
    lists[listing].tokenId = tokenId;
    lists[listing].index = listings.length - 1;

    emit ListingCreated(gpu, tokenId, listing, listings.length, price);
    return listing;
  }

  function forceDelist(address gpu, uint256 tokenId) external isListed(gpu, tokenId) onlyOwner {
    __removeListing(gpu, tokenId);
  }

  function delist(address gpu, uint256 tokenId) external isListed(gpu, tokenId) {
    _removeListing(gpu, tokenId, msg.sender);
  }

  function buy(address gpu, uint256 tokenId) external isListed(gpu, tokenId) {
    address listing = getListing[gpu][tokenId];
    require(IERC721(lists[listing].gpu).ownerOf(lists[listing].tokenId) == lists[listing].owner, 'ArteonExchange: SELLER_DOES_NOT_OWN');
    uint256 balance = IERC20(ARTEON_TOKEN).balanceOf(msg.sender);
    require(balance >= lists[listing].price, 'ArteonExchange: NOT_ENOUGH_TOKENS');

    SafeERC20.safeTransferFrom(IERC20(ARTEON_TOKEN), msg.sender, lists[listing].owner, lists[listing].price);
    IERC721(lists[listing].gpu).safeTransferFrom(lists[listing].owner, msg.sender, lists[listing].tokenId);
    _removeListing(gpu, tokenId, msg.sender);

    emit Buy(gpu, tokenId, listing, msg.sender, lists[listing].price);
  }

  function _removeListing(address gpu, uint256 tokenId, address owner) internal {
    require(IERC721(gpu).ownerOf(tokenId) == owner, 'ArteonExchange: NOT_AN_OWNER');
    __removeListing(gpu, tokenId);
  }

  function __removeListing(address gpu, uint256 tokenId) internal {
    address listing = getListing[gpu][tokenId];
    uint256 index = lists[listing].index;
    address lastListing = listings[listings.length - 1];
    listings[index] = lastListing;
    lists[lastListing].index = index;
    listings.pop();
    getListing[gpu][tokenId] = address(0);
    emit Delist(gpu, tokenId);
  }

  function setPrice(address gpu, uint256 tokenId, uint256 price) external isListed(gpu, tokenId) {
    require(IERC721(gpu).ownerOf(tokenId) == msg.sender, 'ArteonExchange: NOT_AN_OWNER');
    address listing = getListing[gpu][tokenId];
    lists[listing].price = price;
  }

  function getPrice(address gpu, uint256 tokenId) external isListed(gpu, tokenId) returns (uint256 price) {
    address listing = getListing[gpu][tokenId];
    return lists[listing].price;
  }

  function pause() external virtual whenNotPaused onlyOwner {
    super._pause();
  }

  function unpause() internal virtual whenPaused onlyOwner {
    super._unpause();
  }
}
