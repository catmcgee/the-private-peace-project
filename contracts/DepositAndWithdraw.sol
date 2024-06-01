// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./MerkleTreeWithHistory.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

interface IVerifier {
    function verify(bytes calldata) external view returns (bool);
}

contract DepositAndWithdraw is MerkleTreeWithHistory, ReentrancyGuard {
    IVerifier public verifier;
    // uint256 public denomination;

    // amount deposited for each commitment
    uint256 public amount;
    bytes32 public root;

    // a nullifier is necessary to prevent someone from performing the same withdrawal twice
    mapping(bytes32 => bool) public nullifierHashes;
    // we store all commitments just to prevent accidental deposits with the same commitment
    mapping(bytes32 => bool) public commitments;

    address[] public palestinianAddresses;
    address[] public ukrainianAddresses;

    event Deposit(bytes32 indexed commitments, uint32 leafIndex, uint256 timestamp);
    event Withdrawal(address to, bytes32 nullifierHashes);

    /**
        @dev The constructor
        @param _verifier the address of SNARK verifier for this contract
        @param _hasher the address of MiMC hash contract
        @param _amount transfer amount for each deposit
        @param _merkleTreeHeight the height of deposits' Merkle Tree
    */
    constructor(
        IVerifier _verifier,
        IHasher _hasher,
        uint256 _amount,
        uint32 _merkleTreeHeight
    ) MerkleTreeWithHistory(_merkleTreeHeight, _hasher) {
        require(_amount > 0, "denomination should be greater than 0");
        verifier = _verifier;
        amount = _amount;
    }

    /**
        @dev Deposit funds into the contract. The caller must send (for ETH) or approve (for ERC20) value equal to or `denomination` of this instance.
        @param _commitment the note commitment, which is PedersenHash(nullifier + secret)
    */
    function deposit(bytes32 _commitment) external payable nonReentrant {
        require(!commitments[_commitment], "The commitment has been submitted");

        uint32 insertedIndex = _insert(_commitment);
        commitments[_commitment] = true;

        require(msg.value == amount, "Please send `mixAmount` ETH along with transaction");
        console.log("inserted index", insertedIndex);

        emit Deposit(_commitment, insertedIndex, block.timestamp);
    }

    /**
        @dev Withdraw a deposit from the contract. `proof` is a zkSNARK proof data, and input is an array of circuit public inputs
        `input` array consists of:
        - merkle root of all deposits in the contract
    */
    function withdraw(
        bytes calldata proof,
        bytes32 _root
    ) external payable nonReentrant {
        uint256 recipient;
        bytes32 _nullifierHash;
        assembly {
                recipient := calldataload(add(calldataload(0x04), 0x24))
                _nullifierHash := calldataload(add(calldataload(0x04), 0x64))
        } 
        address payable _recipient = payable(address(uint160(recipient)));

        require(!nullifierHashes[_nullifierHash], "The note has been already spent");
        require(isKnownRoot(_root), "Cannot find your merkle root");
    
        bool proofResult = verifier.verify(proof);
        require(proofResult, "Invalid withdraw proof");

        // Set nullifier hash to true
        nullifierHashes[_nullifierHash] = true;
        deleteAddress(_recipient);

        require(msg.value == 0, "msg.value is supposed to be zero");

        (bool success, ) = _recipient.call{value: amount}("");
        require(success, "payment to _recipient did not go thru");

        emit Withdrawal(_recipient, _nullifierHash);
    }

    function addAddress(bool receiverType, address receiver) external {
        if (receiverType) {
            palestinianAddresses.push(receiver);
        } else {
            ukrainianAddresses.push(receiver);
        }
    }

    function getAddress(bool receiverType) external view returns (address) {
        if (receiverType) {
            return palestinianAddresses[0];
        } else {
            return ukrainianAddresses[0];
        }
    }

    function getAddressCount(bool receiverType) external view returns (uint256) {
        if (receiverType) {
            return palestinianAddresses.length;
        } else {
            return ukrainianAddresses.length;
        }
    }

// this is very bad and gas inefficient
     function deleteAddress(address _address) public {
        bool found = false;

        for (uint i = 0; i < palestinianAddresses.length; i++) {
            if (palestinianAddresses[i] == _address) {
                for (uint j = i; j < palestinianAddresses.length - 1; j++) {
                    palestinianAddresses[j] = palestinianAddresses[j + 1];
                }
                palestinianAddresses.pop();
                found = true;
                break; 
            }
        }
        if (!found) {
            for (uint i = 0; i < ukrainianAddresses.length; i++) {
                if (ukrainianAddresses[i] == _address) {
                    for (uint j = i; j < ukrainianAddresses.length - 1; j++) {
                        ukrainianAddresses[j] = ukrainianAddresses[j + 1];
                    }
                    ukrainianAddresses.pop();
                    break; 
                }
            }
        }
    }
}

