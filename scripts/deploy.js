const { ethers } = require("hardhat");
const { deployVerifier, deployPalestineVerifier, deployHasher, deployDepositAndWithdraw } = require("../test/utils/deploy");

async function main() {
  const verifier = await deployVerifier();

  const palestinianVerifier = await deployPalestineVerifier();

  const hasher = await deployHasher();

  const amount = ethers.utils.parseEther("0.01");
  const merkleTreeHeight = 3;

  const depositAndWithdraw = await deployDepositAndWithdraw(verifier.address, palestinianVerifier.address, hasher.address, amount, merkleTreeHeight);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
