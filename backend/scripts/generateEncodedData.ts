import { ethers } from "hardhat";

async function main() {
  const Multisig = await ethers.getContractFactory("MultisigWallet");
  const encodedData = await Multisig.interface.encodeFunctionData(
    "initialize",
    [["0xf14fD5FFEbBa9493Dd7Fb2CC33D97B1589C29A88"], 1]
  );

  console.log(`EncodedData: ${encodedData}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run ./scripts/generateEncodedData.ts  0x60b5bb3f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f14fd5ffebba9493dd7fb2cc33d97b1589c29a88