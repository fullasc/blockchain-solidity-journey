import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains, INITIAL_SUPPLY } from "../../helper-hardhat-config"
import { OurToken } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken unit test", function () {
      let ourToken: OurToken
      let deployer: SignerWithAddress
      let user: SignerWithAddress
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        ourToken = await ethers.getContract("OurToken", deployer)
      })
      describe("constructor", function () {
        it("set the initial supply", async function () {
          const totalSupply = await ourToken.totalSupply()
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
        })

        it("set the name to OurToken", async function () {
          const name = await ourToken.name()
          assert.equal(name, "OurToken")
        })

        it("set the symbol to OUR", async function () {
          const symbol = await ourToken.symbol()
          assert.equal(symbol, "OT")
        })

        it("set the decimals to 18", async function () {
          const decimals = await ourToken.decimals()
          assert.equal(decimals, 18)
        })
      })

      describe("transfer", function () {
        it("transfer the amount to the recipient", async function () {
          const amount = ethers.utils.parseEther("10")
          await ourToken.transfer(user.address, amount)
          const balance = await ourToken.balanceOf(user.address)
          assert.equal(balance.toString(), amount.toString())
        })

        it("emits a Transfer event", async function () {
          const amount = ethers.utils.parseEther("10")
          await expect(ourToken.transfer(user.address, amount))
            .to.emit(ourToken, "Transfer")
            .withArgs(deployer.address, user.address, amount)
        })
      })

      describe("transferFrom", function () {
        it("transfer the amount to the recipient", async function () {
          const tokenToSpend = ethers.utils.parseEther("10")
          await ourToken.approve(user.address, tokenToSpend)
          await ourToken
            .connect(user)
            .transferFrom(deployer.address, user.address, tokenToSpend)
          const balance = await ourToken.balanceOf(user.address)
          assert.equal(balance.toString(), tokenToSpend.toString())
        })

        it("emits a Transfer event", async function () {
          const tokenToSpend = ethers.utils.parseEther("10")
          await ourToken.approve(user.address, tokenToSpend)
          await expect(
            ourToken
              .connect(user)
              .transferFrom(deployer.address, user.address, tokenToSpend)
          )
            .to.emit(ourToken, "Transfer")
            .withArgs(deployer.address, user.address, tokenToSpend)
        })
      })
    })
