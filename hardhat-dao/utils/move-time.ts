import { network } from "hardhat"

async function moveTime(amount: number) {
  console.log(`Moving ${amount}ms in time...`)
  await network.provider.request({
    method: "evm_increaseTime",
    params: [amount],
  })
}

export default moveTime
