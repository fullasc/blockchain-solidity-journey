import { task } from "hardhat/config"
import buyItem from "../scripts/buyItem"

task("buyItem", "Buy item")
  .addPositionalParam("tokenId", "The token id")
  .setAction(async (taskArgs, hre) => {
    const { tokenId } = taskArgs
    await buyItem(hre, tokenId)
  })
