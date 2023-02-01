import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const boxDeploy: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("------------------> Deploying Box")

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
  })

  const timeLock = await ethers.getContract("TimeLock")
  const boxContract = await ethers.getContractAt("Box", box.address)
  const transferOwnershipTx = await boxContract.transferOwnership(
    timeLock.address
  )
  await transferOwnershipTx.wait()
  log(
    `Box deployed at ${box.address} and ownership transferred to ${timeLock.address}`
  )

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...")
    await verify(box.address, [])
  }
}

export default boxDeploy
boxDeploy.tags = ["all", "box", "main"]
