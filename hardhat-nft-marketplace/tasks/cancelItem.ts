import { task } from "hardhat/config"
import cancelItem from "../scripts/cancelItem"

task("cancelItem", "Cancel item")
  .addPositionalParam("tokenId", "The token id")
  .setAction(async (taskArgs, hre) => {
    const { tokenId } = taskArgs
    await cancelItem(hre, tokenId)
  })
