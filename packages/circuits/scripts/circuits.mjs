import { CircuitConfig } from '@unirep/circuits'
import { EPK_R, OMT_R } from '@unirep/utils'
const {
    EPOCH_TREE_DEPTH,
    EPOCH_TREE_ARITY,
    STATE_TREE_DEPTH,
    NUM_EPOCH_KEY_NONCE_PER_EPOCH,
    FIELD_COUNT,
    SUM_FIELD_COUNT,
    HISTORY_TREE_DEPTH,
} = CircuitConfig.default

export const ptauName = 'powersOfTau28_hez_final_20.ptau'

export const circuitContents = {
    signupWithAddress: `pragma circom 2.0.0; include "../circuits/signupWithAddress.circom"; \n\ncomponent main { public [ attester_id, epoch, m ] } = SignupWithAddress(${FIELD_COUNT}, ${EPK_R}, 64, 4);`,
    proveAddress: `pragma circom 2.0.0; include "../circuits/proveAddress.circom"; \n\ncomponent main { public [ attester_id, epoch, sig_data ] } = ProveAddress(${STATE_TREE_DEPTH}, ${EPK_R}, ${FIELD_COUNT}, ${10});`,
}
