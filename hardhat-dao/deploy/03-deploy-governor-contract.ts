import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  QUORUM_PERCENTAGE,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployGovernor: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await get("GovernanceToken")
  const timeLock = await get("TimeLock")

  log("------------------> Deploying GovernorContract")

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const args = [
    governanceToken.address,
    timeLock.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
  ]
  const governorContract = await deploy("GovernorContract", {
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
    await verify(governorContract.address, args)
  }
}

export default deployGovernor
deployGovernor.tags = ["all", "governor", "main"]
