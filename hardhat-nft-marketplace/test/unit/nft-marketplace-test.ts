import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BasicNft, NftMarketplace } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace", function () {
      let nftMarketplaceContract: NftMarketplace
      let nftMarketplace: NftMarketplace
      let basicNft: BasicNft
      let deployer: SignerWithAddress
      let user: SignerWithAddress
      const TOKEN_ID = 0
      const PRICE = ethers.utils.parseEther("0.1")

      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        nftMarketplaceContract = (await ethers.getContract(
          "NftMarketplace"
        )) as NftMarketplace
        nftMarketplace = nftMarketplaceContract.connect(deployer)
        basicNft = (await ethers.getContract("BasicNft", deployer)) as BasicNft
        await basicNft.mint()
        await basicNft.approve(nftMarketplace.address, TOKEN_ID)
      })
      describe("listItem", function () {
        it("reverts if not the owner", async function () {
          nftMarketplace = nftMarketplaceContract.connect(user)
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotOwner"
          )
        })

        it("reverts if price is 0", async function () {
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__PriceMustBeAboveZero"
          )
        })

        it("need approval to list item", async function () {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotApprovedForMarketplace"
          )
        })

        it("list an item with seller and price", async function () {
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          )
            .to.emit(nftMarketplace, "ItemListed")
            .withArgs(deployer.address, basicNft.address, TOKEN_ID, PRICE)
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          )
          assert.equal(listing.price.toString(), PRICE.toString())
          assert.equal(listing.seller.toString(), await deployer.getAddress())
        })

        it("revert if NFT alread listed", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__AlreadyListed"
          )
        })
      })

      describe("buyItem", function () {
        it("reverts if not listed", async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotListed"
          )
        })

        it("reverts if price is 0", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          await expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__PriceNotMet"
          )
        })

        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          nftMarketplace = nftMarketplaceContract.connect(user)
          await expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
          )
            .to.emit(nftMarketplace, "ItemBought")
            .withArgs(user.address, basicNft.address, TOKEN_ID, PRICE)

          const newOwner = await basicNft.ownerOf(TOKEN_ID)
          const sellerProceeds = await nftMarketplace.getProceeds(
            await deployer.getAddress()
          )

          assert.equal(newOwner.toString(), await user.getAddress())
          assert.equal(sellerProceeds.toString(), PRICE.toString())
        })
      })

      describe("cancelItem", function () {
        it("reverts if not listed", async function () {
          await expect(
            nftMarketplace.cancelItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotListed"
          )
        })

        it("reverts if not the owner", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          nftMarketplace = nftMarketplaceContract.connect(user)
          await basicNft.approve(await user.getAddress(), TOKEN_ID)
          await expect(
            nftMarketplace.cancelItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotOwner"
          )
        })

        it("emit an event item cancelled and remove the item from the listing", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          await expect(nftMarketplace.cancelItem(basicNft.address, TOKEN_ID))
            .to.emit(nftMarketplace, "ItemCancelled")
            .withArgs(deployer.address, basicNft.address, TOKEN_ID)
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          )
          assert.equal(listing.price.toString(), "0")
        })
      })

      describe("udpateItem", function () {
        it("reverts if price below or equal to 0", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          await expect(
            nftMarketplace.updateItem(basicNft.address, TOKEN_ID, 0)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__PriceMustBeAboveZero"
          )
        })

        it("reverts if not listed", async function () {
          await expect(
            nftMarketplace.updateItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotListed"
          )
        })

        it("reverts if not the owner", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          nftMarketplace = nftMarketplaceContract.connect(user)
          await basicNft.approve(await user.getAddress(), TOKEN_ID)
          await expect(
            nftMarketplace.updateItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotOwner"
          )
        })

        it("emit an event item updated and update the item price", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          const newPrice = ethers.utils.parseEther("2")
          await expect(
            nftMarketplace.updateItem(basicNft.address, TOKEN_ID, newPrice)
          )
            .to.emit(nftMarketplace, "ItemListed")
            .withArgs(deployer.address, basicNft.address, TOKEN_ID, newPrice)
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          )
          assert.equal(listing.price.toString(), newPrice.toString())
        })
      })

      describe("withdrawProceeds", function () {
        it("reverts if no proceeds", async function () {
          await expect(nftMarketplace.withdrawProceeds())
            .to.be.revertedWithCustomError(
              nftMarketplace,
              "NftMarketplace__NoProceedsToWithdraw"
            )
            .withArgs(await deployer.getAddress())
        })

        it("withdraws the proceeds and resets the proceeds to 0", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          nftMarketplace = nftMarketplaceContract.connect(user)
          await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          })
          nftMarketplace = nftMarketplaceContract.connect(deployer)

          const deployerProceedsBefore = await nftMarketplace.getProceeds(
            await deployer.getAddress()
          )
          const deployerBalanceBefore = await deployer.getBalance()
          let txResponse
          await expect((txResponse = await nftMarketplace.withdrawProceeds()))
            .to.emit(nftMarketplace, "WithdrawProceeded")
            .withArgs(await deployer.getAddress(), deployerProceedsBefore, true)
          const transactionReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const deployerBalanceAfter = await deployer.getBalance()

          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString()
          )
        })
      })
    })
