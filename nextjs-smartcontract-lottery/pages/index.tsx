import type { NextPage } from "next"
import Head from "next/head"
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Smart contract lottery</title>
        <meta name="description" content="Smart contract lottery on the web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-[#364958] h-screen text-white">
        <Header />
        <LotteryEntrance />
      </main>
    </div>
  )
}

export default Home
