import { ethers } from "ethers"

async function getLatestBlock() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
  console.log(await provider.getBlockNumber())
  provider.on("block", () => console.log("new block"))
}

getLatestBlock()
