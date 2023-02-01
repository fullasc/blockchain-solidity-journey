import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ADDRESS_ZERO } from "../helper-hardhat-config"

const setUpGovernanceContracts: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("*********** >> Set up roles...")

  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const cancellerRole = await timeLock.CANCELLER_ROLE()

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
  await proposerTx.wait()
  const cancellerTx = await timeLock.grantRole(cancellerRole, governor.address)
  await cancellerTx.wait()
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTx.wait()
  const revokeTx = await timeLock.revokeRole(adminRole, deployer)
  await revokeTx.wait()
}

export default setUpGovernanceContracts
setUpGovernanceContracts.tags = ["all", "setupgovernancecontract", "main"]
