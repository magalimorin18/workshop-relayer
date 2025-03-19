import { ethers } from "ethers";

let acceptNextTransaction = true;
let currentTransactionHash: string;

export async function waitForTransaction(
  transaction: ethers.providers.TransactionResponse
) {
  acceptNextTransaction = false;
  currentTransactionHash = transaction.hash;

  await transaction.wait();

  console.log(" ");
  console.log(`⛏ Mined transaction!`);

  acceptNextTransaction = true;
}

export function transactionGate() {
  if (!acceptNextTransaction) {
    throw new Error(
      `Transaction in progress. Waiting until transaction ${currentTransactionHash} has been validated`
    );
  }
}
