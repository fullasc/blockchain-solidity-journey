import { useEffect } from "react"
import { ethers } from "ethers"
import { networkMapping, nftMarketPlaceAbi } from "../constants"
import NFTBox from "../components/NFTBox"
import { useQuery } from "@apollo/client"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useMoralis } from "react-moralis"

interface nftInterface {
  price: number
  nftAddress: string
  tokenId: number
  address: string
  seller: string
}

type contractNameAndAddress = {
  [key: string]: string[]
}

type contractAddressesInterface = {
  [key: string]: contractNameAndAddress
}

export default function Home() {
  const { chainId } = useMoralis()
  const addresses: contractAddressesInterface = networkMapping
  const marketPlaceAddress = chainId
    ? addresses[parseInt(chainId!).toString()]?.NftMarketplace[0]
    : null

  const {
    loading,
    error: subgraphQueryError,
    data: listedNfts,
  } = useQuery(GET_ACTIVE_ITEMS)

  return (
    <div className="h-full w-full bg-slate-100 mx-auto">
      <h1 className="p-4 font-bold text-2xl text-gray-600">Recently listed</h1>
      <div className="flex flex-wrap justify-center">
        {loading || !listedNfts ? (
          <div>Loading...</div>
        ) : (
          listedNfts.activeItems.map((nft: nftInterface) => {
            const { price, nftAddress, tokenId, seller } = nft
            return (
              <NFTBox
                price={price}
                nftAddress={nftAddress}
                tokenId={tokenId.toString()}
                nftMarketPlaceAddress={marketPlaceAddress!}
                seller={seller}
                key={`${nftAddress}${tokenId}`}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
