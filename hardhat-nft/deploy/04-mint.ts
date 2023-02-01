import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains } from "../helper-hardhat-config"

const mint: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  // Mint Basic NFT
  const basicNft = await ethers.getContract("BasicNft", deployer)
  const basicNftTx = await basicNft.mintNft()
  await basicNftTx.wait()
  log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

  // Mint Random IPFS NFT
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
  const mintFee = await randomIpfsNft.getMintFee()
  await new Promise(async (resolve, reject) => {
    try {
      setTimeout(() => reject("TimeOut"), 300000) // 5 minutes
      randomIpfsNft.once("NftMinted", async (tokenId: number) => {
        resolve(true)
      })
      const randomIpfsNftTx = await randomIpfsNft.requestNft({
        value: mintFee.toString(),
      })
      const randomIpfsNftTxReceipt = await randomIpfsNftTx.wait()
      let requestId
      if (developmentChains.includes(network.name)) {
        requestId = randomIpfsNftTxReceipt.events[1].args.requestId.toString()
        const vrfCoordinatorV2 = await ethers.getContract(
          "VRFCoordinatorV2Mock"
        )
        await vrfCoordinatorV2.fulfillRandomWords(
          requestId,
          randomIpfsNft.address
        )
      }
      log(
        `Random IPFS NFT index 0 has tokenURI: ${await randomIpfsNft.tokenURI(
          0
        )}`
      )
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })

  // Mint Dynamic NFT
  const highValue = await ethers.utils.parseEther("1000")
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
  const dynamicSvgNftTx = await dynamicSvgNft.mintNft(highValue.toString())
  await dynamicSvgNftTx.wait()
  log(`Dynamic NFT index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

export default mint
mint.tags = ["all", "mint"]
