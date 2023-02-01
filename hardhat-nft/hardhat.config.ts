import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-deploy"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "hardhat-contract-sizer"
import "dotenv/config"
import "@nomiclabs/hardhat-ethers"

const GOERLI_RPC_URL =
  process.env.GOERLI_RPC_URL ||
  "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const MAINNET_RPC_URL =
  process.env.MAINNET_RPC_URL ||
  "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x YOUR PRIVATE KEY"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "your-api-key"
const COINMARKETCAP_API_KEY =
  process.env.COINMARKETCAP_API_KEY || "your-api-key"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_RPC_URL,
      },
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      chainId: 5,
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  mocha: {
    timeout: 300000, // 300 seconds max
  },
}
