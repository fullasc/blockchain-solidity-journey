import { assert, expect } from "chai"
import { Contract } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: Contract
      let deployer: string
      const sendValue = ethers.utils.parseEther("0.0001") // 1 ETH

      beforeEach(async function () {
        deployer = await getNamedAccounts().then((x) => x.deployer)
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("Allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        console.log(
          endingBalance.toString() + " should equal 0, running assert equal..."
        )
        assert.equal(endingBalance.toString(), "0")
      })
    })
