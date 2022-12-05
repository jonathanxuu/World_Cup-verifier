const miden = require("miden");
var data = require('./credential.json');
import {convertCreToBN} from "./parse"

// the program is the world_cup_program, the four teams are :[ 'Brazil', 'Spain', 'England', 'France' ]
import { program } from "./program";
let index = [2]
// This adv_tape is obtained from `parse.ts`
const adv_tape_string = convertCreToBN(data, index);

let adv_tape = miden.output_inputs_string("", adv_tape_string, "");

// Execution function is performed in the user-end (zkID Wallet)
// ZKP_Result contains two things : 1) outputs 2) starkproof
let ZKP_Result = miden.execute(program, adv_tape, 5)


// ========================= Starting Verification ========================================
let {outputs, starkproof} = parse_zkp_result(ZKP_Result);

// the program_hash is fixed (once the four team is determined)
let program_hash = miden.generate_program_hash(program)

let verify_result = miden.program_verify(program_hash, [], outputs, starkproof)
console.log("verify_result:",verify_result)





// helper function -- help parse ZKP Result to outputs & starkproof
function parse_zkp_result(ZKP_Result: string){

    let first_outputs_index = ZKP_Result.indexOf("[");
    let second_outputs_index = ZKP_Result.indexOf("]");
    let outputs_string = ZKP_Result.substring(first_outputs_index + 1, second_outputs_index);
    let outputs = string2bigint(outputs_string.split(","));

    let starkproof_init = ZKP_Result.indexOf("starkproof");
    let starkproof_end = ZKP_Result.length;
    let starkproof = ZKP_Result.substring(starkproof_init + 12, starkproof_end - 1);

    return {outputs, starkproof}

}

// helper function -- help convert string[] to bigint[]
function string2bigint(outputs: string[]){
    let result = new BigUint64Array(outputs.length);
    for ( let i = 0; i < outputs.length; i++ ){
        result[i] = BigInt(outputs[i])
    }
    return result
}