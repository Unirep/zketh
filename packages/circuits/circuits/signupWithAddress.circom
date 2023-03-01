pragma circom 2.0.7;

include "./circom-ecdsa/circuits/ecdsa.circom";
include "./circom-ecdsa/circuits/zk-identity/eth.circom";

include "./unirep/packages/circuits/circuits/circomlib/circuits/poseidon.circom";
include "./unirep/packages/circuits/circuits/identity.circom";
include "./unirep/packages/circuits/circuits/leafHasher.circom";

template SignupWithAddress(FIELD_COUNT, EPK_R, n, k) {
    signal output identity_commitment;
    signal output state_tree_leaf;
    signal output data0;

    signal input attester_id;
    signal input epoch;

    signal input identity_nullifier;
    signal input identity_trapdoor;

    // the signature message hash
    signal input r[k];
    signal input s[k];
    signal input msghash[k];
    signal input pubkey[2][k];

    component sig_verify = ECDSAVerifyNoPubkeyCheck(n, k);

    for (var x = 0; x < k; x++) {
      sig_verify.r[x] <== r[x];
      sig_verify.s[x] <== s[x];
      sig_verify.msghash[x] <== msghash[x];
      sig_verify.pubkey[0][x] <== pubkey[0][x];
      sig_verify.pubkey[1][x] <== pubkey[1][x];
    }

    sig_verify.result === 1;

    component pubkey_flat = FlattenPubkey(n, k);
    for (var x = 0; x < k; x++) {
      pubkey_flat.chunkedPubkey[0][x] <== pubkey[0][x];
      pubkey_flat.chunkedPubkey[1][x] <== pubkey[1][x];
    }

    component pubkey_address = PubkeyToAddress();
    for (var x = 0; x < 512; x++) {
      pubkey_address.pubkeyBits[x] <== pubkey_flat.pubkeyBits[x];
    }

    component commitment_calc = IdentityCommitment();
    commitment_calc.nullifier <== identity_nullifier;
    commitment_calc.trapdoor <== identity_trapdoor;
    identity_commitment <== commitment_calc.out;

    component address_hasher = Poseidon(2);
    address_hasher.inputs[0] <== commitment_calc.secret;
    address_hasher.inputs[1] <== pubkey_address.address;
    data0 <== address_hasher.out;

    log(pubkey_address.address);
    log(commitment_calc.secret);

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
