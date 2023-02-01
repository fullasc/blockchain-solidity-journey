import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains } from "../helper-hardhat-config"

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9 // link per gas. calculated value based on the gas price of the chain

module.exports = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const args = [BASE_FEE, GAS_PRICE_LINK]

  if (developmentChains.includes(network.name)) {
    log("Deploying VRFCoordinatorV2 mocks...")
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: 1,
    })
    log("Mocks deployed!")
  }
}

module.exports.tags = ["all", "mocks"]
