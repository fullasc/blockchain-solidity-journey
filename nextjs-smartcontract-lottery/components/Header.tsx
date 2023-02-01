import { ConnectButton } from "@web3uikit/web3"
import React from "react"

type Props = {}

const Header = (props: Props) => {
  return (
    <div className="flex justify-between items-center p-3 border-b-2 bg-blue-200">
      <h1 className="font-bold text-xl uppercase text-gray-600">
        Decentralized Lottery
      </h1>
      <div>
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  )
}

export default Header
