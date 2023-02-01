import { ethers, network } from "hardhat"
import {
  developmentChains,
  FUNC,
  MIN_DELAY,
  NEW_STORE_VALUE,
  PROP_DESCRIPTION,
} from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"
import moveTime from "../utils/move-time"

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE]
  const functionToCall = FUNC
  const box = await ethers.getContract("Box")
  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  )
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROP_DESCRIPTION)
  )
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContract("GovernorContract")
  console.log(
    `Queueing and executing proposal with description hash ${descriptionHash}`
  )

  const queueTx = await governor.queue(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await queueTx.wait()

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log(`Executing queued proposal...`)

  // THIS WILL FAIL ON TESTNET BECAUSE YOU NEED TO WAIT FOR THE MIN_DELAY
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )

  await executeTx.wait()
  const boxNewValue = await box.retrieve()
  console.log(`Box value after execution: ${boxNewValue}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
