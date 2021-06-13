// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import './../../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import './../../node_modules/@openzeppelin/contracts/utils/Address.sol';
import './../../node_modules/@openzeppelin/contracts/utils/Context.sol';
import './../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol';
import './../../node_modules/@openzeppelin/contracts/utils/math/Math.sol';

contract Arteon is Context, IERC20Metadata {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint;
    using SafeMath for uint256;

    string private _name;
    string private _symbol;

    address public governance;
    mapping (address => bool) public minters;

    mapping (address => uint) private _balances;
    mapping (address => mapping (address => uint)) private _allowances;

    uint256 public percentSettings = 1; // = 0.001%
    uint private _totalSupply;

    constructor (string memory name_, string memory symbol_) {
      governance = msg.sender;
      _name = name_;
      _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
      return _name;
    }
    function symbol() public view virtual override returns (string memory) {
      return _symbol;
    }
    function decimals() public view virtual override returns (uint8) {
      return 18;
    }

    function totalSupply() public view virtual override returns (uint) {
        return _totalSupply;
    }
    function balanceOf(address account) public view virtual override returns (uint) {
        return _balances[account];
    }
    function transfer(address recipient, uint amount) public override returns (bool) {
        require(amount <= _balances[msg.sender]);
        require(recipient != address(0));

        uint256 tokensToBurn = burnPercentage(amount);
        uint256 tokensToTransfer = amount.sub(tokensToBurn);

        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(tokensToTransfer);

        _totalSupply = _totalSupply.sub(tokensToBurn);

        emit Transfer(msg.sender, recipient, tokensToTransfer);
        emit Transfer(msg.sender, address(0), tokensToBurn);
        return true;
    }
    function multiTransfer(address[] memory receivers, uint256[] memory amounts) public {
        for (uint256 i = 0; i < receivers.length; i++) {
        transfer(receivers[i], amounts[i]);
    }
  }
    function allowance(address owner, address spender) public view virtual override returns (uint) {
        return _allowances[owner][spender];
    }
    function burnPercentage(uint256 value) public view returns (uint256)  {
      uint256 c = SafeMath.add(value, percentSettings);
      uint256 d = SafeMath.sub(c,1);

      uint256 roundValue = SafeMath.mul(SafeMath.div(d, percentSettings), percentSettings);

      uint256 percentValue = roundValue.mul(percentSettings).div(100000); // = 0.001%
      return percentValue;
   }
    function approve(address spender, uint amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }
    function transferFrom(address sender, address recipient, uint amount) public override returns (bool) {
        require(amount <= _balances[sender]);
        require(amount <= _allowances[sender][msg.sender]);
        require(recipient != address(0));

        _balances[sender] = _balances[sender].sub(amount);

        uint256 tokensToBurn = burnPercentage(amount);
        uint256 tokensToTransfer = amount.sub(tokensToBurn);

        _balances[recipient] = _balances[recipient].add(tokensToTransfer);
        _totalSupply = _totalSupply.sub(tokensToBurn);

        _allowances[sender][msg.sender] = _allowances[sender][msg.sender].sub(amount);

        emit Transfer(sender, recipient, tokensToTransfer);
        emit Transfer(sender, address(0), tokensToBurn);

        return true;
    }
    function increaseAllowance(address spender, uint addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }
    function decreaseAllowance(address spender, uint subtractedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }
    function _transfer(address sender, address recipient, uint amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }
    function _mint(address account, uint amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }
    function _burn(address account, uint amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }
    function _approve(address owner, address spender, uint amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function mint(address account, uint256 amount) public {
        require(minters[msg.sender], "!minter");
        _mint(account, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external {
      require(amount <= _allowances[account][msg.sender]);
      _allowances[account][msg.sender] = _allowances[account][msg.sender].sub(amount);
      _burn(account, amount);
    }

    function setGovernance(address _governance) public {
      require(msg.sender == governance, "!governance");
      governance = _governance;
    }

    function addMinter(address _minter) public {
        require(msg.sender == governance, "!governance");
        minters[_minter] = true;
    }

    function removeMinter(address _minter) public {
        require(msg.sender == governance, "!governance");
        minters[_minter] = false;
    }
}
