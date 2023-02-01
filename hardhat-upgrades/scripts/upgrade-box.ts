// manual way to upgrade a box

import { ethers } from "hardhat"

async function main() {
  const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin")
  const transparentProxy = await ethers.getContract("Box_Proxy")
  const boxV2 = await ethers.getContract("BoxV2")

  const proxyBoxv1 = await ethers.getContractAt("Box", transparentProxy.address)
  const versionv1 = await proxyBoxv1.version()
  console.log(`Version of the proxy box: ${versionv1}`)

  const upgradeTx = await boxProxyAdmin.upgrade(
    transparentProxy.address,
    boxV2.address
  )
  await upgradeTx.wait()

  const proxyBoxv2 = await ethers.getContractAt(
    "BoxV2",
    transparentProxy.address
  )
  const versionv2 = await proxyBoxv2.version()
  console.log(`Version of the proxy box: ${versionv2}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
