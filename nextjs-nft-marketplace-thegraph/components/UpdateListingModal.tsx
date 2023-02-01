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
  nftMarketplaceAbi: object
  nftMarketplaceAddress: string
  nftAddress: string
  tokenId: string
  imageURI: string | undefined
  currentPrice: number | undefined
}

const UpdateListingModal = ({
  isVisible,
  onClose,
  nftMarketplaceAbi,
  nftMarketplaceAddress,
  nftAddress,
  tokenId,
  imageURI,
  currentPrice,
}: Props) => {
  const dispatch = useNotification()
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState<
    string | undefined
  >()

  const handleUpdateListingSuccess = () => {
    dispatch({
      type: "success",
      message: "Listing updated successfully",
      title: "Listing Updated",
      position: "topR",
    })
    onClose && onClose()
  }

  const handleCancelListingSuccess = () => {
    dispatch({
      type: "success",
      message: "Listing canceled successfully",
      title: "Listing Canceled",
      position: "topR",
    })
    onClose && onClose()
  }

  const {
    runContractFunction: cancelListing,
    error: cancelListingError,
    isFetching: cancelListingFetching,
    isLoading: cancelListingLoading,
  } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "cancelItem",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  })

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "updateItem",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      price: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  })

  return (
    <Modal
      title="NFT Details"
      isVisible={isVisible}
      id="regular"
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() =>
        updateListing({
          onSuccess: () => handleUpdateListingSuccess(),
          onError: (error: any) => console.log(error),
        })
      }
      okText="Save New Listing Price"
      cancelText="Leave it"
      isOkDisabled={!priceToUpdateListingWith}
    >
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4 pb-4">
          <p className="p-4 text-lg">
            This is your listing. You may either update the listing price or
            cancel it.
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
            label="Update listing price"
            name="New listing price"
            onChange={(event) =>
              setPriceToUpdateListingWith(event.target.value)
            }
            type="number"
          />
          or
          <Button
            id="cancel-listing"
            onClick={() =>
              cancelListing({
                onSuccess: () => handleCancelListingSuccess(),
                onError: () => console.log(cancelListingError),
              })
            }
            text="Cancel Listing"
            theme="colored"
            color="red"
            type="button"
            disabled={cancelListingFetching}
          />
        </div>
      </div>
    </Modal>
  )
}

export default UpdateListingModal
