export interface networkConfigItem {
  name?: string
  subscriptionId?: string
  keepersUpdateInterval?: string
  raffleEntranceFee?: string
  callbackGasLimit?: string
  vrfCoordinatorV2?: string
  gasLane?: string
  ethUsdPriceFeed?: string
  mintFee?: string
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    mintFee: "10000000000000000", // 0.01 ETH
    callbackGasLimit: "500000", // 500,000 gas
  },
  // goerli might not work here
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000", // 500,000 gas
    mintFee: "10000000000000000", // 0.01 ETH
    subscriptionId: "1002", // add your ID here!
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    mintFee: "10000000000000000", // 0.01 ETH
    subscriptionId: "5264",
  },
}

export const DECIMALS = "18"
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6

export const MIN_DELAY = 3600 // 1 hour
export const VOTING_DELAY = 1
export const VOTING_PERIOD = 5
export const QUORUM_PERCENTAGE = 4
export const NEW_STORE_VALUE = 77
export const FUNC = "store"
export const PROP_DESCRIPTION =
  "#1: Propose to change the value of the store variable to 77"
export const proposalsFile = "proposals.json"
