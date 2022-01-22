// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import './../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract Createables is ERC1155 {
  address internal _manager;
  uint256 internal _tokens;
  mapping (uint256 => address) internal _creators;
  mapping (uint256 => mapping(uint256 => string)) internal _uris;
  mapping (uint256 => uint256) internal _totalSupply;

  constructor() ERC1155('https://ipfs.io/ipfs/') {
    _manager = msg.sender;
  }

  modifier onlyManager() {
    require(msg.sender == _manager, 'NOT_MANAGER');
    _;
  }

  modifier onlyCreator(uint256 _token) {
    require(_creators[_token] == msg.sender, 'NOT_THE_CREATOR');
    _;
  }

  function _setMetadataURI(uint256 token_, uint256 id_, string memory uri_) internal {
    _uris[token_][id_] = uri_;
  }

  function setMetadataURI(uint256 token_, uint256 id_, string memory uri_) external onlyManager() {
    _setMetadataURI(token_, id_, uri_);
  }

  function uri(uint256 token, uint256 id_) public view virtual returns (string memory) {
    return string(abi.encodePacked('https://ipfs.io/ipfs/', _uris[token][id_]));
  }

  function create(address creator, string memory uri_) external {
    unchecked {
      _tokens += 1;
    }
    uint256 token_ = _tokens;
    _creators[token_] = creator;
    uint256 id_ = _totalSupply[token_] + 1;
    _setMetadataURI(token_, id_, uri_);
    _mint(creator, token_, id_, '');
  }

  function addCreation(address creator_, uint256 token_, string memory uri_) external onlyCreator(token_) {
    uint256 id_ = _totalSupply[token_] + 1;
    _setMetadataURI(token_, id_, uri_);
    _mint(creator_, token_, id_, '');
  }

  /**
   * @dev Total amount of tokens in with a given token_.
   */
  function totalSupply(uint256 token_) public view virtual returns (uint256) {
    return _totalSupply[token_];
  }

  /**
   * @dev Indicates whether any token exist with a given token_, or not.
   */
  function exists(uint256 token_) public view virtual returns (bool) {
    return _totalSupply[token_] > 0;
  }

  /**
   * @dev See {ERC1155-_beforeTokenTransfer}.
   */
  function _beforeTokenTransfer(
      address operator,
      address from,
      address to,
      uint256[] memory ids,
      uint256[] memory amounts,
      bytes memory data
  ) internal virtual override {
      super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

      if (from == address(0)) {
        for (uint256 i = 0; i < ids.length; ++i) {
          _totalSupply[ids[i]] += amounts[i];
        }
      }

      if (to == address(0)) {
        for (uint256 i = 0; i < ids.length; ++i) {
          _totalSupply[ids[i]] -= amounts[i];
        }
      }
  }
}
