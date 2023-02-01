import "../styles/globals.css"
import type { AppProps } from "next/app"
import { MoralisProvider } from "react-moralis"
import Head from "next/head"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import MainLayout from "../layouts/main"
import { NotificationProvider } from "@web3uikit/core"
import NetworkBanner from "../components/NetworkBanner"

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/38483/nft-marketplace/v0.0.3",
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="h-screen">
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="A place to sell and buy NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NetworkBanner />
          <NotificationProvider>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  )
}
