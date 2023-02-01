import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployFunWithStorage: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("-----------------------------------------")
  log("Deploying FunWithStorage and waiting for confirmations...")
  const funWithStorage = await deploy("FunWithStorage", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(funWithStorage.address, [])
  }

  log("Loggin storage...")
  for (let i = 0; i < 10; i++) {
    log(
      `Location ${i}: ${await ethers.provider.getStorageAt(
        funWithStorage.address,
        i
      )}`
    )
  }

  // You can use this to trace!
  const trace = await network.provider.send("debug_traceTransaction", [
    funWithStorage.transactionHash,
  ])
  for (let structLog in trace.structLogs) {
    if (trace.structLogs[structLog].op == "SSTORE") {
      console.log(trace.structLogs[structLog])
    }
  }
  const firstelementLocation = ethers.utils.keccak256(
    "0x0000000000000000000000000000000000000000000000000000000000000002"
  )
  const arrayElement = await ethers.provider.getStorageAt(
    funWithStorage.address,
    firstelementLocation
  )
  log(`Location ${firstelementLocation}: ${arrayElement}`)
}

export default deployFunWithStorage
deployFunWithStorage.tags = ["funwithcontract"]
