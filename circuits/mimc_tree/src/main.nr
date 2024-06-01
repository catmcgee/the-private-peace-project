use dep::std;
use dep::std::eddsa::{eddsa_to_pub};

fn main(
  // Public key of person receiving note
  recipient: Field,
  // all notes have the same denomination
  // Merkle membership proof
  note_root: pub Field, 
  index: Field,
  note_hash_path: [Field;3],
  // Random secret to keep note_commitment private
  secret: Field,
  // Hash to be checked against the nullifier computed in the circuit
  nullifierHash: pub Field, 
) -> pub Field {
    
    let note_commitment = std::hash::pedersen_hash([recipient, secret]);
    
    // Compute input note nullifier
    let nullifier = std::hash::pedersen_hash([note_commitment, index, recipient]);
    assert(nullifierHash == nullifier);

    // Check that the input note commitment is in the root
    let new_root = compute_root_from_leaf(note_commitment, index, note_hash_path);
    assert(new_root == note_root);

    nullifier
}

// Returns the root of the tree from the provided leaf and its hashpath, using mimc hash
fn compute_root_from_leaf(leaf : Field, index : Field, hash_path: [Field;3]) -> Field {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };

        current = std::hash::mimc::mimc_bn254([hash_left, hash_right]);
    };

    current
}

#[test]
fn test_main() {
    let recipient = 0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8;
    let note_root = 0x2cc7066c9bac96f0e1d5a0712a3d57fd52e3f0cf9f2dd7f6962d9b694a0b1577;
    let index = 0;
    let note_hash_path = [0x1e61bdae0f027b1b2159e1f9d3f8d00fa668a952dddd822fda80dc745d6f65cc,
                          0x0e4223f3925f98934393c74975142bd73079ab0621f4ee133cee050a3c194f1a,  
                          0x2fd7bb412155bf8693a3bd2a3e7581a679c95c68a052f835dddca85fa1569a40];
    let secret = 0x0;
    let note_commitment = std::hash::pedersen_hash([recipient, secret]);
    let nullifier_hash = std::hash::pedersen_hash([note_commitment, index, recipient]);

    main(recipient,note_root,index,note_hash_path,secret,nullifier_hash);
}