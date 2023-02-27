// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import { Unirep } from "@unirep/contracts/Unirep.sol";

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

contract ZKEth {

    IVerifier immutable signupWithAddressVerifier;
    Unirep public unirep;

    constructor(
        Unirep _unirep,
        IVerifier _signupWithAddressVerifier
    ) {
        // set unirep address
        unirep = _unirep;

        // sign up as an attester
        unirep.attesterSignUp(2**32);

        signupWithAddressVerifier = _signupWithAddressVerifier;
    }

    function signup(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        // Verify the proof
        require(signupWithAddressVerifier.verifyProof(publicSignals, proof), 'proof');

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
