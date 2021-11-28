// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

interface IPanCakeRouter {
   function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts);
}
