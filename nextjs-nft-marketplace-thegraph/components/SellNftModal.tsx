import {
  Button,
  Illustration,
  Input,
  Modal,
  useNotification,
} from "@web3uikit/core"
import { ethers } from "ethers"
import Image from "next/image"
import React, { useState } from "react"
import { useWeb3Contract } from "react-moralis"

type Props = {
  isVisible: boolean
  onClose: () => void
  nftAbi: object
  nftMarketplaceAbi: object
  nftMarketplaceAddress: string
  nftAddress: string
  tokenId: string
  imageURI: string | undefined
  currentPrice: number | undefined
}

const SellNftModal = ({
  isVisible,
  onClose,
  nftAbi,
  nftMarketplaceAbi,
  nftMarketplaceAddress,
  nftAddress,
  tokenId,
  imageURI,
  currentPrice,
}: Props) => {
  const dispatch = useNotification()
  const [priceToListWith, setPriceToListWith] = useState<string | undefined>()

  const { data, error, runContractFunction, isFetching, isLoading } =
    useWeb3Contract({})

  const handleListItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Listing listed successfully",
      title: "Item Listed",
      position: "topR",
    })
    onClose && onClose()
  }

  const handleApproveSuccess = async (
    nftAddress: string,
    tokenId: string,
    price: string
  ) => {
    console.log("Approve Success")

    const options = {
      abi: nftMarketplaceAbi,
      contractAddress: nftMarketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: ethers.utils.parseEther(price),
      },
    }

    await runContractFunction({
      params: options,
      onSuccess: handleListItemSuccess,
    })
  }

  const approveAndList = async () => {
    if (!priceToListWith) {
      console.error("Listing price not set")
      return
    }

    const options = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: nftMarketplaceAddress,
        tokenId: tokenId,
      },
    }

    await runContractFunction({
      params: options,
      onSuccess: () =>
        handleApproveSuccess(nftAddress, tokenId, priceToListWith),
    })
  }

  return (
    <Modal
      title="NFT Details"
      isVisible={isVisible}
      id="regular"
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={approveAndList}
      okText="Create Listing"
      cancelText="Cancel"
      isOkDisabled={!priceToListWith}
    >
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4 pb-4">
          <p className="p-4 text-lg">
            Create a listing to allow others to purchase your NFT
          </p>
          <div className="flex flex-col items-end gap-2 border-2 border-gray-400 rounded p-4 w-fit">
            <div>#{tokenId}</div>
            {imageURI ? (
              <Image
                loader={() => imageURI}
                src={imageURI}
                alt="NFT image"
                height="200"
                width="200"
              />
            ) : (
              <Illustration height="180px" logo="lazyNft" width="100%" />
            )}
            <div className="font-bold text-lg">
              {ethers.utils.formatEther(currentPrice || 0)} ETH
            </div>
          </div>
          <Input
            label="Set Listing price"
            name="Listing price"
            onChange={(event) => setPriceToListWith(event.target.value)}
            type="number"
          />
        </div>
      </div>
    </Modal>
  )
}

export default SellNftModal
