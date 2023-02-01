import { ConnectButton } from "@web3uikit/web3"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"

type Props = {}

function Header({}: Props) {
  const router = useRouter()

  const styleActive = (route: string) => {
    if (route === router.pathname) {
      return "border-b-2 border-gray-700"
    } else {
      return "hover:font-semibold"
    }
  }

  return (
    <div className="flex justify-between items-center py-3 border-b bg-white">
      <h1 className="uppercase text-xl text-transparent font-extrabold hidden md:block md:ml-3 bg-clip-text bg-gradient-to-r from-blue-500 to-pink-600">
        NFT Marketplace
      </h1>
      <div className="flex gap-5 text-lg text-gray-700 ml-3 md:ml-0">
        <Link className={styleActive("/")} href="/">
          Home
        </Link>
        <Link className={styleActive("/sell")} href="/sell">
          Sell NFTs
        </Link>
      </div>
      <div>
        <ConnectButton />
      </div>
    </div>
  )
}

export default Header
