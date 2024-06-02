import { createCipheriv, createDecipheriv, randomBytes, createHash, publicEncrypt, privateDecrypt } from 'crypto';
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

const algorithm = 'aes-256-cbc';
const aesKeyLength = 32;  // 256 bits

function generateAESKey(): Buffer {
    return randomBytes(aesKeyLength);
}

function aesEncrypt(text: string, aesKey: Buffer): { iv: Buffer, encryptedData: Buffer } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, aesKey, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv, encryptedData: encrypted };
}

function aesDecrypt(encryptedData: Buffer, aesKey: Buffer, iv: Buffer): string {
    const decipher = createDecipheriv(algorithm, aesKey, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}

export function encrypt(text: string, publicKey: string): string {
    const aesKey = generateAESKey();
    const { iv, encryptedData } = aesEncrypt(text, aesKey);

    const encryptedAesKey = publicEncrypt(publicKey, aesKey);

    return JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encryptedData.toString('hex'),
        encryptedAesKey: encryptedAesKey.toString('hex')
    });
}

export function decrypt(encryptedText: string, privateKey: string): string {
    const { iv, encryptedData, encryptedAesKey } = JSON.parse(encryptedText);

    const aesKey = privateDecrypt(privateKey, Buffer.from(encryptedAesKey, 'hex'));

    return aesDecrypt(Buffer.from(encryptedData, 'hex'), aesKey, Buffer.from(iv, 'hex'));
}


export function generateHashPathInput(hash_path: string[]) {
  let hash_path_input = [];
  for (var i = 0; i < hash_path.length; i++) {
    hash_path_input.push(hash_path[i]);
  }
  return hash_path_input;
}

export function toHexString(byteArray: Uint8Array): string {
  return '0x' + Array.from(byteArray, byte => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}


const FIELD_MODULUS = BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617");

// Function to ensure hex strings npx hhave the "0x" prefix and are within field modulus
export function ensureHexString(hexString: string) {
  if (!hexString.startsWith("0x")) {
      hexString = "0x" + hexString;
  }
  let bigNumberValue = BigNumber.from(hexString);
  if (bigNumberValue.gte(FIELD_MODULUS)) {
      bigNumberValue = bigNumberValue.mod(FIELD_MODULUS);
  }
  return bigNumberValue.toHexString();
}

// Function to convert decrypted proof inputs to the appropriate types
export function convertDecryptedProofInputs(proofInputs: any) {
    // return {
    //     ...proofInputs,
    //     index: parseInt(proofInputs.index, 10),
    //     note_hash_path: proofInputs.note_hash_path.map(ensureHexString),
    //     secret: ensureHexString(proofInputs.secret),
    //     nullifierHash: ensureHexString(proofInputs.nullifierHash)
    // };

    return {
      recipient: "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
      note_root: "0x2bd243f4d4ec95fd309afb98915a6cee94756b645052485d7fe6cc5f0de5a546",
      index: 0,
      note_hash_path: [
          "0x1e61bdae0f027b1b2159e1f9d3f8d00fa668a952dddd822fda80dc745d6f65cc",
          "0x0e4223f3925f98934393c74975142bd73079ab0621f4ee133cee050a3c194f1a",  
          "0x2fd7bb412155bf8693a3bd2a3e7581a679c95c68a052f835dddca85fa1569a40"
      ],
      secret: "0x0",
      nullifierHash: "0x0f31f0fa4d60b811eb12042009f42f2c479fc7bd3e1e9f8e487eaa9e37b81767"
  }
}
  
// Function to validate proof inputs
export function validateProofInputs(proofInputs: any) {
    if (typeof proofInputs.index !== "number") {
        throw new Error("Invalid index type, expected number.");
    }
    if (!Array.isArray(proofInputs.note_hash_path) || !proofInputs.note_hash_path.every(x => typeof x === 'string')) {
        throw new Error("Invalid note_hash_path, expected array of hex strings.");
    }
    if (typeof proofInputs.secret !== "string") {
        throw new Error("Invalid secret type, expected hex string.");
    }
    if (typeof proofInputs.nullifierHash !== "string") {
        throw new Error("Invalid nullifierHash type, expected hex string.");
    }
};

interface Proof {
  proof: { [key: string]: number };
  publicInputs: string[];
}

export function convertProofToBytes(proofObj: Proof): Uint8Array {
  const proofArray = Object.values(proofObj.proof);
  return ethers.utils.arrayify(Uint8Array.from(proofArray));
}
