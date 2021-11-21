// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IArtOnlineAccess {
  function isAdmin(address account) external returns (bool);
  function isMinter(address account) external returns (bool);
}