import { HardhatRuntimeEnvironment } from "hardhat/types"
import { BasicNft, NftMarketplace } from "../typechain-types"

async function cancelItem(hre: HardhatRuntimeEnvironment, tokenId: number) {
  const nftMarketplace = (await hre.ethers.getContract(
    "NftMarketplace"
  )) as NftMarketplace
  const basicNft = (await hre.ethers.getContract("BasicNft")) as BasicNft
  try {
    const tx = await nftMarketplace.cancelItem(basicNft.address, tokenId)
    await tx.wait()
    console.log(`Item ${tokenId} cancelled!`)
  } catch (err: any) {
    console.error(err.error.message)
  }
}

export default cancelItem
