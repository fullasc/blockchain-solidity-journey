import { ethers, network } from "hardhat"
import {
  developmentChains,
  FUNC,
  NEW_STORE_VALUE,
  proposalsFile,
  PROP_DESCRIPTION,
  VOTING_DELAY,
} from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"
import * as fs from "fs"

export async function propose(
  args: any[],
  functionToCall: string,
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract")
  const box = await ethers.getContract("Box")

  // address[] memory targets,
  // uint256[] memory values,
  // bytes[] memory calldatas,
  // string memory description
  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  )
  console.log(`Proposing ${functionToCall} on ${box.address} with args ${args}`)
  console.log(`Proposal Description: ${proposalDescription}`)
  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  )
  const proposeReceipt = await proposeTx.wait()

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1)
  }

  const proposalId = proposeReceipt.events[0].args.proposalId
  console.log(`Proposal ID: ${proposalId}`)

  const proposalState = await governor.state(proposalId)
  const proposalSnapShot = await governor.proposalSnapshot(proposalId)
  const proposalDeadline = await governor.proposalDeadline(proposalId)
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  proposals[network.config.chainId!.toString()].push(proposalId.toString())
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`)
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

propose([NEW_STORE_VALUE], FUNC, PROP_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
