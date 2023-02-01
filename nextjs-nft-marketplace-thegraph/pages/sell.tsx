import { Button, useNotification } from "@web3uikit/core"
import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  useMoralis,
  useMoralisQuery,
  useNFTBalances,
  useWeb3Contract,
} from "react-moralis"
import NFTBox from "../components/NFTBox"
import { networkMapping, nftMarketPlaceAbi } from "../constants"

type NetworkConfigItem = {
  NftMarketplace: string[]
}

type NetworkConfigMap = {
  [chainId: string]: NetworkConfigItem
}

type chainType =
  | "eth"
  | "0x1"
  | "ropsten"
  | "0x3"
  | "rinkeby"
  | "0x4"
  | "goerli"
  | "0x5"
  | "kovan"
  | "0x2a"
  | "polygon"
  | "0x89"
  | "mumbai"
  | "0x13881"
  | "bsc"
  | "0x38"
  | "bsc testnet"
  | "0x61"
  | "avalanche"
  | "0xa86a"
  | "avalanche testnet"
  | "0xa869"
  | "fantom"
  | "0xfa"

export default function Sell() {
  const dispatch = useNotification()

  const { account, chainId } = useMoralis()

  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const currentNetworkMapping = (networkMapping as NetworkConfigMap)[
    chainString
  ]

  if (!currentNetworkMapping) {
    const error = `No entry in networkMapping.json matching the current chain ID of ${chainString}`
    console.error(error)
    return <div>Error: {error}</div>
  }

  const nftMarketplaceAddress = currentNetworkMapping.NftMarketplace[0]

  const { data, error, runContractFunction, isFetching, isLoading } =
    useWeb3Contract({})

  const [availableProceeds, setAvailableProceeds] = useState<
    BigNumber | undefined
  >(undefined)

  const hasNonZeroAvailableProceeds =
    availableProceeds !== undefined && !availableProceeds.isZero()

  const fetchAvailableProceeds = async () => {
    const options = {
      abi: nftMarketPlaceAbi,
      contractAddress: nftMarketplaceAddress,
      functionName: "getProceeds",
      params: {
        seller: account,
      },
    }

    await runContractFunction({
      params: options,
      onSuccess: (result) => {
        setAvailableProceeds(result as BigNumber)
      },
    })
  }

  const {
    getNFTBalances,
    data: nfts,
    error: errorGettingNft,
  } = useNFTBalances()

  useEffect(() => {
    fetchAvailableProceeds()
    console.log("Fetching your NFTs, ", account, chainId)
    getNFTBalances({
      params: {
        address: account || "",
        chain: (chainId || "0x1") as chainType,
      },
    })
      .then((result) => {
        console.log("Got your NFTs, ", result)
      })
      .catch((error) => {
        console.error("Error getting NFTs, ", error)
      })
  }, [account])

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      message: "Proceeds withdrawn successfully",
      title: "Proceeds Withdrawn",
      position: "topR",
    })
  }

  const {
    runContractFunction: withdraw,
    error: withdrawError,
    isLoading: withdrawLoading,
  } = useWeb3Contract({
    abi: nftMarketPlaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "withdrawProceeds",
  })

  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    (query) => query.equalTo("seller", account).descending("tokenId")
  )

  const getSellerAndPrice = (nftAddress: string, tokenId: string) => {
    const matchingListing = listedNfts.find((nft) => {
      const { nftAddress: comparisonNftAddress, tokenId: comparisonTokenId } =
        nft.attributes
      return (
        nftAddress === comparisonNftAddress && tokenId === comparisonTokenId
      )
    })

    return matchingListing
      ? {
          seller: matchingListing.attributes.seller,
          price: matchingListing.attributes.price,
        }
      : {
          seller: undefined,
          price: undefined,
        }
  }

  return (
    <div className="h-full w-full bg-slate-100 mx-auto">
      <div className="p-4">
        <p>{errorGettingNft && errorGettingNft.message}</p>
        <h1 className="font-bold text-2xl text-gray-600">Your NFTs</h1>
        <div className="flex flex-wrap">
          {nfts?.result?.map((nft) => {
            const { seller, price } = getSellerAndPrice(
              nft.token_address,
              nft.token_id
            )
            return (
              <NFTBox
                nftAddress={nft.token_address}
                nftMarketPlaceAddress={nftMarketplaceAddress}
                tokenId={nft.token_id}
                seller={seller}
                price={price}
              />
            )
          })}
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2 justify-items-start w-fit">
          <h2 className="font-bold text-2xl text-gray-600">
            Withdraw proceeds
          </h2>
          {hasNonZeroAvailableProceeds ? (
            <>
              <p className="text-gray-600">
                Sales proceeds available for withdrawal:{" "}
                {ethers.utils.formatEther(
                  (availableProceeds as BigNumber) || 0
                )}{" "}
                ETH
              </p>
              <Button
                disabled={!hasNonZeroAvailableProceeds}
                id="withdraw-proceeds"
                onClick={() =>
                  withdraw({
                    onSuccess: handleWithdrawSuccess,
                    onError: (error) => console.error(error),
                  })
                }
                text="Withdraw"
                theme="primary"
                type="button"
              />
            </>
          ) : (
            <p className="text-gray-600">No withdrawable proceeds available</p>
          )}
        </div>
      </div>
    </div>
  )
}
