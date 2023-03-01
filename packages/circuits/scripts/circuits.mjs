import { CircuitConfig } from '@unirep/circuits'
import { EPK_R, OMT_R } from '@unirep/utils'
const {
    FIELD_COUNT,
} = CircuitConfig.default

const STATE_TREE_DEPTH = 20
const ADDRESS_TREE_DEPTH = 20

export const ptauName = 'powersOfTau28_hez_final_22.ptau'

export const circuitContents = {
    signupWithAddress: `pragma circom 2.0.0; include "../circuits/signupWithAddress.circom"; \n\ncomponent main { public [ attester_id, epoch, msghash ] } = SignupWithAddress(${FIELD_COUNT}, ${EPK_R}, 64, 4);`,
    proveAddress: `pragma circom 2.0.0; include "../circuits/proveAddress.circom"; \n\ncomponent main { public [ attester_id, epoch, sig_data ] } = ProveAddress(${STATE_TREE_DEPTH}, ${EPK_R}, ${FIELD_COUNT}, ${ADDRESS_TREE_DEPTH});`,
    signupNonAnon: `pragma circom 2.0.0; include "../circuits/signupNonAnon.circom"; \n\ncomponent main { public [ attester_id, epoch, address, sig_hash ] } = SignupNonAnon(${FIELD_COUNT}, ${EPK_R});`,
}
