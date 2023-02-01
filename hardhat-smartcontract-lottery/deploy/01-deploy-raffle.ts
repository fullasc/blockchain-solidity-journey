import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  networkConfigHelper,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait()
    subscriptionId = transactionReceipt.events[0].args.subId
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    )
  } else {
    vrfCoordinatorV2Address = networkConfigHelper[network.name].vrfCoordinatorV2
    subscriptionId = networkConfigHelper[network.name].subscriptionId
  }

  const entranceFee = networkConfigHelper[network.name].entranceFee
  const gasLane = networkConfigHelper[network.name].gasLane
  const callbackGasLimit = networkConfigHelper[network.name].callbackGasLimit
  const interval = networkConfigHelper[network.name].interval

  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ]
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations:
      networkConfigHelper[network.name].blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying on etherscan...")
    await verify(raffle.address, args)
  }

  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock?.addConsumer(subscriptionId, raffle.address)
  }

  log(`Raffle deployed at ${raffle.address}`)
}
module.exports.tags = ["all", "raffle"]
