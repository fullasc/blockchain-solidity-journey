import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random IPFS NFT Unit Tests", function () {
      let randomIpfsNft: RandomIpfsNft
      let deployer: SignerWithAddress
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock

      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "randomipfs"])
        randomIpfsNft = await ethers.getContract("RandomIpfsNft")
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
      })

      describe("constructor", function () {
        it("shoud create a token Random IPFS NFT with symbol RIN", async function () {
          assert.equal(await randomIpfsNft.name(), "Random IPFS NFT")
          assert.equal(await randomIpfsNft.symbol(), "RIN")
          assert.equal(
            await (await randomIpfsNft.getMintFee()).toString(),
            networkConfig[network.config.chainId!].mintFee!
          )
          assert.isNotEmpty(
            await (await randomIpfsNft.getDogTokenUris(0)).toString()
          )
          assert.isNotEmpty(
            await (await randomIpfsNft.getDogTokenUris(1)).toString()
          )
          assert.isNotEmpty(
            await (await randomIpfsNft.getDogTokenUris(2)).toString()
          )
          await expect(
            randomIpfsNft.getDogTokenUris(3)
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__RangeOutOfBounds"
          )
        })
      })

      describe("requestNft", function () {
        it("revert if payment is not sent with the request", async function () {
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })

        it("revert payment is lower than the mint fee", async function () {
          const fee = await randomIpfsNft.getMintFee()
          await expect(
            randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.001")),
            })
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })

        it("emits an event and kicks off a random word request", async function () {
          const fee = await randomIpfsNft.getMintFee()
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested")
        })
      })

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async () => {
          await new Promise(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await randomIpfsNft.tokenURI(0)
                const tokenCounter = await randomIpfsNft.getTokenCounter()
                assert.equal(tokenUri.toString().includes("ipfs://"), true)
                assert.equal(tokenCounter.toString(), "1")
                resolve(true)
              } catch (e) {
                reject(e)
              }
            })
            try {
              const fee = await randomIpfsNft.getMintFee()
              const requestNftResponse = await randomIpfsNft.requestNft({
                value: fee.toString(),
              })
              const requestNftReceipt = await requestNftResponse.wait(1)
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestNftReceipt.events![1].args!.requestId,
                randomIpfsNft.address
              )
            } catch (e) {
              console.error(e)
              reject(e)
            }
          })
        })
      })

      describe("getChanceArray", function () {
        it("should return an array of 3 elements", async function () {
          const chanceArray = await randomIpfsNft.getChanceArray()
          const MAX_CHANCE = "60"
          assert.equal(chanceArray.length, 3)
          assert.equal(chanceArray[0].toString(), "10")
          assert.equal(chanceArray[1].toString(), "30")
          assert.equal(chanceArray[2].toString(), MAX_CHANCE)
        })
      })

      describe("getBreedFromModdedRng", function () {
        it("should return Breed 0 from 0 to 9", async function () {
          let breed = await randomIpfsNft.getBreedFromModdedRng(0)
          assert.equal(breed.toString(), "0")
          breed = await randomIpfsNft.getBreedFromModdedRng(9)
          assert.equal(breed.toString(), "0")
        })
        it("should return Breed 1 from 10 to 39", async function () {
          let breed = await randomIpfsNft.getBreedFromModdedRng(10)
          assert.equal(breed.toString(), "1")
          breed = await randomIpfsNft.getBreedFromModdedRng(39)
          assert.equal(breed.toString(), "1")
        })
        it("should return Breed 2 from 40 to 99", async function () {
          let breed = await randomIpfsNft.getBreedFromModdedRng(40)
          assert.equal(breed.toString(), "2")
          breed = await randomIpfsNft.getBreedFromModdedRng(99)
        })
        it("revert with RougeOutOfBounds error", async function () {
          await expect(
            randomIpfsNft.getBreedFromModdedRng(100)
          ).to.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__RangeOutOfBounds"
          )
        })
      })

      describe("withdraw", function () {
        it("should withdraw the contract balance to the deployer", async function () {
          const fee = await randomIpfsNft.getMintFee()
          const tx = await randomIpfsNft.requestNft({ value: fee })
          await tx.wait()
          const randomIpfsNftBalance = await ethers.provider.getBalance(
            randomIpfsNft.address
          )
          const deployerBalance = await ethers.provider.getBalance(
            deployer.address
          )
          const txResponse = await randomIpfsNft.withdraw()
          const txReceipt = await txResponse.wait()

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const newRandomIpfsNftBalance = await ethers.provider.getBalance(
            randomIpfsNft.address
          )
          const newDeployerBalance = await ethers.provider.getBalance(
            deployer.address
          )

          assert.equal(newRandomIpfsNftBalance.toString(), "0")
          assert.equal(
            randomIpfsNftBalance.add(deployerBalance).toString(),
            newDeployerBalance.add(gasCost).toString()
          )
        })
      })

      describe("check initialized", function () {
        it("should return true", async function () {
          const initialized = await randomIpfsNft.getInitialized()
          assert.equal(initialized, true)
        })
      })
    })
