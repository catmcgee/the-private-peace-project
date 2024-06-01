// deploy verifier 
// deploy deplositandwithdraw with verifier and funds of 0.01 eth
// create note with mimcHash(nullifier + secret)
// call addaddress with account a
// call deposit with note and value of 0.01 eth with account b, 
// get index from the event emitted
// use MerkleTree.ts to get other information we need
// call getaddress with account b
// hash everything into a "note", encryptoed to the recipient public key
// send note over xmtp to account a from account c to account b
// account b decrypts this note
// they put this information into the noir circuit 
// they call withdraw() with proof along with public inputs
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployVerifier, deployHasher, deployDepositAndWithdraw } from "./utils/deploy";
import { Contract } from "ethers";
import { generateHashPathInput } from "./utils/pedersen";
import { MerkleTreeMiMC } from "./utils/MerkleTree";
import { buildMimc7 as buildMimc } from 'circomlibjs';

function toHexString(byteArray: Uint8Array): string {
    return '0x' + Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

describe("Private Peace Project Tests", function () {
    let verifier: Contract;
    let hasher: Contract;
    let depositAndWithdraw: Contract;
    let accounts: any;
    let index: any;
    let tree: MerkleTreeMiMC;

    const nullifier = ethers.utils.randomBytes(32);
    const secret = ethers.utils.randomBytes(32);

    before(async function () {
        // Deploy contracts
        verifier = await deployVerifier();
        hasher = await deployHasher();
        const amount = ethers.utils.parseEther("0.01");
        const merkleTreeHeight = 30;
        depositAndWithdraw = await deployDepositAndWithdraw(verifier.address, hasher.address, amount, merkleTreeHeight);

        // Get accounts
        accounts = await ethers.getSigners();

        // Initialize Merkle Tree
        const mimc = await buildMimc();
        tree = new MerkleTreeMiMC(merkleTreeHeight, mimc);
    });

    it("Should deploy Verifier, Hasher, and DepositAndWithdraw contracts", async function () {
        expect(verifier.address).to.properAddress;
        expect(hasher.address).to.properAddress;
        expect(depositAndWithdraw.address).to.properAddress;
    });

    it("Should create a note with MiMC hash", async function () {
        const mimc = await buildMimc();
        const note = mimc.multiHash([nullifier, secret]);
        const noteHex = toHexString(note);
        console.log("Note Hex:", noteHex);
    });

    it("Should add Palestine address to contract", async function () {
        await depositAndWithdraw.addAddress(0); // 0 = Palestinian type
        // TODO: Call function to get address
    });

    it("Should make a deposit", async function () {
        // Create note
        const mimc = await buildMimc();
        const note = mimc.multiHash([nullifier, secret]);
        const noteHex = toHexString(note);

        console.log("Note Hex:", noteHex);

        // Ensure the note is within the field size
        const noteValue = ethers.BigNumber.from(noteHex).mod(ethers.BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617")).toHexString();

        // Make a deposit
        const tx = await depositAndWithdraw.connect(accounts[1]).deposit(noteValue, { value: ethers.utils.parseEther("0.01") });
        const receipt = await tx.wait();


        const event = receipt.events?.find((event: { event: string }) => event.event === "Deposit");
        if (!event) {
            throw new Error("Deposit event not found");
        }

        // Decode the event using the contract interface
        const decodedEvent = depositAndWithdraw.interface.decodeEventLog("Deposit", event.data, event.topics);
        index = decodedEvent[1];
        console.log("Deposit made with index:", index);

        expect(index).to.not.be.undefined;
    });

   
    it("Should get correct Merkle tree information", async function () {
      // Create note
      const mimc = await buildMimc();
      const note = mimc.multiHash([nullifier, secret]);
      const noteHex = toHexString(note);

      // Ensure the note is within the field size
      const noteValue = ethers.BigNumber.from(noteHex).mod(ethers.BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617")).toHexString();

      // Insert the note into the Merkle Tree
      tree.insert(noteValue);

      // Get the root of the Merkle Tree
      // const note_root = tree.root();
      // console.log("Merkle Tree Root:", note_root);

      // // Generate the Merkle Proof
      // const merkleProof = tree.proof(index);
      // const note_hash_path = merkleProof.pathElements;
      // console.log("Merkle Proof Path Elements:", note_hash_path);

      // Verify the proof with the verifier contract
      // let inputs = {
      //     recipient: accounts[2].address,
      //     note_root: `0x` + note_root,
      //     index: index,
      //     note_hash_path: generateHashPathInput(note_hash_path),
      //     secret: `0x` + Buffer.from(secret).toString('hex'),
      //     nullifierHash: `0x` + Buffer.from(nullifier).toString('hex'),
      // };

        // noir js stuff
    });
});
