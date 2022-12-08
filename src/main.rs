mod helpers;
use helpers::parse::parse_zkp_result;
use helpers::world_cup_verify::world_cup_verify;

fn main() {
    let user_did = String::from("did:zk:0x83B3c7CF3388c96e5D9a8074200e2FBa850cDE7d");
    // =========================== Execution Phrase ===============================
    // We suppose the User has generated his/her ZKP via zkID Wallet,

    // ========================== User Send ZKP To Us ===========================
    // User send its ZKP to us, and we saved it in the `./zkp_result.json`
    // now, we need to parse it into Struct ZKPRESULT
    assert_eq!(
        parse_zkp_result().is_ok(),
        true,
        "The User's uploaded zkp is not valid, cannot parse"
    );
    let parse_result = parse_zkp_result().unwrap();
    let outputs = parse_result.outputs;
    let starkproof = parse_result.starkproof;

    // ========================= Verification Phrase ============================
    // verification status: the zkp verification result(4 situations)
    // digesthash: the digesthash calculated 
    let (verification_status, digesthash) = world_cup_verify(&outputs, starkproof, user_did);
    println!(
        "verification_status is {:?} digesthash is {:?}",
        verification_status, digesthash
    );
}
