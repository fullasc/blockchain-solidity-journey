import { ethers, getNamedAccounts } from "hardhat"

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  let response = await ethers.provider.getStorageAt(fundMe.address, 0)
  console.log("s_addressToAmountFunded", response)
  response = await ethers.provider.getStorageAt(fundMe.address, 1)
  console.log("s_funders", response)
  response = await ethers.provider.getStorageAt(fundMe.address, 2)
  console.log("i_owner", response)
  response = await ethers.provider.getStorageAt(fundMe.address, 3)
  console.log("MINIMUM_USD", response)
  const mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
  console.log(mockV3Aggregator.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
