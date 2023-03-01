// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Unirep } from "@unirep/contracts/Unirep.sol";
import { EIP712Decoder, SemaphoreKey, EIP712DOMAIN_TYPEHASH, SEMAPHOREKEY_TYPEHASH } from './EIP712.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IVerifier {
    /**
     * @return bool Whether the proof is valid given the hardcoded verifying key
     *          above and the public inputs
     */
    function verifyProof(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (bool);
}

contract ZKEth is EIP712Decoder {

    IVerifier immutable signupWithAddressVerifier;
    IVerifier immutable signupNonAnonVerifier;

    Unirep public unirep;

    bytes32 public immutable domainHash;

    constructor(
        Unirep _unirep,
        IVerifier _signupWithAddressVerifier,
        IVerifier _signupNonAnonVerifier
    ) {
        // set unirep address
        unirep = _unirep;

        // sign up as an attester
        unirep.attesterSignUp(2**32);

        signupWithAddressVerifier = _signupWithAddressVerifier;
        signupNonAnonVerifier = _signupNonAnonVerifier;

        domainHash = getEIP712DomainHash("zketh","0",block.chainid,address(this));
    }

    function getEIP712DomainHash(string memory contractName, string memory version, uint256 chainId, address verifyingContract) public pure returns (bytes32) {
        bytes memory encoded = abi.encode(
          EIP712DOMAIN_TYPEHASH,
          keccak256(bytes(contractName)),
          keccak256(bytes(version)),
          chainId,
          verifyingContract
        );
        return keccak256(encoded);
    }

    function getSignupSigHash(SemaphoreKey memory input) public view returns (bytes32) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainHash,
                GET_SEMAPHOREKEY_PACKETHASH(input)
            )
        );
        return digest;
    }

    function signupNonAnon(
        bytes memory signature,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        require(signupNonAnonVerifier.verifyProof(publicSignals, proof), 'proof');

        uint256 identityCommitment = publicSignals[0];

        address expectedAddress = address(uint160(publicSignals[5]));
        {
            bytes32 msgHash = getSignupSigHash(SemaphoreKey({
              whatami: ">zketh signup proof<",
              identity: identityCommitment
            }));
            address signer = recover(msgHash, signature);
            require(signer == expectedAddress, 'addrmismatc');
        }

        // shift right 6 bits to fit in bn128 field element
        uint sigHash = uint(keccak256(signature)) >> 6;
        require(sigHash == publicSignals[6], 'sigmismatc');

        uint256 stateTreeLeaf = publicSignals[1];
        uint256 data0 = publicSignals[2];

        uint256 attesterId = publicSignals[3];
        require(attesterId == uint256(uint160(address(this))), 'attstr');

        uint64 epoch = uint64(publicSignals[4]);

        uint256[] memory init = new uint256[](1);
        init[0] = data0;

        unirep.manualUserSignUp(
            epoch,
            identityCommitment,
            stateTreeLeaf,
            init
        );
    }

    function signup(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        // Verify the proof
        require(signupWithAddressVerifier.verifyProof(publicSignals, proof), 'proof');

        // The expected message hash, in 4 limbs
        require(publicSignals[5] == 12742213206988075232, 'sig0');
        require(publicSignals[6] == 10620010067332803895, 'sig1');
        require(publicSignals[7] == 3731297768199697761, 'sig2');
        require(publicSignals[8] == 11874718941084289869, 'sig3');

        uint256 identityCommitment = publicSignals[0];
        uint256 stateTreeLeaf = publicSignals[1];
        uint256 data0 = publicSignals[2];

        uint256 attesterId = publicSignals[3];
        require(attesterId == uint256(uint160(address(this))), 'attstr');

        uint64 epoch = uint64(publicSignals[4]);

        uint256[] memory init = new uint256[](1);
        init[0] = data0;

        unirep.manualUserSignUp(
            epoch,
            identityCommitment,
            stateTreeLeaf,
            init
        );
    }
}
