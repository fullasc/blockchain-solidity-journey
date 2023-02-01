// SPDX-License-Identifier: MIT
// PRAGMA
pragma solidity ^0.8.0;
// IMPORTS
import "./PriceConverter.sol";
// ERROR
error FundMe__NotOwner();
error FundMe__NotEnoughETH();

// INTERFACES, LIBRARIES, CONTRACTS

/**
 * @title A contract for crowd funding
 * @author Anthony Schmitt
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
  // TYPES DECLARATION
  using PriceConverter for uint256;

  // STATE VARIABLES
  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;
  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 50 * 1e18;

  AggregatorV3Interface private s_priceFeed;

  // EVENTS

  // MODIFIERS
  /**
   * @notice Modifier to check if the caller is the owner
   * @dev This modifier is reverted with error FundMe__NotOwner() if the caller is not the owner
   */
  modifier onlyOwner() {
    //require(msg.sender == i_owner, "Sender is not owner");
    if (msg.sender != i_owner) {
      revert FundMe__NotOwner();
    }
    _;
  }

  // FUNCTIONS ORDERS: CONSTRUCTOR, RECEIVE, FALLBACK, EXTERNAL, PUBLIC, INTERNAL, PRIVATE, VIEW, PURE
  /**
   * @notice Constructor for the contract
   * @dev This constructor sets the owner and the price feed
   */
  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // Default function if someone sends this contract ETH without calling the fund function
  // receive()
  /**
   * @notice Default function if someone sends this contract ETH without calling the fund function
   */
  receive() external payable {
    fund();
  }

  // fallback()
  /**
   * @notice fallback function if someone sends this contract ETH without calling the fund function
   */
  fallback() external payable {
    if (msg.value > 0) {
      fund();
    }
  }

  /**
   * @notice This function is to fund the contract
   * @dev This function is payable
   */
  function fund() public payable {
    // Set a minimum funding value in USD
    // 1. How do we send ETH to this contract
    if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
      revert FundMe__NotEnoughETH();
    }
    s_funders.push(msg.sender);
    s_addressToAmountFunded[msg.sender] += msg.value;
  }

  // Withdraw funds method #3: *recommended* call: low level function which allows to call every function in the whole ethereum blockchain
  /**
   * @notice This function is to withdraw funds
   * @dev This function is callable only by the owner
   */
  function withdraw() public payable onlyOwner {
    resetFundersAndAmounts();

    // method #3: *recommended* call: low level function which allows to call every function in the whole ethereum blockchain
    //(bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  /**
   * @notice This function is to reset the funders and amounts
   * @dev This function is internal
   */
  function resetFundersAndAmounts() internal {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      // Reset amount funded
      s_addressToAmountFunded[funder] = 0;
    }
    // Reset funders array
    s_funders = new address[](0);
  }

  function cheaperWithdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      // Reset amount funded
      s_addressToAmountFunded[funder] = 0;
    }
    // Reset funders array
    s_funders = new address[](0);
    (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
    require(callSuccess, "Call failed");
  }

  // Withdraw funds method #1: transfer: try to send if error, revert
  // function withdrawTransfer() public onlyOwner {
  //     resetFundersAndAmounts();

  //     payable(msg.sender).transfer(address(this).balance);
  // }

  // Withdraw funds method #2: send: send and return a boolean true if success, false if error
  // function withdrawSend() public onlyOwner {
  //     resetFundersAndAmounts();

  //     bool sendSuccess = payable(msg.sender).send(address(this).balance);
  //     require(sendSuccess, "Send failed");
  // }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmountFunded(address funder)
    public
    view
    returns (uint256)
  {
    return s_addressToAmountFunded[funder];
  }

  function getPricefeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
