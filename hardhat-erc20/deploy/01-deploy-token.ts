import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, INITIAL_SUPPLY } from "../helper-hardhat-config"
import verify from "../utils/verify"

module.exports = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  const args = [INITIAL_SUPPLY] // 50 tokens
  const ourToken = await deploy("OurToken", {
    from: deployer,
    args: args,
    log: true,
  })

  log(`OurToken deployed at ${ourToken.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying on etherscan...")
    await verify(ourToken.address, args)
  }
}

module.exports.tags = ["all", "token"]
