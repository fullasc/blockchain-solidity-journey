import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { AggregatorV3Interface, DynamicSvgNft } from "../../typechain-types"

const lowSVGImageuri =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cGF0aCBmaWxsPSIjMzMzIiBkPSJNNTEyIDY0QzI2NC42IDY0IDY0IDI2NC42IDY0IDUxMnMyMDAuNiA0NDggNDQ4IDQ0OCA0NDgtMjAwLjYgNDQ4LTQ0OFM3NTkuNCA2NCA1MTIgNjR6bTAgODIwYy0yMDUuNCAwLTM3Mi0xNjYuNi0zNzItMzcyczE2Ni42LTM3MiAzNzItMzcyIDM3MiAxNjYuNiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzIgMzcyeiIvPg0KICA8cGF0aCBmaWxsPSIjRTZFNkU2IiBkPSJNNTEyIDE0MGMtMjA1LjQgMC0zNzIgMTY2LjYtMzcyIDM3MnMxNjYuNiAzNzIgMzcyIDM3MiAzNzItMTY2LjYgMzcyLTM3Mi0xNjYuNi0zNzItMzcyLTM3MnpNMjg4IDQyMWE0OC4wMSA0OC4wMSAwIDAgMSA5NiAwIDQ4LjAxIDQ4LjAxIDAgMCAxLTk2IDB6bTM3NiAyNzJoLTQ4LjFjLTQuMiAwLTcuOC0zLjItOC4xLTcuNEM2MDQgNjM2LjEgNTYyLjUgNTk3IDUxMiA1OTdzLTkyLjEgMzkuMS05NS44IDg4LjZjLS4zIDQuMi0zLjkgNy40LTguMSA3LjRIMzYwYTggOCAwIDAgMS04LTguNGM0LjQtODQuMyA3NC41LTE1MS42IDE2MC0xNTEuNnMxNTUuNiA2Ny4zIDE2MCAxNTEuNmE4IDggMCAwIDEtOCA4LjR6bTI0LTIyNGE0OC4wMSA0OC4wMSAwIDAgMSAwLTk2IDQ4LjAxIDQ4LjAxIDAgMCAxIDAgOTZ6Ii8+DQogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+DQo8L3N2Zz4="
const highSVGimageUri =
  "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+DQogIDxnIGNsYXNzPSJleWVzIj4NCiAgICA8Y2lyY2xlIGN4PSI2MSIgY3k9IjgyIiByPSIxMiIvPg0KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPg0KICA8L2c+DQogIDxwYXRoIGQ9Im0xMzYuODEgMTE2LjUzYy42OSAyNi4xNy02NC4xMSA0Mi04MS41Mi0uNzMiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTogYmxhY2s7IHN0cm9rZS13aWR0aDogMzsiLz4NCjwvc3ZnPg=="

const highTokenUri =
  "data:application/json;base64,eyAibmFtZSI6IkR5bmFtaWMgU1ZHIE5GVCIsICJkZXNjcmlwdGlvbiI6ICJBbiBORlQgdGhhdCBjYW4gY2hhbmdlIGl0cyBpbWFnZSBkeW5hbWljYWxseSIsICJhdHRyaWJ1dGVzIjogWyB7ICJ0cmFpdF90eXBlIjogIkltYWdlIiwgInZhbHVlIjogIjEwMCIgfSBdLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJsYm1OdlpHbHVaejBpVlZSR0xUZ2lJSE4wWVc1a1lXeHZibVU5SW01dklqOCtEUW84YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnMEtJQ0E4Y0dGMGFDQm1hV3hzUFNJak16TXpJaUJrUFNKTk5URXlJRFkwUXpJMk5DNDJJRFkwSURZMElESTJOQzQySURZMElEVXhNbk15TURBdU5pQTBORGdnTkRRNElEUTBPQ0EwTkRndE1qQXdMallnTkRRNExUUTBPRk0zTlRrdU5DQTJOQ0ExTVRJZ05qUjZiVEFnT0RJd1l5MHlNRFV1TkNBd0xUTTNNaTB4TmpZdU5pMHpOekl0TXpjeWN6RTJOaTQyTFRNM01pQXpOekl0TXpjeUlETTNNaUF4TmpZdU5pQXpOeklnTXpjeUxURTJOaTQySURNM01pMHpOeklnTXpjeWVpSXZQZzBLSUNBOGNHRjBhQ0JtYVd4c1BTSWpSVFpGTmtVMklpQmtQU0pOTlRFeUlERTBNR010TWpBMUxqUWdNQzB6TnpJZ01UWTJMall0TXpjeUlETTNNbk14TmpZdU5pQXpOeklnTXpjeUlETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaTB4TmpZdU5pMHpOekl0TXpjeUxUTTNNbnBOTWpnNElEUXlNV0UwT0M0d01TQTBPQzR3TVNBd0lEQWdNU0E1TmlBd0lEUTRMakF4SURRNExqQXhJREFnTUNBeExUazJJREI2YlRNM05pQXlOekpvTFRRNExqRmpMVFF1TWlBd0xUY3VPQzB6TGpJdE9DNHhMVGN1TkVNMk1EUWdOak0yTGpFZ05UWXlMalVnTlRrM0lEVXhNaUExT1RkekxUa3lMakVnTXprdU1TMDVOUzQ0SURnNExqWmpMUzR6SURRdU1pMHpMamtnTnk0MExUZ3VNU0EzTGpSSU16WXdZVGdnT0NBd0lEQWdNUzA0TFRndU5HTTBMalF0T0RRdU15QTNOQzQxTFRFMU1TNDJJREUyTUMweE5URXVObk14TlRVdU5pQTJOeTR6SURFMk1DQXhOVEV1Tm1FNElEZ2dNQ0F3SURFdE9DQTRMalI2YlRJMExUSXlOR0UwT0M0d01TQTBPQzR3TVNBd0lEQWdNU0F3TFRrMklEUTRMakF4SURRNExqQXhJREFnTUNBeElEQWdPVFo2SWk4K0RRb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWsweU9EZ2dOREl4WVRRNElEUTRJREFnTVNBd0lEazJJREFnTkRnZ05EZ2dNQ0F4SURBdE9UWWdNSHB0TWpJMElERXhNbU10T0RVdU5TQXdMVEUxTlM0MklEWTNMak10TVRZd0lERTFNUzQyWVRnZ09DQXdJREFnTUNBNElEZ3VOR2cwT0M0eFl6UXVNaUF3SURjdU9DMHpMaklnT0M0eExUY3VOQ0F6TGpjdE5Ea3VOU0EwTlM0ekxUZzRMallnT1RVdU9DMDRPQzQyY3preUlETTVMakVnT1RVdU9DQTRPQzQyWXk0eklEUXVNaUF6TGprZ055NDBJRGd1TVNBM0xqUklOalkwWVRnZ09DQXdJREFnTUNBNExUZ3VORU0yTmpjdU5pQTJNREF1TXlBMU9UY3VOU0ExTXpNZ05URXlJRFV6TTNwdE1USTRMVEV4TW1FME9DQTBPQ0F3SURFZ01DQTVOaUF3SURRNElEUTRJREFnTVNBd0xUazJJREI2SWk4K0RRbzhMM04yWno0PSIgfQ=="
const lowTokenUri =
  "data:application/json;base64,eyAibmFtZSI6IkR5bmFtaWMgU1ZHIE5GVCIsICJkZXNjcmlwdGlvbiI6ICJBbiBORlQgdGhhdCBjYW4gY2hhbmdlIGl0cyBpbWFnZSBkeW5hbWljYWxseSIsICJhdHRyaWJ1dGVzIjogWyB7ICJ0cmFpdF90eXBlIjogIkltYWdlIiwgInZhbHVlIjogIjEwMCIgfSBdLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJsYm1OdlpHbHVaejBpVlZSR0xUZ2lJSE4wWVc1a1lXeHZibVU5SW01dklqOCtEUW84YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnMEtJQ0E4Y0dGMGFDQm1hV3hzUFNJak16TXpJaUJrUFNKTk5URXlJRFkwUXpJMk5DNDJJRFkwSURZMElESTJOQzQySURZMElEVXhNbk15TURBdU5pQTBORGdnTkRRNElEUTBPQ0EwTkRndE1qQXdMallnTkRRNExUUTBPRk0zTlRrdU5DQTJOQ0ExTVRJZ05qUjZiVEFnT0RJd1l5MHlNRFV1TkNBd0xUTTNNaTB4TmpZdU5pMHpOekl0TXpjeWN6RTJOaTQyTFRNM01pQXpOekl0TXpjeUlETTNNaUF4TmpZdU5pQXpOeklnTXpjeUxURTJOaTQySURNM01pMHpOeklnTXpjeWVpSXZQZzBLSUNBOGNHRjBhQ0JtYVd4c1BTSWpSVFpGTmtVMklpQmtQU0pOTlRFeUlERTBNR010TWpBMUxqUWdNQzB6TnpJZ01UWTJMall0TXpjeUlETTNNbk14TmpZdU5pQXpOeklnTXpjeUlETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaTB4TmpZdU5pMHpOekl0TXpjeUxUTTNNbnBOTWpnNElEUXlNV0UwT0M0d01TQTBPQzR3TVNBd0lEQWdNU0E1TmlBd0lEUTRMakF4SURRNExqQXhJREFnTUNBeExUazJJREI2YlRNM05pQXlOekpvTFRRNExqRmpMVFF1TWlBd0xUY3VPQzB6TGpJdE9DNHhMVGN1TkVNMk1EUWdOak0yTGpFZ05UWXlMalVnTlRrM0lEVXhNaUExT1RkekxUa3lMakVnTXprdU1TMDVOUzQ0SURnNExqWmpMUzR6SURRdU1pMHpMamtnTnk0MExUZ3VNU0EzTGpSSU16WXdZVGdnT0NBd0lEQWdNUzA0TFRndU5HTTBMalF0T0RRdU15QTNOQzQxTFRFMU1TNDJJREUyTUMweE5URXVObk14TlRVdU5pQTJOeTR6SURFMk1DQXhOVEV1Tm1FNElEZ2dNQ0F3SURFdE9DQTRMalI2YlRJMExUSXlOR0UwT0M0d01TQTBPQzR3TVNBd0lEQWdNU0F3TFRrMklEUTRMakF4SURRNExqQXhJREFnTUNBeElEQWdPVFo2SWk4K0RRb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWsweU9EZ2dOREl4WVRRNElEUTRJREFnTVNBd0lEazJJREFnTkRnZ05EZ2dNQ0F4SURBdE9UWWdNSHB0TWpJMElERXhNbU10T0RVdU5TQXdMVEUxTlM0MklEWTNMak10TVRZd0lERTFNUzQyWVRnZ09DQXdJREFnTUNBNElEZ3VOR2cwT0M0eFl6UXVNaUF3SURjdU9DMHpMaklnT0M0eExUY3VOQ0F6TGpjdE5Ea3VOU0EwTlM0ekxUZzRMallnT1RVdU9DMDRPQzQyY3preUlETTVMakVnT1RVdU9DQTRPQzQyWXk0eklEUXVNaUF6TGprZ055NDBJRGd1TVNBM0xqUklOalkwWVRnZ09DQXdJREFnTUNBNExUZ3VORU0yTmpjdU5pQTJNREF1TXlBMU9UY3VOU0ExTXpNZ05URXlJRFV6TTNwdE1USTRMVEV4TW1FME9DQTBPQ0F3SURFZ01DQTVOaUF3SURRNElEUTRJREFnTVNBd0xUazJJREI2SWk4K0RRbzhMM04yWno0PSIgfQ=="

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Dynamic Svg Nft", function () {
      let dynamicSvgNft: DynamicSvgNft
      let deployer: SignerWithAddress
      let aggregatorV3: AggregatorV3Interface
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "dynamicsvgnft"])
        dynamicSvgNft = (await ethers.getContract(
          "DynamicSvgNft"
        )) as DynamicSvgNft
        aggregatorV3 = (await ethers.getContract(
          "MockV3Aggregator"
        )) as AggregatorV3Interface
      })
      describe("constructor", function () {
        it("create a token", async function () {
          assert.equal(await dynamicSvgNft.name(), "Dynamic SVG NFT")
          assert.equal(await dynamicSvgNft.symbol(), "DSN")
        })

        it("set the token counter to zero", async function () {
          assert.equal((await dynamicSvgNft.getTokenCounter()).toString(), "0")
        })

        it("set the price feed", async function () {
          assert.equal(await dynamicSvgNft.getPriceFeed(), aggregatorV3.address)
        })

        it("set the lowSvgNft and highSvgNft", async function () {
          assert.equal(await dynamicSvgNft.getLowSvgNft(), lowSVGImageuri)
          assert.equal(await dynamicSvgNft.getHighSvgNft(), highSVGimageUri)
        })
      })

      describe("mintNft", function () {
        it("emits an event and creates highSvgNft nft is value is >=1", async function () {
          const highValue = ethers.utils.parseEther("1")
          await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
            dynamicSvgNft,
            "NftMinted"
          )
          const tokenCounter = await dynamicSvgNft.getTokenCounter()
          assert.equal(tokenCounter.toString(), "1")
          const tokenURI = await dynamicSvgNft.tokenURI(0)
          assert.equal(tokenURI, highTokenUri)
        })
        it("emits an event and creates lowSvgNft nft is value is < 1", async function () {
          const lowValue = ethers.utils.parseEther("0.5")
          await expect(dynamicSvgNft.mintNft(lowValue)).to.emit(
            dynamicSvgNft,
            "NftMinted"
          )
          const tokenCounter = await dynamicSvgNft.getTokenCounter()
          assert.equal(tokenCounter.toString(), "1")
          const tokenURI = await dynamicSvgNft.tokenURI(0)
          assert.equal(tokenURI, lowTokenUri)
        })
      })
    })
