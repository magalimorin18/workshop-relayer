## ⛽️ Relayer Service Insight

### POST `/execute`

Executes a transaction on behalf of a user using `executeRelayCall` function of the Key Manager owning the user's Universal Profile.

#### Request body

```json
{
  "address": "0xBB645D97B0c7D101ca0d73131e521fe89B463BFD",
  "transaction": {
    "abi": "0x7f23690c5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000596f357c6aa5a21984a83b7eef4cb0720ac1fcf5a45e9d84c653d97b71bbe89b7a728c386a697066733a2f2f516d624b43744b4d7573376741524470617744687a32506a4e36616f64346b69794e436851726d3451437858454b00000000000000",
    "signature": "0x43c958b1729586749169599d7e776f18afc6223c7da21107161477d291d497973b4fc50a724b1b2ab98f3f8cf1d5cdbbbdf3512e4fbfbdc39732229a15beb14a1b",
    "nonce": 1,
    "validityTimestamps": "0x0000000000000000000000006420f3f000000000000000000000000065ec82d0"
  }
}
```

- `address` - The address of the Universal Profile.
- `transaction` - An object containing the transaction parameters which will be executed with `executeRelayCall`.
  - `abi` - The abi-encoded transaction data (_e.g: a function call on the Universal Profile smart contract_) which will be passed as the payload parameter to the `executeRelayCall` function.
  - `signature` - The signed message. See section below for how to construct the signature.
  - `nonce` - The nonce of the user key signing the transaction. Fetched by calling `getNonce(address address, uint128 channelId)` on the LSP6 KeyManager contract of the Universal Profile.
  - `validityTimestamps` (optional) - Two concatenated `uint128` timestamps which indicate a time duration for which the transaction will be considered valid. If no validityTimestamps parameter is passed the relayer should assume that validityTimestamps is `0` and the transaction will be valid indefinitely until it is executed.

#### Response

The transaction hash of the executeRelayCall transaction.

```json
{
  "transactionHash": "0xBB645D97B0c7D101ca0d73131e521fe89B463BFD"
}
```

#### 🖋️ Specification to construct the executeRelayCall signature

##### Construct the message

```typescript
const message = ethers.utils.solidityPack(
  ["uint256", "uint256", "uint256", "uint256", "uint256", "bytes"],
  [
    25, //LSP25 Version
    "4201", //Chain Id
    { _hex: "0x0c", _isBigNumber: true }, //Nonce of the user signing key
    0, //Validity Timestamps
    0, //Amount of native tokens to transfer (in Wei)
    0x7f23690ccafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004cafecafe00000000000000000000000000000000000000000000000000000000, //Abi payload
  ]
);
```

##### Sign the message

_Important_ : The message must be signed by a key belonging to the user that has permissions on the Universal Profile in order to execute the abi payload. This key doesn't need LYX.

[EIP191 signer](https://www.npmjs.com/package/@lukso/eip191-signer.js) library is used to generate the signature using the function `signDataWithIntendedValidator`.

```typescript
const eip191Signer = new EIP191Signer();

const { signature } = eip191Signer.signDataWithIntendedValidator(
  keyManagerAddress, // Key Manager of the Universal Profile
  message, // Constructed message as shown in the section above
  privateKey // User key with permissions on the Universal Profile
);
```

#### 🌉 Transaction Gate

This implementation of the relayer can only process one transaction at a time. To prevent nonce reuse errors, a transaction gate is implemented which will block incoming transactions if there is already a transaction pending.
