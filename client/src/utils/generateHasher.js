const path = require('path');
const { writeFileSync } = require('fs');
// @ts-ignore -- no types
const { mimc7Contract: mimcContract } = require('circomlibjs');

const outputPath = path.join(__dirname, '../..', 'artifacts', 'contracts', 'Hasher.json');

function main() {
  const contract = {
    contractName: 'Hasher',
    abi: mimcContract.abi,
    bytecode: mimcContract.createCode('mimc', 91),
  };

  writeFileSync(outputPath, JSON.stringify(contract));
}

main();
