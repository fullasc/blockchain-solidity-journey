import React from "react"
import { useMoralis } from "react-moralis"
import { useEffect } from "react"

type Props = {}

function ManualHeader({}: Props) {
  const {
    enableWeb3,
    deactivateWeb3,
    account,
    isWeb3Enabled,
    isWeb3EnableLoading,
    Moralis,
  } = useMoralis()

  useEffect(() => {
    if (isWeb3Enabled) return
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) {
        enableWeb3()
      }
    }
  }, [isWeb3Enabled, enableWeb3])

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`)
      if (account == null) {
        window.localStorage.removeItem("connected")
        deactivateWeb3()
        console.log("Null account found")
      }
    })
  }, [account, deactivateWeb3, Moralis])

  const handleConnect = async () => {
    console.log("Connecting...")
    await enableWeb3()
    if (typeof window !== "undefined") {
      window.localStorage.setItem("connected", "injected")
    }
  }

  return (
    <div>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button onClick={handleConnect} disabled={isWeb3EnableLoading}>
          Connect
        </button>
      )}
    </div>
  )
}

export default ManualHeader
