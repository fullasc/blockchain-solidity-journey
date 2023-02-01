import * as fs from "fs"
import { ethers, network } from "hardhat"
import {
  developmentChains,
  proposalsFile,
  VOTING_PERIOD,
} from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"

const index = 0

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  const proposalId =
    proposals[network.config.chainId!.toString()][proposalIndex]
  // 0 = Against, 1 = For, 2 = Abstain
  const voteWay = 1
  const reason = "I like this proposal because ..."
  await vote(proposalId, voteWay, reason)
}

export async function vote(
  proposalId: string,
  voteWay: number,
  reason: string
) {
  console.log(
    `Voting on proposal ${proposalId} with ${voteWay} and reason ${reason}`
  )
  const governor = await ethers.getContract("GovernorContract")
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait()
  console.log(voteTxReceipt.events[0].args.reason)
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
