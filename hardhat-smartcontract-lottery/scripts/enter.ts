import { ethers } from "hardhat"
import { Raffle } from "../typechain-types"

async function enterRaffle() {
  const raffle: Raffle = await ethers.getContract("Raffle")
  const entranceFee = await raffle.getEntranceFee()
  await raffle.enterRaffle({ value: entranceFee })
  console.log("Entered raffle!")
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
