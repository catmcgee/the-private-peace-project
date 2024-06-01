import circuit from '../../circuits/mimc_tree/target/mimc_tree.json';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

// Define the shape of your proof inputs, if you have a specific structure
interface ProofInputs {
    // Define properties as per your actual proof inputs
    [key: string]: any;
}

// Define the return type if you know it, otherwise use `any`
type Proof = any;

export async function generateProof(proofInputs: ProofInputs): Promise<Proof> {
    try {
        const backend = new BarretenbergBackend(circuit as any);
        const noir = new Noir(circuit as any, backend as any);

        const proof = await noir.generateProof(proofInputs);

        return proof;
    } catch (error) {
        console.error("Failed to generate proof:", error);
        throw error;
    }
}
