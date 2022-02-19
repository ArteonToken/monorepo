// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import './interfaces/IArtOnlineListing.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import './interfaces/IArtOnlineExchangeFactory.sol';
import './../manage/interfaces/IArtOnlineSplitter.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract ArtOnlineListing is IArtOnlineListing, IERC721Receiver {
  address internal _factory;
  address internal _owner;
  address internal _contractAddress;
  uint256 internal _tokenId;
  address internal _currency;
  uint256 internal _price;
  uint256 internal _listed;
  address internal _splitter;

  constructor() {
    _factory = msg.sender;
  }

  event PriceChange(uint256 oldPrice, uint256 newPrice);
  event OwnerChange(address oldOwner, address newOwner);
  event Listed(uint256);

  function _buyWithCurrency(address receiver, uint256 fee, address feeReceiver) internal {
    if (_splitter != address(0)) {
      SafeERC20.safeTransferFrom(IERC20(_currency), receiver, _splitter, _price - fee);
      IArtOnlineSplitter(_splitter).split(_currency, _price - fee);
    } else {
      SafeERC20.safeTransferFrom(IERC20(_currency), receiver, _owner, _price - fee);
    }
    SafeERC20.safeTransferFrom(IERC20(_currency), receiver, feeReceiver, fee);
  }

  function _buyWithNative(uint256 fee, address payable feeWallet) internal {
    require(_currency == address(0), 'CURRENCY_NOT_NATIVE');
    require(msg.value >= _price, 'NOT_ENOUGH_COINS');
    uint256 amount = msg.value - fee;
    if (_splitter != address(0)) {
      IArtOnlineSplitter(_splitter).split{value: amount}(_currency, _price - fee);
    } else {
      address payable wallet = payable(_owner);
      wallet.transfer(amount);
    }
    feeWallet.transfer(fee);
  }

  function _buy(address receiver, uint256 fee, address feeReceiver) internal {
    if (msg.value != 0) {
      require(_currency == address(0), 'CURRENCY_NOT_NATIVE');
      require(msg.value >= _price, 'NOT_ENOUGH_COINS');
      _buyWithNative(fee, payable(feeReceiver));
    } else {
      uint256 balance = IERC20(_currency).balanceOf(receiver);
      require(balance >= _price, 'NOT_ENOUGH_TOKENS');
      _buyWithCurrency(receiver, fee, feeReceiver);
    }
    IERC721(_contractAddress).safeTransferFrom(address(this), receiver, _tokenId);
    address oldOwner = _owner;
    _owner = receiver;
    _listed = 0;
    emit OwnerChange(oldOwner, _owner);
    emit Listed(_listed);
  }

  function buy(address receiver) external virtual override payable {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    uint256 fee = IArtOnlineExchangeFactory(_factory).feeFor(_price);
    address feeReceiver = IArtOnlineExchangeFactory(_factory).feeReceiver();
    _buy(receiver, fee, feeReceiver);
  }

  function initialize(address owner_, address contractAddress_, uint256 tokenId_, uint256 price_, address currency_) external {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    _contractAddress = contractAddress_;
    _tokenId = tokenId_;
    _price = price_;
    _currency = currency_;
    _owner = owner_;
    _listed = 1;
    emit OwnerChange(address(0), _owner);
    emit Listed(_listed);
  }

  function setPrice(uint256 amount) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    uint256 oldPrice = _price;
    _price = amount;

    emit PriceChange(oldPrice, _price);
  }

  function price() external view override returns (uint256) {
    return _price;
  }

  function isListed() external view override returns (bool) {
    return _listed == 0 ? false : true;
  }

  function listed() external view override returns (uint256) {
    return _listed;
  }

  function delist() external override {
    require(msg.sender == _owner, 'NOT_ALLOWED');
    _listed = 0;
    emit Listed(0);
  }

  function list() external override {
    require(msg.sender == _owner, 'NOT_ALLOWED');
    _listed = 1;
    emit Listed(1);
  }

  function factory() external view returns (address) {
    return _factory;
  }

  function tokenId() external view override returns (uint256) {
    return _tokenId;
  }

  function owner() external view override returns (address) {
    return _owner;
  }

  function setOwner(address owner_) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    address oldOwner = _owner;
    _owner = owner_;

    emit OwnerChange(oldOwner, _owner);
  }

  function currency() external view override returns (address) {
    return _currency;
  }

  function setCurrency(address currency_, uint256 price_) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    _currency = currency_;
    _price = price_;
  }

  function splitter() external view override returns (address) {
    return _splitter;
  }

  function setSplitter(address splitter_) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    _splitter = splitter_;
  }

  function contractAddress() external view override returns (address) {
    return _contractAddress;
  }

 function onERC721Received(
   address operator,
   address from,
   uint256 tokenId,
   bytes calldata data) external override returns (bytes4) {
     return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
   }
}
