import "dotenv/config"
import "@nomiclabs/hardhat-etherscan"
import "./tasks/block-number"
import "./tasks/accounts"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL =
  process.env.GOERLI_RPC_URL ||
  "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x YOUR PRIVATE KEY"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "your-api-key"
const COINMARKETCAP_API_KEY =
  process.env.COINMARKETCAP_API_KEY || "your-api-key"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
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
    // token: "MATIC",
  },
  solidity: "0.8.8",
}
