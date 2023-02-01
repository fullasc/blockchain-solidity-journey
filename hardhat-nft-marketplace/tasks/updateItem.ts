import { task } from "hardhat/config"
import updateItem from "../scripts/updateItem"

task("updateItem", "Update item")
  .addPositionalParam("tokenId", "The token id")
  .addPositionalParam("price", "The price")
  .setAction(async (taskArgs, hre) => {
    const { tokenId, price } = taskArgs
    await updateItem(hre, tokenId, price)
  })
