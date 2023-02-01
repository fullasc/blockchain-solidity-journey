import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BasicNft } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft Unit Tests", function () {
      let basicNft: BasicNft
      let deployer: SignerWithAddress
      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["basicnft"])
        basicNft = (await ethers.getContract("BasicNft")) as BasicNft
      })

      it("should create a token Doggie with symbol DOGI", async () => {
        assert.equal(await basicNft.name(), "Doggie")
        assert.equal(await basicNft.symbol(), "DOGI")
        assert.equal(await (await basicNft.getTokenCounter()).toString(), "0")
      })

      it("Allows users to min an NFT, and updates appropriate state variables", async function () {
        const txResponse = await basicNft.mintNft()
        await txResponse.wait(1)
        const tokenURI = await basicNft.tokenURI(0)
        const tokenCounter = await basicNft.getTokenCounter()
        assert.equal(tokenURI, await basicNft.TOKEN_URI())
        assert.equal(tokenCounter.toString(), "1")
      })
    })
