pragma circom 2.0.0;

include "./unirep/packages/circuits/circuits/circomlib/circuits/poseidon.circom";
include "./unirep/packages/circuits/circuits/identity.circom";
include "./unirep/packages/circuits/circuits/leafHasher.circom";

template SignupNonAnon(FIELD_COUNT, EPK_R) {
    signal output identity_commitment;
    signal output state_tree_leaf;
    signal output data0;

    signal input attester_id;
    signal input epoch;

    signal input identity_nullifier;
    signal input identity_trapdoor;

    signal input address;
    signal input sig_hash;

    component commitment_calc = IdentityCommitment();
    commitment_calc.nullifier <== identity_nullifier;
    commitment_calc.trapdoor <== identity_trapdoor;
    identity_commitment <== commitment_calc.out;

    component address_hasher = Poseidon(2);
    address_hasher.inputs[0] <== commitment_calc.secret;
    address_hasher.inputs[1] <== address;
    data0 <== address_hasher.out;

    component leaf_hasher = StateTreeLeaf(FIELD_COUNT, EPK_R);
    leaf_hasher.identity_secret <== commitment_calc.secret;
    leaf_hasher.attester_id <== attester_id;
    leaf_hasher.epoch <== epoch;

    leaf_hasher.data[0] <== data0;
    for (var x = 1; x < FIELD_COUNT; x++) {
      leaf_hasher.data[x] <== 0;
    }

    state_tree_leaf <== leaf_hasher.out;
}
