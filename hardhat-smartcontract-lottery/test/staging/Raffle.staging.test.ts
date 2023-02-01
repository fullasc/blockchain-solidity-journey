import { assert, expect } from "chai"
import { Contract } from "ethers"
import { ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", function () {
      let raffle: Contract
      let raffleEntranceFee: number
      let deployer: string

      beforeEach(async function () {
        deployer = await getNamedAccounts().then((x) => x.deployer)
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe("fulfillRandomWords", function () {
        it("Works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          // enter the raffle
          console.log("Setting up test...")
          const startingTimeStamp = await raffle.getLatestTimestamp()
          const accounts = await ethers.getSigners()

          console.log("Setting up listener...")
          await new Promise<void>(async (resolve, reject) => {
            // setup listener before we enter the raffle
            // Just in case the blockchain moves REALLY fast
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event emitted")
              try {
                // add ou asserts here
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLatestTimestamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (e) {
                console.error(e)
                reject(e)
              }
            })
            console.log("Entering raffle...")
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
            tx.wait()
            console.log("OK, time to wait...")
            const winnerStartingBalance = await accounts[0].getBalance()
            // this code WONT complete until our listener has finished listening!
          })
        })
      })
    })
