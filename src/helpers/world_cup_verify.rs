use miden::{Assembler, Program, ProofOptions, StarkProof, verify, VerificationError};
use super::parse::ZKPRESULT;
use std::mem;
use sha3::{Digest, Keccak256};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct DigestHelper {
    pub user_did: String,
    pub ctype: String 
}

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
    // the digest_hash is started with '0x', i.g.: 0x54f97a3e0c61ef2b8cd8698444847b1f31eda812383128dc53f7799878d40e32
    let digest_hash = restore_digest_hash(outputs, digest_helper);

    // check whether the digest_hash exist 
    let digest_exist_status = check_digest_hash(digest_hash);
    // need to check whether the digest hash is stored
    return digest_exist_status;
}



fn check_digest_hash(
    digest_hash: String
) -> bool{
    // ================== TODO ===================================
    // Need to check whether the digest_hash exist from the server
    let check_status = true;
    return check_status;
}


// used to restore digest hash via roothash, did, ctype
fn restore_digest_hash(
    outputs: Vec<u64>,
    digest_helper: DigestHelper
) -> String{
    let roothash = compute_roothash(outputs);
    let mut digest_hash = roothash;
    digest_hash.append(&mut digest_helper.user_did.as_bytes().to_vec());
    digest_hash.push(0);
    let mut ctype_hash = hex::decode(&digest_helper.ctype[2..]).expect("The ctype cannot be parsed! not start with '0x'");
    digest_hash.append(&mut ctype_hash);

    let mut hasher = Keccak256::default();
    hasher.update(digest_hash);
    let result = hasher.finalize();

    let digest_hash_hexstring = "0x".to_owned() + &hex::encode(result);
    return digest_hash_hexstring;
}



fn compute_roothash(
    outputs: Vec<u64>,
) -> Vec<u8> {
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
    return vec8;
}

 
