import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  networkConfig,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import verify from "../utils/verify"
import fs from "fs"

const deployDynamicSvgNft: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  let priceFeedAddress: string

  if (developmentChains.includes(network.name)) {
    // Deploy mocks
    const EthUsdAggregator = await deployments.get("MockV3Aggregator")
    priceFeedAddress = EthUsdAggregator.address
  } else {
    // Get addresses from network config
    priceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", "utf8")
  const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", "utf8")

  const args = [priceFeedAddress, lowSvg, highSvg]
  const dynamicNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
  })

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...")
    await verify(dynamicNft.address, args)
  }
}

export default deployDynamicSvgNft
deployDynamicSvgNft.tags = ["all", "dynamicsvgnft", "main"]
