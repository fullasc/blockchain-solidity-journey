import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const ethAmountInput = document.getElementById("ethAmount")
const balance = document.getElementById("balance")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await handleEthereum()
  } else {
    window.addEventListener("ethereum#initialized", handleEthereum, {
      once: true,
    })
    setTimeout(handleEthereum, 3000) // 3 seconds
  }

  async function handleEthereum() {
    const { ethereum } = window
    if (ethereum && ethereum.isMetaMask) {
      try {
        const account = await ethereum.request({
          method: "eth_requestAccounts",
        })
      } catch (error) {
        console.error(error)
      }
      connectButton.innerHTML = "Connected"
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log("Error...", error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const providerBalance = await provider.getBalance(contractAddress)
    const signerBalance = await provider.getSigner().getBalance()
    console.log(
      ethers.utils.formatEther(providerBalance),
      ethers.utils.formatEther(signerBalance)
    )
    balance.innerHTML = `${ethers.utils.formatEther(providerBalance)} ETH`
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

// withdraw function
async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log("Error...", error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      if (transactionReceipt.status === 1) {
        resolve(transactionReceipt)
      } else {
        reject(transactionReceipt)
      }
    })
  })
}
