import { ethers } from "hardhat"
import { expect, assert } from "chai"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types"

describe("SimpleStorage", function () {
  let simpleStorageFactory: SimpleStorage__factory
  let simpleStorage: SimpleStorage

  beforeEach(async function () {
    simpleStorageFactory = (await ethers.getContractFactory(
      "SimpleStorage"
    )) as SimpleStorage__factory
    simpleStorage = await simpleStorageFactory.deploy()
    await simpleStorage.deployed()
  })

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"
    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue.toString()).to.equal(expectedValue)
  })

  it("Should start update the favorite number to 42", async function () {
    const expectedValue = "42"
    const txRes = await simpleStorage.store(expectedValue)
    await txRes.wait(1)
    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue.toString()).to.equal(expectedValue)
  })

  it("Should add a person name and favorite number", async function () {
    const expectedName = "John"
    const expectedValue = "42"

    const txRes = await simpleStorage.addPerson(expectedName, expectedValue)
    await txRes.wait(1)

    const { favoriteNumber, name } = await simpleStorage.people(0)

    assert.equal(favoriteNumber.toString(), expectedValue)
    assert.equal(name.toString(), expectedName)
  })
})
