use serde::{Deserialize, Serialize};
use miden::{Assembler, ProgramInputs, ProofOptions, StarkProof};
use std::fs;

#[derive(Deserialize, Serialize, Debug)]
pub struct ZKPRESULT {
    pub outputs: Vec<u64>,
    pub starkproof: StarkProof
}

// helper function 
// - modify the transport phrase help tranform the json into struct ZKPRESULT
pub fn parse_zkp_result() -> Result<ZKPRESULT, std::io::Error>{
    let data = fs::read_to_string("src/zkp_result.json").expect("LogRocket: error reading file");
    let zkp_result:ZKPRESULT = serde_json::from_str(&data).unwrap();
    return Ok(zkp_result);
}