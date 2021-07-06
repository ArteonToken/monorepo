interface IArteonMiner {
  function activateGPU(uint256 tokenId) external;
  function deactivateGPU(uint256 tokenId) external;
  function earned(address acount) external returns (uint256);
  function getReward(address account) external;
  function maxRewardPerGPU() external returns (uint256);
}
