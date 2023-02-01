import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useCallback, useEffect, useState } from "react"
import { BigNumber, ethers, ContractTransaction } from "ethers"
import { useNotification } from "@web3uikit/core"

interface contractAddressesInterface {
  [key: string]: string[]
}
export default function LotteryEntrance() {
  const addresses: contractAddressesInterface = contractAddresses
  const { web3, chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId: string = parseInt(chainIdHex!).toString()
  const raffleAddress = chainId in addresses ? addresses[chainId][0] : null
  const [entranceFee, setEntranceFee] = useState("0")
  const [numPlayers, setNumPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")

  const dispatch = useNotification()

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!, // specify the networkId
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!, // specify the networkId
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!, // specify the networkId
    functionName: "getNumberOfPlayers",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!, // specify the networkId
    functionName: "getRecentWinner",
    params: {},
  })

  const updateUI = useCallback(async () => {
    const entranceFeeFromCall = (
      (await getEntranceFee({
        onError: (error) => console.error(error),
      })) as BigNumber
    ).toString()
    const numPlayersFromCall = (
      (await getNumberOfPlayers({
        onError: (error) => console.error(error),
      })) as BigNumber
    ).toString()
    const recentWinnerFromCall = (await getRecentWinner({
      onError: (error) => console.error(error),
    })) as string
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }, [getEntranceFee, getNumberOfPlayers, getRecentWinner])

  const listenForEvents = useCallback(() => {
    const contract = new ethers.Contract(raffleAddress!, abi, web3!)
    contract.on("WinnerPicked", async (winner) => {
      updateUI()
    })
  }, [raffleAddress, web3, updateUI])

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
      //listen to events to update UI automatically.
      listenForEvents()
    }
  }, [isWeb3Enabled, listenForEvents, updateUI])

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
      // winnerPickedListener()
      // listenForEvents()
    }
  }, [isWeb3Enabled, updateUI])

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction complete!",
      title: "Tx Notification",
      position: "topR",
    })
  }

  const handleSuccess = async function (tx: ContractTransaction) {
    try {
      await tx.wait(1) // we have to wait for the transaction to be mined
      handleNewNotification()
      updateUI()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-5">
      <div>
        Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
      </div>
      <div>Number Of Players: {numPlayers} </div>
      <div> Recent Winner: {recentWinner} </div>
      {raffleAddress ? (
        <div className="py-5">
          <button
            className="bg-blue-200 rounded p-2 text-gray-600 hover:bg-blue-600 hover:text-white"
            onClick={async function () {
              await enterRaffle({
                onSuccess: (tx) => handleSuccess(tx as ContractTransaction), // The transaction was successfully sent to metamask
                onError: (error) => console.error(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
        </div>
      ) : (
        <div>No Raffle Address Detected</div>
      )}
    </div>
  )
}
