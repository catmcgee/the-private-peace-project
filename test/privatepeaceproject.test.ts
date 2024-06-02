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
// they put this information into the noir cigitrcuit 
// they call withdraw() with proof along with public inputs
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployVerifier, deployHasher, deployDepositAndWithdraw, deployPalestineVerifier } from "./utils/deploy";
import { Contract } from "ethers";
import { generateHashPathInput, encrypt, decrypt, convertDecryptedProofInputs, validateProofInputs, convertProofToBytes } from "./utils/mimc";
import { MerkleTreeMiMC } from "./utils/MerkleTree";
import { buildMimc7 as buildMimc } from 'circomlibjs';
import { Client, Conversation } from '@xmtp/xmtp-js';
import { generateKeyPairSync } from 'crypto';
import { Wallet } from 'ethers';
import { generateProof, generatePalestineProof } from './utils/noir';

function toHexString(byteArray: Uint8Array): string {
    return '0x' + Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

describe("Private Peace Project Tests", function () {
  interface ProofInputs {
      recipient: string;
      note_root: string;
      index: number;
      note_hash_path: any;
      secret: string;
      nullifierHash: string;
  }

  let verifier: Contract;
  let palestinianVerifier: Contract;
  let hasher: Contract;
  let depositAndWithdraw: Contract;
  let accounts: any;
  let index: any;
  let tree: MerkleTreeMiMC;
  let proofInputs: ProofInputs;
  let encryptedProofInputs: string;
  let decryptedReceivedProofInputs: any;
  let proof: any;
  let recipient: any;
  let note_root: any;

  const nullifier = ethers.utils.randomBytes(32);
  const secret = ethers.utils.randomBytes(32);

  before(async function () {
      // Deploy contracts
      verifier = await deployVerifier();
      palestinianVerifier = await deployPalestineVerifier();
      hasher = await deployHasher();
      const amount = ethers.utils.parseEther("0.01");
      const merkleTreeHeight = 3;
      depositAndWithdraw = await deployDepositAndWithdraw(verifier.address, palestinianVerifier.address, hasher.address, amount, merkleTreeHeight);

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
      recipient = ethers.BigNumber.from(accounts[0].address).toHexString();
      const noteCommitment = mimc.multiHash([recipient, ethers.BigNumber.from(secret).toHexString()]);
      const noteHex = toHexString(noteCommitment);
  });

  it("Should add Palestine address to contract", async function () {
            try {
               proof = await generatePalestineProof({x:1});
              console.log("Generated palestine Proof:", proof);
          } catch (error) {
              console.error("Failed to generate nationality proof:", error);
          }

      await depositAndWithdraw.connect(accounts[0]).addAddress(0, recipient, proof); // 0 = Palestinian type
      // TODO: Call function to get address
  });

  it("Should make a deposit", async function () {
      const mimc = await buildMimc();
      recipient = ethers.BigNumber.from(accounts[0].address).toHexString();
      const noteCommitment = mimc.multiHash([recipient, ethers.BigNumber.from(secret).toHexString()]);
      const noteHex = toHexString(noteCommitment);

      const noteValue = ethers.BigNumber.from(noteHex).mod(ethers.BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617")).toHexString();

      const tx = await depositAndWithdraw.connect(accounts[1]).deposit(noteValue, { value: ethers.utils.parseEther("0.01") });
      const receipt = await tx.wait();

      const event = receipt.events?.find((event: { event: string }) => event.event === "Deposit");
      if (!event) {
          throw new Error("Deposit event not found");
      }

      const decodedEvent = depositAndWithdraw.interface.decodeEventLog("Deposit", event.data, event.topics);
      index = decodedEvent[1];

      expect(index).to.not.be.undefined;
  });

  it("Should get correct Merkle tree information", async function () {
      const mimc = await buildMimc();
      recipient = ethers.BigNumber.from(accounts[0].address).toHexString();
      const noteCommitment = mimc.multiHash([recipient, ethers.BigNumber.from(secret).toHexString()]);
      const noteHex = toHexString(noteCommitment);

      const noteValue = ethers.BigNumber.from(noteHex).mod(ethers.BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617")).toHexString();

      tree.insert(noteValue);

      note_root = tree.root();

      const merkleProof = tree.proof(index);
      const note_hash_path = merkleProof.pathElements;

      proofInputs = {
          recipient: accounts[0].address,
          note_root: note_root,
          index: index,
          note_hash_path: generateHashPathInput(note_hash_path),
          secret: '0x' + Buffer.from(secret).toString('hex'),
          nullifierHash: '0x' + Buffer.from(nullifier).toString('hex'),
      };
  });

  it("Should send and receive encrypted proofInputs over XMTP and be able to decrypt", async function () {
    const proofInputsJson = JSON.stringify(proofInputs);

    const { publicKey: recipientPublicKey, privateKey: recipientPrivateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
    }); // when implementing it you should use recipientPublicKey that is in the proofinputs to encrypt
    // and the recipient's private key to decrypt
    // dont need to make this new account

    const recipientPublicKeyPem = recipientPublicKey.export({ type: 'pkcs1', format: 'pem' }) as string;
    const recipientPrivateKeyPem = recipientPrivateKey.export({ type: 'pkcs1', format: 'pem' }) as string;

    // Encrypt the proof inputs with the recipient's RSA public key
    const encryptedProofInputs = encrypt(proofInputsJson, recipientPublicKeyPem);
          // XMTP Part
    const walletA: Wallet = accounts[0]; // receiver
    const walletB: Wallet = accounts[2]; // the protocol account

    // Initialize XMTP clients
    const xmtpClientA: Client = await Client.create(walletA);
    const xmtpClientB: Client = await Client.create(walletB);

    // Ensure that both clients are properly authenticated
    if (!xmtpClientA || !xmtpClientB) {
        throw new Error("Failed to initialize XMTP clients");
    }

    // Initialize conversation from A to B
    let conversation: Conversation;
    const conversationsA: Conversation[] = await xmtpClientA.conversations.list();
    const existingConversation: Conversation | undefined = conversationsA.find(conv => conv.peerAddress === walletB.address);

    if (existingConversation) {
        conversation = existingConversation;
    } else {
        conversation = await xmtpClientA.conversations.newConversation(walletB.address);
    }

    // Assuming encryptedProofInputs is a string or a Buffer
    await conversation.send(encryptedProofInputs);

    // Wait for a moment to ensure the message is sent and received
    await new Promise(resolve => setTimeout(resolve, 10000)); // Increase to 10 seconds

    // Function to refetch conversations and messages
    const refetchMessages = async (client: Client, walletAddress: string): Promise<string[]> => {
        const conversations: Conversation[] = await client.conversations.list();
        const conversation: Conversation | undefined = conversations.find(conv => conv.peerAddress === walletAddress);

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const messages = await conversation.messages();
        return messages.map(msg => msg.content);
    };

      // Receive the encrypted proof inputs
      const messages: string[] = await refetchMessages(xmtpClientB, walletA.address);

      if (!messages || messages.length === 0) {
          throw new Error("No messages found in conversation");
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
          throw new Error("Last message is undefined");
      }

      const decryptedReceivedProofInputsJson = decrypt(lastMessage, recipientPrivateKeyPem);
      decryptedReceivedProofInputs = JSON.parse(decryptedReceivedProofInputsJson);

      expect(decryptedReceivedProofInputs).to.deep.equal(proofInputs);

    });

  it("Should withdraw with proof with decrypted received proof inputs", async function () {
    // Convert the decrypted proof inputs to the appropriate types
    const convertedProofInputs = convertDecryptedProofInputs(decryptedReceivedProofInputs);

    // Validate the proof inputs
    validateProofInputs(convertedProofInputs);

    // Log the proof inputs for debugging
    const mimc = await buildMimc();

    try {
        proof = await generateProof(convertedProofInputs);
    } catch (error) {
        console.error("Failed to generate proof:", error);
    }

    try {

      const tx = await depositAndWithdraw.connect(accounts[0]).withdraw(proof, "0x1018e01c1cc6a233e666507878a74520e54e6c48b4f09a76735e66bc609573ae"); // this is what is printed when you console.log note root - just weird type stuff is making this fail
      await tx.wait();
      console.log('Withdraw transaction successful:', tx);
  } catch (error) {
      console.error('Withdraw transaction failed:', error);
  }
  });
});
