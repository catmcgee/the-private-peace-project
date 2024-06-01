use dep::std;
use dep::std::eddsa::{eddsa_to_pub};

fn main(
  recipient : pub Field,
  // Private key of note
  // all notes have the same denomination
  priv_key : Field, 
  // Merkle membership proof
  note_root : pub Field, 
  index : Field,
  note_hash_path : [Field; 3],
  // Random secret to keep note_commitment private
  secret: Field,
    // Hash to be checked against the nullifier computed in the circuit
  nullifierHash: pub Field, 
) -> pub Field {
    // Compute public key from private key to show ownership
    let (pubkey_x, pubkey_y) = eddsa_to_pub(priv_key);
    
    // Compute input note commitment
    let note_commitment = std::hash::pedersen_hash([pubkey_x, pubkey_y, secret]);
    
    // Compute input note nullifier
    let nullifier = std::hash::pedersen_hash([note_commitment, index, priv_key]);
    assert(nullifierHash == nullifier);

    let new_root = std::merkle::compute_merkle_root(note_commitment, index, note_hash_path);
    assert(new_root == note_root);
    
    // Cannot have unused variables, return the recipient as public output of the circuit
    recipient
}