import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import {
  developmentChains,
  networkConfigHelper,
} from "../../helper-hardhat-config"
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", function () {
      let raffleContract: Raffle
      let vrfCoordinatorMock: VRFCoordinatorV2Mock
      let raffle: Raffle
      let raffleEntranceFee: BigNumber
      let interval: number
      let player: SignerWithAddress
      let accounts: SignerWithAddress[]

      beforeEach(async function () {
        accounts = await ethers.getSigners()
        player = accounts[1]
        await deployments.fixture(["mocks", "raffle"])
        vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock")
        raffleContract = await ethers.getContract("Raffle")
        raffle = raffleContract.connect(player)
        raffleEntranceFee = await raffle.getEntranceFee()
        interval = (await raffle.getInterval()).toNumber()
      })

      describe("constructor", function () {
        it("should set the entranceFee", async function () {
          const entranceFee = await raffle.getEntranceFee()
          const expectedEntranceFee =
            networkConfigHelper[network.name].entranceFee!
          assert.equal(entranceFee.toString(), expectedEntranceFee.toString())
        })

        it("should set the vrfCoordinator", async function () {
          const vrfCoordinator = await raffle.getVrfCoordinator()
          const expectedVrfCoordinator = await vrfCoordinatorMock.address
          assert.equal(vrfCoordinator, expectedVrfCoordinator)
        })

        it("should set the gasLane", async function () {
          const gasLane = await raffle.getGasLane()
          const expectedGasLane = networkConfigHelper[network.name].gasLane!
          assert.equal(gasLane.toString(), expectedGasLane.toString())
        })

        it("should set the subscriptionId", async function () {
          const subscriptionId = await raffle.getSubscriptionId()
          const expectedSubscriptionId = "1"
          assert.equal(
            subscriptionId.toString(),
            expectedSubscriptionId.toString()
          )
        })

        it("should set the callbackGasLimit", async function () {
          const callbackGasLimit = await raffle.getCallbackGasLimit()
          const expectedCallbackGasLimit =
            networkConfigHelper[network.name].callbackGasLimit!
          assert.equal(
            callbackGasLimit.toString(),
            expectedCallbackGasLimit.toString()
          )
        })

        it("raffle state should be set to OPEN", async function () {
          const raffleState = await raffle.getRaffleState()
          assert.equal(raffleState.toString(), "0")
        })

        it("lastTimeStamp should be set of block timestamp", async function () {
          const lastTimeStamp = await raffle.getLatestTimestamp()
          const expectedLastTimeStamp = (
            await ethers.provider.getBlock("latest")
          ).timestamp
          assert.equal(lastTimeStamp.toNumber() + 1, expectedLastTimeStamp)
        })

        it("should set the interval", async function () {
          const interval = await raffle.getInterval()
          const expectedInterval = networkConfigHelper[network.name].interval!
          assert.equal(interval.toString(), expectedInterval.toString())
        })
      })

      describe("enterRaffle", function () {
        it("revert if you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughETHEntered"
          )
        })

        it("records player address when they enter", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const playerAddressFromContract = await raffle.getPlayer(0)
          assert.equal(playerAddressFromContract, player.address)
        })

        it("emit an event when a player enters", async function () {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEntered")
        })

        it("does not allow entrance when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })

          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])

          // we pretend to be a keeper for a second
          await raffle.performUpkeep([]) // changes the state to calculating for our comparison below
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__RaffleNotOpen")
        })
      })

      describe("checkUpKeep", function () {
        it("returns false if people haven't send any ETH", async function () {
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })

        it("returns false if raffle isn't open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep([]) // changes the state to calculating for our comparison below
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          const raffleState = await raffle.getRaffleState()
          assert(!upkeepNeeded)
          assert.equal(raffleState.toString(), "1")
        })

        it("returns false if enough time hasn't passed", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval - 10])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })

        it("returns true if enough time, has player, eth, and is open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(upkeepNeeded)
        })
      })

      describe("performUpkeep", function () {
        it("can only run if checkUpkeep returns true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])
          const tx = await raffle.performUpkeep([])
          assert(tx)
        })

        it("reverts if checkUpkeep returns false", async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(
            raffle,
            "Raffle_UpkeepNotNeeded"
          )
        })

        it("updates the raffle state, emits the events and calls the vrf coordinator", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.send("evm_mine", [])
          const tx = await raffle.performUpkeep([])
          const receipt = await tx.wait()
          const requestId = receipt!.events![1].args!.requestId
          const raffleState = await raffle.getRaffleState()
          assert(requestId.toNumber() > 0)
          assert.equal(raffleState.toString(), "1")
        })
      })

      describe("remaining getters", function () {
        it("returns the num of words", async function () {
          const numWords = await raffle.getNumWords()
          assert.equal(numWords.toString(), "1")
        })

        it("returns the num of players", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const numPlayers = await raffle.getNumberOfPlayers()
          assert.equal(numPlayers.toString(), "1")
        })

        it("return the request confirmation", async function () {
          const requestConfirmation = await raffle.getRequestConfirmations()
          assert.equal(requestConfirmation.toString(), "3")
        })
      })

      describe("fulfillRandomWords", function () {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
        })
        it("can only be called after performupkeep", async () => {
          await expect(
            vrfCoordinatorMock.fulfillRandomWords(0, raffle.address) // reverts if not fulfilled
          ).to.be.revertedWith("nonexistent request")
          await expect(
            vrfCoordinatorMock.fulfillRandomWords(1, raffle.address) // reverts if not fulfilled
          ).to.be.revertedWith("nonexistent request")
        })

        // This test is too big...
        // This test simulates users entering the raffle and wraps the entire functionality of the raffle
        // inside a promise that will resolve if everything is successful.
        // An event listener for the WinnerPicked is set up
        // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
        // All the assertions are done once the WinnerPicked event is fired
        it("picks a winner, resets, and sends money", async () => {
          const additionalEntrances = 3 // to test
          const startingIndex = 2
          for (
            let i = startingIndex;
            i < startingIndex + additionalEntrances;
            i++
          ) {
            // i = 2; i < 5; i=i+1
            raffle = raffleContract.connect(accounts[i]) // Returns a new instance of the Raffle contract connected to player
            await raffle.enterRaffle({ value: raffleEntranceFee })
          }
          const startingTimeStamp = await raffle.getLatestTimestamp() // stores starting timestamp (before we fire our event)

          // This will be more important for our staging tests...
          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!")
              // assert throws an error if it fails, so we need to wrap
              // it in a try/catch so that the promise returns event
              // if it fails.
              try {
                // Now lets get the ending values...
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerBalance = await accounts[2].getBalance()
                const endingTimeStamp = await raffle.getLatestTimestamp()
                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[2].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerBalance.toString(),
                  startingBalance
                    .add(
                      raffleEntranceFee
                        .mul(additionalEntrances)
                        .add(raffleEntranceFee)
                    )
                    .toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (e) {
                reject(e)
              }
            })

            const tx = await raffle.performUpkeep("0x")
            const txReceipt = await tx.wait(1)
            const startingBalance = await accounts[2].getBalance()
            await vrfCoordinatorMock.fulfillRandomWords(
              txReceipt!.events![1].args!.requestId,
              raffle.address
            )
          })
        })
      })
    })
