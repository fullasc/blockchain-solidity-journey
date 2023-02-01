import {
  Card,
  CryptoCards,
  Illustration,
  Tooltip,
  useNotification,
} from "@web3uikit/core"
import { ethers } from "ethers"
import nftAbi from "../constants/BasicNft.json"
import nftMarketPlaceAbi from "../constants/NftMarketplace.json"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import UpdateListingModal from "./UpdateListingModal"
import SellNftModal from "./SellNftModal"

const URL_TEMPO =
  "https://psilo.mypinata.cloud/ipfs/QmfQpowAwnfeGcp3hjjnbmJ5tqUPewC1qeSb7XSa2q8W91/534"

type Props = {
  price?: number
  nftAddress: string
  tokenId: string
  nftMarketPlaceAddress: string
  seller?: string
}

const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr

  const separator = "..."

  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return (
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  )
}

const NFTBox = ({
  price,
  nftAddress,
  tokenId,
  nftMarketPlaceAddress,
  seller,
}: Props) => {
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const [imageURI, setImageURI] = useState<string | undefined>()
  const [tokenName, setTokenName] = useState<string | undefined>()
  const [tokenDescription, setTokenDescription] = useState<string | undefined>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const isListed = seller !== undefined
  const isOwnedByUser = seller === account || seller === undefined

  const dispatch = useNotification()

  const {
    runContractFunction: getTokenURI,
    data: tokenURI,
    error,
  } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: 1,
    },
  })

  const { runContractFunction: buyItem, data: buyError } = useWeb3Contract({
    abi: nftMarketPlaceAbi,
    contractAddress: nftMarketPlaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  })

  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15)

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item bought successfully",
      title: "Item bought",
      position: "topR",
    })
  }

  const handleCardClick = async () => {
    if (isOwnedByUser) {
      setShowModal(true)
    } else {
      console.log(nftMarketPlaceAddress)
      await buyItem({
        onSuccess: () => handleBuyItemSuccess(),
        onError: (error: any) => console.log(error),
      })
    }
  }

  const tooltipContent = isListed
    ? isOwnedByUser
      ? "Update listing"
      : "Buy me"
    : "Create listing"

  async function updateUI() {
    console.log(`TokenURI is: ${tokenURI}`)
    if (tokenURI) {
      const requestURL = URL_TEMPO
      // const requestURL = (tokenURI as string).replace(
      //   "ipfs://",
      //   "https://ipfs.io/ipfs/"
      // )
      const tokenURIResponse = await (await fetch(requestURL)).json()
      const imageURI = tokenURIResponse.image
      const imageURIURL = (imageURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      )
      setImageURI(imageURIURL)
      setTokenName(tokenURIResponse.name)
      setTokenDescription(tokenURIResponse.description)
    }
  }

  useEffect(() => {
    updateUI()
  }, [tokenURI])

  useEffect(() => {
    isWeb3Enabled && getTokenURI()
  }, [isWeb3Enabled])

  return (
    <div className="p-2">
      <UpdateListingModal
        isVisible={showModal && isListed}
        imageURI={imageURI}
        nftMarketplaceAbi={nftMarketPlaceAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={() => setShowModal(false)}
        nftMarketplaceAddress={nftMarketPlaceAddress}
        currentPrice={price}
      />
      <SellNftModal
        isVisible={showModal && !isListed}
        imageURI={imageURI}
        nftAbi={nftAbi}
        nftMarketplaceAbi={nftMarketPlaceAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={() => setShowModal(false)}
        nftMarketplaceAddress={nftMarketPlaceAddress}
        currentPrice={price}
      />
      <Card
        title={tokenName}
        description={tokenDescription}
        onClick={handleCardClick}
        style={{
          width: "300px",
          backgroundColor: "white",
          boxShadow: "5px 5px 5px 3px gray",
        }}
      >
        <Tooltip content={tooltipContent} position="top">
          <div className="p-2">
            {imageURI ? (
              <div className="flex flex-col items-center gap-2">
                <div>#{tokenId}</div>
                <div className="italic text-sm">
                  Owned by {formattedSellerAddress}
                </div>
                <Image
                  alt="NFT image"
                  loader={() => imageURI}
                  src={imageURI}
                  height="200"
                  width="200"
                />
                {price && (
                  <div className="font-bold text-lg">
                    {ethers.utils.formatEther(price)} ETH
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Illustration height="180px" logo="lazyNft" width="100%" />
                Loading...
              </div>
            )}
          </div>
        </Tooltip>
      </Card>
    </div>
  )
}

export default NFTBox
