import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ItemBought as ItemBoughtEvent,
  ItemCancelled as ItemCancelledEvent,
  ItemListed as ItemListedEvent,
  WithdrawProceeded as WithdrawProceededEvent,
} from "../generated/NftMarketplace/NftMarketplace"
import {
  ActiveItem,
  ItemBought,
  ItemListed,
  ItemCanceled,
} from "../generated/schema"

export function handleItemBought(event: ItemBoughtEvent): void {
  // Save that event in our graph
  // update our activeItems
  // get or create an itemListed event
  // each item has a unique id
  let itemBought = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  if (!itemBought) {
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    )
  }
  itemBought.buyer = event.params.buyer
  itemBought.nftAddress = event.params.nftContract
  itemBought.tokenId = event.params.tokenId
  activeItem!.buyer = event.params.buyer

  itemBought.save()
  activeItem!.save()
}

export function handleItemCancelled(event: ItemCancelledEvent): void {
  let itemCancelled = ItemCanceled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  if (!itemCancelled) {
    itemCancelled = new ItemCanceled(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    )
  }
  itemCancelled.buyer = event.params.buyer
  itemCancelled.nftAddress = event.params.nftContract
  itemCancelled.tokenId = event.params.tokenId

  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  )

  itemCancelled.save()
  activeItem!.save()
}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  )
  if (!itemListed) {
    itemListed = new ItemListed(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    )
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    )
  }
  itemListed.seller = event.params.seller
  itemListed.nftAddress = event.params.nftContract
  itemListed.tokenId = event.params.tokenId
  itemListed.price = event.params.price

  activeItem.seller = event.params.seller
  activeItem.nftAddress = event.params.nftContract
  activeItem.tokenId = event.params.tokenId
  activeItem.price = event.params.price
  activeItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  )

  itemListed.save()
  activeItem.save()
}

export function handleWithdrawProceeded(event: WithdrawProceededEvent): void {}

const getIdFromEventParams = (tokenId: BigInt, nftAddress: Address): string => {
  return tokenId.toHexString() + nftAddress.toHexString()
}
