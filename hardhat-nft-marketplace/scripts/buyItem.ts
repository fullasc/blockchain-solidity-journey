import { HardhatRuntimeEnvironment } from "hardhat/types"
import { BasicNft, NftMarketplace } from "../typechain-types"

async function buyItem(hre: HardhatRuntimeEnvironment, tokenId: number) {
  const nftMarketplace = (await hre.ethers.getContract(
    "NftMarketplace"
  )) as NftMarketplace
  const basicNft = (await hre.ethers.getContract("BasicNft")) as BasicNft
  const listing = await nftMarketplace.getListing(basicNft.address, tokenId)
  const price = listing.price.toString()
  try {
    const tx = await nftMarketplace.buyItem(basicNft.address, tokenId, {
      value: price,
    })
    await tx.wait()
    console.log(`NFT ${tokenId} bought!`)
  } catch (err: any) {
    console.error(err.error.message)
  }
}

export default buyItem
