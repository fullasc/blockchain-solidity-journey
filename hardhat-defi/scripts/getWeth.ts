import { ethers, getNamedAccounts, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"

export const AMOUNT = ethers.utils.parseEther("0.02").toString()

export async function getWeth() {
  const { deployer } = await getNamedAccounts()
  // abi, contract address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  const iWeth = await ethers.getContractAt(
    "IWeth",
    networkConfig[network.config!.chainId!].wethToken!,
    deployer
  )

  const tx = await iWeth.deposit({ value: AMOUNT })
  await tx.wait(1)
  const wethBalance = await iWeth.balanceOf(deployer)
  console.log(`Got ${wethBalance} WETH`)
}
