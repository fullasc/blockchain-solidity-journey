import { HardhatRuntimeEnvironment } from "hardhat/types"
import { BasicNft, NftMarketplace } from "../typechain-types"

async function updateItem(
  hre: HardhatRuntimeEnvironment,
  tokenId: number,
  price: number
) {
  const nftMarketplace = (await hre.ethers.getContract(
    "NftMarketplace"
  )) as NftMarketplace
  const basicNft = (await hre.ethers.getContract("BasicNft")) as BasicNft
  try {
    const tx = await nftMarketplace.updateItem(basicNft.address, tokenId, price)
    await tx.wait()
    console.log(`NFT ${tokenId} updated with price : ${price}!`)
  } catch (err: any) {
    console.error(err.error.message)
  }
}

export default updateItem
