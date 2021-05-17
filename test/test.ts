import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import { Erc20 } from "../typechain/Erc20";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

chai.use(solidity);
const { expect } = chai;

describe("ERC20", async () => {
  let token: Erc20;
  let deployer: SignerWithAddress, user: SignerWithAddress;
  let total = ethers.utils.parseUnits("10");
  
  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const erc20Factory = await ethers.getContractFactory("ERC20");
    token = (await erc20Factory.deploy(total)) as Erc20;
    await token.deployed();
  });

  it("Assigns initial balance", async () => {
    expect(await token.balanceOf(deployer.address)).to.equal(total)
  })

  it("Transfer emits event", async () => {
    await expect(token.transfer(user.address, 7))
      .to.emit(token, "Transfer")
      .withArgs(deployer.address, user.address, 7)
  })

  it("Can not transfer above the amount", async () => {
    await expect(token.transfer(deployer.address, total.add(1))).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance"
    )
  })

  it("Send transaction changes receiver balance", async () => {
    await expect(() =>
      deployer.sendTransaction({ to: user.address, gasPrice: 0, value: 200 })
    ).to.changeBalance(user, 200)
  })

  it("Send transaction changes sender and receiver balances", async () => {
    await expect(() =>
      deployer.sendTransaction({ to: user.address, gasPrice: 0, value: 200 })
    ).to.changeBalances([deployer, user], [-200, 200])
  })
});
