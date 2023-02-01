import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import {
  developmentChains,
  FUNC,
  MIN_DELAY,
  NEW_STORE_VALUE,
  PROP_DESCRIPTION,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../../helper-hardhat-config"
import {
  Box,
  GovernanceToken,
  GovernorContract,
  TimeLock,
} from "../../typechain-types"
import moveBlocks from "../../utils/move-blocks"
import moveTime from "../../utils/move-time"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Governor Flow", function () {
      let governor: GovernorContract
      let governanceToken: GovernanceToken
      let timeLock: TimeLock
      let box: Box
      const voteWay = 1 // for
      const reason = "I lika do da cha cha"
      beforeEach(async function () {
        await deployments.fixture(["all"])
        governor = await ethers.getContract("GovernorContract")
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract("GovernanceToken")
        box = await ethers.getContract("Box")
      })
      it("can only be change through governance", async () => {
        await expect(box.store(123)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        )
      })
      it("proposes, votes, waits, queues, and then executes", async function () {
        const boxStartingValue = await box.retrieve()
        console.log(`Box starting value: ${boxStartingValue}`)
        // propose
        const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [
          NEW_STORE_VALUE,
        ])
        const proposeTx = await governor.propose(
          [box.address],
          [0],
          [encodedFunctionCall],
          PROP_DESCRIPTION
        )
        const proposeReceipt = await proposeTx.wait()
        const proposalId = proposeReceipt.events![0].args![0]
        let proposalState = await governor.state(proposalId)
        console.log(`Proposal state: ${proposalState}`)

        await moveBlocks(VOTING_DELAY + 1)

        // vote
        const voteTx = await governor.castVoteWithReason(
          proposalId,
          voteWay,
          reason
        )
        await voteTx.wait()
        proposalState = await governor.state(proposalId)
        assert.equal(proposalState.toString(), "1")
        console.log(`Proposal state: ${proposalState}`)

        await moveBlocks(VOTING_PERIOD + 1)

        // queue & execute
        const descriptionHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(PROP_DESCRIPTION)
        )
        const queueTx = await governor.queue(
          [box.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        )
        await queueTx.wait()
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)

        proposalState = await governor.state(proposalId)
        assert(proposalState.toString(), "5")
        console.log(`Proposal state: ${proposalState}`)

        // execute
        console.log("Executing...")
        const executeTx = await governor.execute(
          [box.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        )
        await executeTx.wait()
        const boxEndingValue = await box.retrieve()
        console.log(`Box ending value: ${boxEndingValue}`)
      })
    })
