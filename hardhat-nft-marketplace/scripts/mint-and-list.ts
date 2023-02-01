import { ethers, network } from "hardhat"
import moveBlocks from "../utils/move-blocks"

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
  const nftMarketplace = await ethers.getContract("NftMarketplace")
  const basicNft = await ethers.getContract("BasicNft")

  console.log("Minting NFT...")
  const mintTx = await basicNft.mint()
  const mintTxReceipt = await mintTx.wait()
  const tokenId = mintTxReceipt.events[0].args.tokenId

  console.log("Approving NFT for sale...")
  const approveTx = await basicNft.approve(nftMarketplace.address, tokenId)
  console.log(`Waiting for ${approveTx.hash} to be mined...`)
  await approveTx.wait()

  console.log("Listing NFT for sale...")
  const listTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
  console.log(`Waiting for ${listTx.hash} to be mined...`)
  await listTx.wait()

  console.log("Done!")

  if (network.config.chainId === 31337) {
    await moveBlocks(1, 1000)
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
