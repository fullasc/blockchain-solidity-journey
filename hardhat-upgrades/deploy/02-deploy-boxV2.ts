import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  networkConfig,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployDynamicSvgNft: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const boxv2 = await deploy("BoxV2", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
    // proxy: {
    //   proxyContract: "OpenZeppelinTransparentProxy",
    //   viaAdminContract: {
    //     name: "BoxProxyAdmin",
    //     artifact: "BoxProxyAdmin",
    //   },
    // },
  })

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...")
    await verify(boxv2.address, [])
  }
}

export default deployDynamicSvgNft
deployDynamicSvgNft.tags = ["all", "boxv2", "main"]
