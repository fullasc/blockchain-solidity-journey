import { BannerStrip } from "@web3uikit/core"
import React, { useEffect, useState } from "react"
import { useMoralis } from "react-moralis"
import { networkMapping } from "../constants"

type Props = {}

const isValidNetwork = (network: string) => {
  if (networkMapping.hasOwnProperty(network)) {
    return true
  }
  return false
}

const NetworkBanner = (props: Props) => {
  const { Moralis, isAuthenticated, web3, isWeb3Enabled } = useMoralis()
  const [currentChainId, setCurrentChainId] = useState<number | undefined>(
    undefined
  )
  const [showNetworkSwitcherDialog, setShowNetworkSwitcherDialog] =
    useState(false)

  const getChainId = async () => {
    if (!isAuthenticated && isWeb3Enabled && web3) {
      const network = await web3.getNetwork()
      setCurrentChainId(network.chainId ?? 0)
    }
    return 0
  }

  useEffect(() => {
    getChainId()
  }, [isAuthenticated, isWeb3Enabled])

  Moralis.onChainChanged(() => {
    window.location.reload()
  })

  useEffect(() => {
    if (
      currentChainId === undefined ||
      isValidNetwork(currentChainId ? currentChainId?.toString() : "")
    ) {
      setShowNetworkSwitcherDialog(false)
    } else {
      setShowNetworkSwitcherDialog(true)
    }
  }, [currentChainId])

  return (
    <div>
      {showNetworkSwitcherDialog && (
        <BannerStrip
          id="bannerStrip"
          borderRadius="5px"
          type="error"
          text="Connected to unsupported network"
        />
      )}
    </div>
  )
}

export default NetworkBanner
