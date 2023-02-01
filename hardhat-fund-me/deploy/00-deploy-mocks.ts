import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

import { developmentChains } from "../helper-hardhat-config"

const DECIMALS = 8
const INITIAL_PRICE = "200000000000" // 2000

const deployMock: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    })
    log("Mocks deployed!")
    log("------------------------------------")
    log(
      "You are deploying to a local network you'll need a local network running to interact with the contracts"
    )
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contracts"
    )
    log("------------------------------------")
  }
}

export default deployMock
deployMock.tags = ["all", "mocks"]
