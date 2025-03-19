import { BigNumber, BytesLike } from "ethers";

export interface TransactionParameters {
  abi: string;
  signature: `0x{string}`;
  nonce: BigNumber;
  validityTimestamps: string | number;
}

export interface ExecutePayload {
  address: string;
  transaction: TransactionParameters;
}

export interface SigningRequest {
  transactionData: string;
  to: string;
  gasLimit: BigNumber;
}

export interface SigningResponse {
  signerSignature: string;
  signerAddress: string;
  nonce: number;
}

export interface ExecuteRequest {
  universalProfileAddress: string;
  userPrivateKey: `0x${string}`;
  abi?: string;
}

export interface Controllers {
  address: string;
  permissions: BytesLike;
}
