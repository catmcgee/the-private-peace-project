import { ethers } from 'ethers';
import { buildMimc7 } from 'circomlibjs';


// Utility function to convert inputs to Uint8Array
function toUint8Array(inputs: any[]): Uint8Array {
  return ethers.utils.concat(inputs.map(input => ethers.utils.arrayify(input)));
}


export async function mimcHash(nullifier: Uint8Array, secret: Uint8Array): Promise<string> {
    const mimc = await buildMimc7();
    const hash = mimc.hash(nullifier, secret);
    return mimc.F.toString(hash, 16).padStart(64, '0');
}


export function generateHashPathInput(hash_path: string[]) {
  let hash_path_input = [];
  for (var i = 0; i < hash_path.length; i++) {
    hash_path_input.push(`0x` + hash_path[i]);
  }
  return hash_path_input;
}

export function toHexString(byteArray: Uint8Array): string {
  return '0x' + Array.from(byteArray, byte => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
