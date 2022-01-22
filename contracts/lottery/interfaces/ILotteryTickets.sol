interface ILotteryTickets {
  function mintTickets(uint256 lotteryId, address to, uint256 amount, uint256[] calldata numbers_, uint256 lotterySize) external;
  function ownerOf(uint256 id, uint256 ticketId) external returns (address);
  function claim(uint256 id, uint256 ticketId) external returns (bool);
  function getTicketNumbers(uint256 tokenId) external returns (uint16[] memory);
  function claimed(uint256 id, uint256 ticketId) external returns (bool);
}
