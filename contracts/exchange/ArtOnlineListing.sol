// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import 'contracts/exchange/interfaces/IArtOnlineListing.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import 'contracts/exchange/interfaces/IArtOnlineExchangeFactory.sol';

contract ArtOnlineListing is IArtOnlineListing {
  address internal _factory;
  address internal _owner;
  address public contractAddress;
  uint256 private _tokenId;
  address private _currency;
  uint256 private _price;
  uint256 private _listed;

  constructor() {
    _factory = msg.sender;
  }

  event PriceChange(uint256 oldPrice, uint256 newPrice);
  event OwnerChange(address oldOwner, address newOwner);
  event Listed(uint256);

  function _buyWithNative(uint256 fee, address payable feeWallet) internal {
    address payable wallet = payable(_owner);
    wallet.transfer(msg.value - fee);
    feeWallet.transfer(fee);
  }

  function _buy(address receiver, uint256 fee, address feeReceiver) internal {
    if (msg.value != 0) {
      require(_currency == address(0), 'CURRENCY_NOT_NATIVE');
      require(msg.value >= _price, 'NOT_ENOUGH_COINS');
      _buyWithNative(fee, payable(feeReceiver));
    } else {
      _beforeTransfer(receiver);
      SafeERC20.safeTransferFrom(IERC20(_currency), receiver, _owner, _price - fee);
      SafeERC20.safeTransferFrom(IERC20(_currency), receiver, feeReceiver, fee);
    }
    IERC721(contractAddress).safeTransferFrom(feeReceiver, receiver, _tokenId);
    address oldOwner = _owner;
    _owner = receiver;
    _listed = 0;
    emit OwnerChange(oldOwner, _owner);
    emit Listed(_listed);
  }

  function buy(address receiver) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    uint256 fee = IArtOnlineExchangeFactory(_factory).feeFor(_price);
    address feeReceiver = IArtOnlineExchangeFactory(_factory).feeReceiver();
    _buy(receiver, fee, feeReceiver);
  }

  function _beforeTransfer(address receiver) internal {
    require(msg.sender != _owner, 'SELLER_OWN');
    uint256 balance = IERC20(_currency).balanceOf(receiver);
    require(balance >= _price, 'NOT_ENOUGH_TOKENS');
  }

  function initialize(address owner_, address contractAddress_, uint256 tokenId_, uint256 price_, address currency_) external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
    contractAddress = contractAddress_;
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
    require(msg.sender == _factory, 'NOT_ALLOWED');
    _listed = 0;
    emit Listed(0);
  }

  function list() external override {
    require(msg.sender == _factory, 'NOT_ALLOWED');
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
    _currency = currency_;
    _price = price_;
  }
}
