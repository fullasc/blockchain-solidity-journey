export interface networkConfigItem {
  ethUsdPriceFeed?: string
  blockConfirmations?: number
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/data-feeds/price-feeds/addresses/#Goerli%20Testnet
  // Default one is ETH/USD contract on Goerli
  goerli: {
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    blockConfirmations: 6,
  },
}

export const INITIAL_SUPPLY = "1000000000000000000000"

export const developmentChains = ["hardhat", "localhost"]
