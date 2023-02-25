pragma circom 2.0.7;

include "./efficient-zk-ecdsa/circuits/ecdsa_verify_pubkey_to_addr.circom";

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
    signal input m[k];
    signal input s[k];
    signal input TPreComputes[32][256][2][4]; // T = r^-1 * R
    signal input _r[k]; // -r^-1

    component sig_verify = ECDSAVerifyPubKeyToAddr(n, k);
    for (var x = 0; x < k; x++) {
        sig_verify.s[x] <== s[x];
        sig_verify.m[x] <== m[x];
        sig_verify._r[x] <== _r[x];
    }
    for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 256; y++) {
            for (var z = 0; z < 2; z++) {
              sig_verify.TPreComputes[x][y][z][0] <== TPreComputes[x][y][z][0];
              sig_verify.TPreComputes[x][y][z][1] <== TPreComputes[x][y][z][1];
              sig_verify.TPreComputes[x][y][z][2] <== TPreComputes[x][y][z][2];
              sig_verify.TPreComputes[x][y][z][3] <== TPreComputes[x][y][z][3];
            }
        }
    }

    component commitment_calc = IdentityCommitment();
    commitment_calc.nullifier <== identity_nullifier;
    commitment_calc.trapdoor <== identity_trapdoor;
    identity_commitment <== commitment_calc.out;

    component address_hasher = Poseidon(2);
    address_hasher.inputs[0] <== commitment_calc.secret;
    address_hasher.inputs[1] <== sig_verify.addr;
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
