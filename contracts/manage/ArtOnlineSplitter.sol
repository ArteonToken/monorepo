// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import 'contracts/token/interfaces/IArtOnline.sol';
import 'contracts/exchange/interfaces/IWrappedCurrency.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import 'contracts/exchange/interfaces/IPanCakeRouter.sol';
import 'contracts/access/SetArtOnlineBase.sol';

contract ArtOnlineSplitter is SetArtOnlineBase {
  string[] internal _splits;
  mapping (string => uint256) internal _splitFor;
  mapping (string => address) internal _addressFor;

  constructor(
    address bridger,
    address access
  ) SetArtOnlineBase(bridger, access) {}

  function setSplitsBatch(string[] memory names, uint256[] memory splits_, address[] memory addresses) external onlyAdmin() {
    require(names.length == splits_.length && splits_.length == addresses.length, 'INVALID_LENGTH');
    for (uint256 i; i < names.length; i++) {
      _splits.push(names[i]);
      _splitFor[names[i]] = [splits_[i]];
    }
  }

  function setAddressesBatch(string[] memory names, address[] memory addresses) external onlyAdmin() {
    require(names.length == addresses.length, 'INVALID_LENGTH');
    for (uint256 i; i < names.length; i++) {
      _addressFor[names[i]] = addresses[i];
    }
  }

  function splitter(uint256 index) external pure returns (string memory) {
    return _splits[index];
  }

  function splits() external pure returns (uint256) {
    return _splits.length;
  }

  function splitFor(string memory receiver) external pure returns (uint256) {
    return _splitFor[receiver];
  }

  function addressFor(string memory receiver) external pure returns (address) {
    return _addressFor[receiver];
  }

  function split(address currency, uint256 amount) external {
    require(msg.sender == _addressFor('factory'), 'NOT_ALLOWED');
    uint256 partnerSplit = _calculateSplit(amount, 'partner');
    uint256 artOnlineSplit = _calculateSplit(amount, 'artOnline');
    uint256 burnSplit = _calculateSplit(artOnlineSplit, 'burn');
    uint256 marketingSplit = _calculateSplit(artOnlineSplit, 'marketing');
    uint256 liquiditySplit = _calculateSplit(artOnlineSplit, 'liquidity');

    _burnArtOnline(currency, burnSplit);
    _BuyPartner(currency, partnerSplit);

    SafeERC20(IERC20(currency)).safeTransferFrom(address(this), _addressFor('marketing'), marketingSplit);
    SafeERC20(IERC20(currency)).safeTransferFrom(address(this), _addressFor('liquidity'), liquiditySplit);
  }

  function _BuyPartner(address currency, uint256 amount) internal {
    address _partner = _addressFor('partner');
    address _router = _addressFor('router');
    address _partnerPool = _addressFor('partnerPool');

    address[] memory path = _getPath(currency, _partner);
    IERC20(currency).approve(_router, amount);
    IPanCakeRouter(_router).swapExactTokensForTokens(
      amount,
      _getAmountOutMin(currency, _partner, amount),
      _getPath(currency, _partner),
      address(this),
      block.timestamp + 60
    );
    SafeERC20(IERC20(_partner)).safeTransferFrom(address(this), _partnerPool, amount);
  }

  function _burnArtOnline(address currency, uint256 amount) internal {
    address _router = _addressFor('router');
    address _artOnline = _addressFor('artOnline');

    address[] memory path = _getPath(currency, _artOnline);
    IERC20(currency).approve(_router, amount);
    IPanCakeRouter(_router).swapExactTokensForTokens(
      amount,
      _getAmountOutMin(currency, _artOnline, amount),
      _getPath(currency, _artOnline),
      address(this),
      block.timestamp + 60
    );
    IArtOnline.burn(address(this), amount);
  }

  function _calculateSplit(uint256 amount, string memory splitReceiver) internal returns (uint256) {
    return (amount / 100) * _splitFor[splitReceiver];
  }

  function calculateSplit(uint256 amount, string memory splitReceiver) external returns (uint256) {
    return _calculateSplit(amount, splitReceiver);
  }

  function _getPath(address _tokenIn, address _tokenOut) internal returns (address[] memory path){
    address _wrappedCurrency = _addressFor('wrappedCurrency');
    if (_tokenIn == _wrappedCurrency || _tokenOut == _wrappedCurrency) {
      path = new address[](2);
      path[0] = _tokenIn;
      path[1] = _tokenOut;
    } else {
      path = new address[](3);
      path[0] = _tokenIn;
      path[1] = _wrappedCurrency;
      path[2] = _tokenOut;
    }
  }

  function _getAmountOutMin(address _tokenIn, address _tokenOut, uint256 _amountIn) internal view returns (uint256) {
    address[] memory path = _getPath(_tokenIn, _tokenOut);
    uint256[] memory amountOutMins = IPanCakeRouter(_addressFor('router')).getAmountsOut(_amountIn, path);
    return amountOutMins[path.length -1];
  }
}
