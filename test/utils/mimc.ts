import { createCipheriv, createDecipheriv, randomBytes, createHash, publicEncrypt, privateDecrypt, generateKeyPairSync } from 'crypto';

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
    hash_path_input.push(`0x` + hash_path[i]);
  }
  return hash_path_input;
}

function hexStringToUint8Array(hexString: string): Uint8Array {
  let cleanedHexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  if (cleanedHexString.length % 2 !== 0) {
      cleanedHexString = '0' + cleanedHexString;
  }
  const byteArray = new Uint8Array(cleanedHexString.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = parseInt(cleanedHexString.substr(i * 2, 2), 16);
  }
  return byteArray;
}

export function toHexString(byteArray: Uint8Array): string {
  return '0x' + Array.from(byteArray, byte => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
