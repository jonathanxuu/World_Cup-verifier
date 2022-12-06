use miden::{Assembler, Program, ProofOptions, StarkProof, verify, VerificationError, Digest};
use super::parse::ZKPRESULT;
use super::super::DigestHelper;
use std::mem;
// Verification Phrase 1
// do single verification work for one zkp_result, return the verification result -- OK/Err
pub fn do_single_zkp_verify(
    program: Program,
    outputs: &[u64],
    starkproof: StarkProof
) -> Result<(), VerificationError> {
    miden::verify(program.hash(),
        &[],
        &outputs,
        starkproof
    )
}

// Verification Phrase 2
// restore the digest_hash, and check if it is stored on-chain
pub fn restore_and_check_digest_hash(
    outputs: Vec<u64>,
    digest_helper: DigestHelper
) -> bool {
    let digest_hash = restore_digest_hash(outputs, digest_helper);
    // =================== TODO =================================
    // need to check whether the digest hash is stored
    return true;
}

fn restore_digest_hash(
    outputs: Vec<u64>,
    digest_helper: DigestHelper
) -> String{
    let roothash_string = compute_roothash(outputs);
    // =========== TODO ==========================
    // need to restore digest hash
    let digest_hash = String::from("digest_hash wait to compute");
    return digest_hash;
}


fn compute_roothash(
    outputs: Vec<u64>,
) -> String {
    assert_eq!(outputs[0], 1, "The User's supported team is not in the top four!!!");
    assert_eq!(!(outputs[1] == 0 && outputs[2] == 0 && outputs[3] == 0 && outputs[4] == 0), true, "The User's authentication path is not valid!!!");
    let mut vec64 = outputs;
    vec64.remove(0);
    vec64.reverse();
    let vec8 = unsafe {
        let ratio = mem::size_of::<u64>() / mem::size_of::<u8>();

        let length = vec64.len() * ratio;
        let capacity = vec64.capacity() * ratio;
        let ptr = vec64.as_mut_ptr() as *mut u8;

        // Don't run the destructor for vec64
        mem::forget(vec64);

        // Construct new Vec
        Vec::from_raw_parts(ptr, length, capacity)
    };
    let roothash_string = hex::encode(&vec8);

    return roothash_string;
}

 
