import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function deployVerifier(): Promise<Contract> {
  const Verifier = await ethers.getContractFactory("UltraVerifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("Verifier deployed at", verifier.address);
  return verifier;
}

export async function deployHasher(): Promise<Contract> {

  const [deployer] = await ethers.getSigners();
  const hasherArtifactPath = path.join(__dirname, '../../artifacts/contracts/Hasher.json');
  const hasherArtifact = JSON.parse(fs.readFileSync(hasherArtifactPath, 'utf8'));
  const HasherFactory = new ethers.ContractFactory(hasherArtifact.abi, hasherArtifact.bytecode, deployer);
  const hasher = await HasherFactory.deploy();
  await hasher.deployed();
  console.log("Hasher deployed at", hasher.address);
  return hasher;
}

export async function deployDepositAndWithdraw(
  verifierAddress: string,
  hasherAddress: string,
  amount: BigNumber,
  merkleTreeHeight: number
): Promise<Contract> {
  const DepositAndWithdraw = await ethers.getContractFactory("DepositAndWithdraw");
  const depositAndWithdraw = await DepositAndWithdraw.deploy(verifierAddress, hasherAddress, amount, merkleTreeHeight);
  await depositAndWithdraw.deployed();
  console.log("DepositAndWithdraw deployed at", depositAndWithdraw.address);
  return depositAndWithdraw;
}
