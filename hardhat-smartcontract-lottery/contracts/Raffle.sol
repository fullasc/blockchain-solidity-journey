// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

// Enter the lottery (paying some amount)
// Pick a winner (randomly)
// Winner to be selected every X minutes --> completly automated

// Chainlink Oracle -> Randomness, Automated Execution (Chainlink Keeper)

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__RaffleNotOpen();
error Raffle_UpkeepNotNeeded(
  uint256 currentBalance,
  uint256 numPlayers,
  uint256 raffleState
);

/**
 * @title A sample Raffle contract
 * @author Anthony Schmitt
 * @notice This contract is a sample implementation of a raffle
 * @dev this implements the Chainlink Keeper and VRFCoordinator interfaces
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
  /* Type declaration */
  enum RaffleState {
    OPEN,
    CALCULATING
  }

  /* State variables */
  uint256 private immutable i_entranceFee;
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane;
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  address payable[] private s_players;
  uint16 private constant REQUEST_CONFIRMATION = 3;
  uint32 private constant NUM_WORDS = 1;
  uint256 private immutable i_interval;

  // Lottery variables
  address private s_recentWinner;
  RaffleState private s_raffleState;
  uint256 private s_lastTimeStamp;

  /* Events */
  event RaffleEntered(address indexed player, uint256 amount);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  /**
   * @dev Constructor
   * @param _entranceFee The entrance fee to enter the raffle
   */
  constructor(
    address vrfCoordinatorV2,
    uint256 _entranceFee,
    bytes32 gasLane,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint256 interval
  ) VRFConsumerBaseV2(vrfCoordinatorV2) {
    i_entranceFee = _entranceFee;
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_raffleState = RaffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = interval;
  }

  /**
   * @notice Enter the raffle
   * @dev The caller must send the entrance fee
   */
  function enterRaffle() public payable {
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }
    if (s_raffleState != RaffleState.OPEN) {
      revert Raffle__RaffleNotOpen();
    }
    s_players.push(payable(msg.sender));
    emit RaffleEntered(msg.sender, msg.value);
  }

  /**
   * @notice This is the function that Chainlink Keeper will call.
   * Then look for upkeedNeeded to return true
   * The following should be true in order to return true:
   * 1. Our time internval should have passed
   * 2. The lottery should have at least 1 player, and have some ETH
   * 3. Our subscription is funded with LINK
   * 4. The lottery should be in an "open" state
   */
  function checkUpkeep(
    bytes memory /* checkData*/
  )
    public
    override
    returns (
      bool upkeepNeeded,
      bytes memory /* performData */
    )
  {
    bool isOpen = RaffleState.OPEN == s_raffleState;
    bool timePassed = (block.timestamp - s_lastTimeStamp) >= i_interval;
    bool hasPlayers = s_players.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
    return (upkeepNeeded, "");
  }

  /**
   * @notice Pick a winner
   * @dev The winner is picked randomly
   */
  function performUpkeep(
    bytes calldata /* performData */
  ) external override {
    (bool upkeepNeeded, ) = checkUpkeep("");
    if (!upkeepNeeded) {
      revert Raffle_UpkeepNotNeeded(
        address(this).balance,
        s_players.length,
        uint256(s_raffleState)
      );
    }
    // Request the random number
    s_raffleState = RaffleState.CALCULATING;
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane, // gasLane
      i_subscriptionId,
      REQUEST_CONFIRMATION,
      i_callbackGasLimit,
      NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);
  }

  /**
   * @notice Callback function used by VRF Coordinator
   * @dev This function is called by the VRF Coordinator when the random number is ready
   */
  function fulfillRandomWords(
    uint256, /*requestId*/
    uint256[] memory randomWords
  ) internal override {
    // Pick a winner
    uint256 winnerIndex = randomWords[0] % s_players.length;
    address payable winner = s_players[winnerIndex];
    s_recentWinner = winner;
    s_raffleState = RaffleState.OPEN;
    s_players = new address payable[](0);
    s_lastTimeStamp = block.timestamp;
    (bool success, ) = winner.call{value: address(this).balance}("");
    if (!success) {
      revert Raffle__TransferFailed();
    }
    emit WinnerPicked(winner);
  }

  /* View / Pure functions */

  /**
   * @notice Returns the entrance fee
   */
  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  /**
   * @dev returns the VRF coordinator
   */
  function getVrfCoordinator() public view returns (address) {
    return address(i_vrfCoordinator);
  }

  /**
   * @dev returns the gas lane
   */
  function getGasLane() public view returns (bytes32) {
    return i_gasLane;
  }

  /**
   * @dev returns the subscription id
   */
  function getSubscriptionId() public view returns (uint64) {
    return i_subscriptionId;
  }

  /**
   * @dev returns the callback gas limit
   */
  function getCallbackGasLimit() public view returns (uint32) {
    return i_callbackGasLimit;
  }

  /**
   * @notice return a player address at a given index
   */
  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }

  /**
   * @return the recent winner
   */
  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  /**
   * @return the interval between each raffle
   */
  function getInterval() public view returns (uint256) {
    return uint256(i_interval);
  }

  /**
   * @return the raffle state
   */
  function getRaffleState() public view returns (RaffleState) {
    return s_raffleState;
  }

  /**
   * @return the last timestamp
   */
  function getLatestTimestamp() public view returns (uint256) {
    return s_lastTimeStamp;
  }

  /**
   * @return the number of words
   */
  function getNumWords() public pure returns (uint256) {
    return NUM_WORDS;
  }

  /**
   * @return the number of players
   */
  function getNumberOfPlayers() public view returns (uint256) {
    return s_players.length;
  }

  /**
   * @return the number of confirmations
   */
  function getRequestConfirmations() public pure returns (uint32) {
    return REQUEST_CONFIRMATION;
  }
}
