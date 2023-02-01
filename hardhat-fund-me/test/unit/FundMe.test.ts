import { assert, expect } from "chai"
import { Contract } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: Contract
      let deployer: string
      let mockV3Aggregator: Contract
      const sendValue = ethers.utils.parseEther("1") // 1 ETH
      beforeEach(async function () {
        deployer = await getNamedAccounts().then((x) => x.deployer)
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async function () {
        it("Sets the aggregator address correctly", async function () {
          const response = await fundMe.getPricefeed()
          // expect(response).to.eq(mockV3Aggregator.address)
          assert.equal(response, mockV3Aggregator.address)
        })
        it("Sets the owner address correctly", async function () {
          const response = await fundMe.getOwner()
          await expect(response).to.eq(deployer)
        })
      })

      describe("fund", async function () {
        it("Fails if not enough ether is sent", async function () {
          const amount = ethers.utils.parseEther("0.0001")
          await expect(
            fundMe.fund({ value: amount })
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotEnoughETH")
        })

        it("Update the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue })
          const amount = await fundMe.getAddressToAmountFunded(deployer)
          // await expect(response).to.eq(sendValue)
          assert.equal(amount.toString(), sendValue.toString())
        })

        it("Adds the address to the getFunder array", async function () {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunder(0)
          // await expect(response).to.eq(deployer)
          assert.equal(funder, deployer)
        })
      })

      describe("Withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single funder", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Act
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("Allow us to withdraw with multiple getFunder", async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Act
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          // Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              "0"
            )
          }
        })

        it("Only the owner can withdraw", async function () {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          await expect(
            fundMe.connect(attacker).withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })

        it("cheaperWithdraw testing...", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Act
          const txResponse = await fundMe.cheaperWithdraw()
          const txReceipt = await txResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("Allow us to withdraw with multiple getFunder", async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Act
          const txResponse = await fundMe.cheaperWithdraw()
          const txReceipt = await txResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          // Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              "0"
            )
          }
        })

        it("Only the owner can withdraw", async function () {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          await expect(
            fundMe.connect(attacker).cheaperWithdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })
    })
