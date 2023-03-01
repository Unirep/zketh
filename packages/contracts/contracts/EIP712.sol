pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

struct SemaphoreKey {
  string whatami;
  uint256 identity;
}

// bytes32 constant SEMAPHOREKEY_TYPEHASH = keccak256("SemaphoreKey(string whatami,uint256 identity)");
bytes32 constant SEMAPHOREKEY_TYPEHASH = keccak256("SemaphoreKey(uint256 identity)");

struct EIP712Domain {
  string name;
  string version;
  uint256 chainId;
  address verifyingContract;
}

bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");


contract EIP712Decoder {

  /**
  * @dev Recover signer address from a message by using their signature
  * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
  * @param sig bytes signature, the signature is generated using web3.eth.sign()
  */
  function recover(bytes32 hash, bytes memory sig) internal pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    //Check the signature length
    if (sig.length != 65) {
      return (address(0));
    }

    // Divide the signature in r, s and v variables
    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
// Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }

    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      return ecrecover(hash, v, r, s);
    }
  }

  function GET_SEMAPHOREKEY_PACKETHASH (SemaphoreKey memory _input) public pure returns (bytes32) {

    bytes memory encoded = abi.encode(
      SEMAPHOREKEY_TYPEHASH,
      // _input.whatami
      _input.identity
    );

    return keccak256(encoded);
  }

  function GET_EIP712DOMAIN_PACKETHASH (EIP712Domain memory _input) public pure returns (bytes32) {

    bytes memory encoded = abi.encode(
      EIP712DOMAIN_TYPEHASH,
      _input.name,
      _input.version,
      _input.chainId,
      _input.verifyingContract
    );

    return keccak256(encoded);
  }

}
