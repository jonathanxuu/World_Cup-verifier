import { u64a_rescue } from 'rescue';

var data = require('./credential.json');
const rescue = require('rescue');
const BN = require('bn.js');
const rlp = require('rlp');
var MerkleTools = require('../src/merkle-tools/merkletools.js');
var types_handler = require('../src/leaf_handler/src/types_handler');
const { getCtypeSchema } = require('./ctypeSchema');
const ctype = getCtypeSchema().schema.properties;

// Indexes represent which leaf need to be parsed, and calculate in the VM
// Here, [1,2,3,4,5] means 5 leaves need to be parsed.
const indexes = [2];
let result = convertCreToBN(data, indexes);
// console.log('The parsing result is :', result);

export function convertCreToBN(data: any, leaves: any) {

  // ContentData - RLP code, compute nonce
  let {nonces, contentData} = compute_rlp_code(data); 
  // handle the auth path first, we need to generate the merkle tree via saltedhashes.
  let saltedhash: any[] = compute_saltedhash(contentData, nonces);

  var treeOptions = {
    // optional, defaults to 'SHA256', we should set it to RESCUE
    hashType: 'RESCUE'
  };
  var merkleTools = new MerkleTools(treeOptions);
  merkleTools.addLeaves(saltedhash);
  merkleTools.makeTree();

  let final_parse_result = '';
  let roothash = rootAddZeros_64(merkleTools.getMerkleRoot().toString('hex'));
  var roothash_u64vec = rescue.u8a_to_u64a(new BN(roothash, 'hex').toArray());
  final_parse_result = final_parse_result.concat(roothash_u64vec);
  final_parse_result = concat_auth_path(leaves, final_parse_result, contentData, nonces, merkleTools);

  return final_parse_result;
}




// helper function -- help compute authentication path and concat it to the final_parse_result.
function concat_auth_path(leaves: any[], final_parse_result: any, contentData: any[], nonces: any[], merkleTools: any){
  let i = 0;
  for (i; i < leaves.length; i++) {
    let k = leaves[i];
    let uuid = [];

    final_parse_result = final_parse_result.concat(',', contentData[k].toString());
    let uuid_single = types_handler.U8a_to_BU64a_buffer(
      new BN(nonces[k].substr(2), 'hex').toArray()
    );
    uuid.push(uuid_single.toString());

    final_parse_result = final_parse_result.concat(',', uuid.toString());
    // and the corresponding authpath
    let auth_path = merkleTools.getProof(leaves[i]);

    for (const key in auth_path) {
      if (Object.hasOwnProperty.call(auth_path, key)) {
        const element = auth_path[key];
        let per_auth_node = element.right ? element.right : element.left;
        let per_auth_node_u64vec = rescue.u8a_to_u64a(new BN(per_auth_node, 'hex').toArray());
        final_parse_result = final_parse_result.concat(',', per_auth_node_u64vec.toString());
      }
    }
  }
  return final_parse_result;
}

// helper function -- help compute rlp code padding result
function compute_rlp_code(data: any){
  const contents = data.credentialSubject;
  const nonces_map = data.credentialSubjectNonceMap;
  let nonces: string[] = [];
  for (const key in nonces_map) {
    if (Object.prototype.hasOwnProperty.call(nonces_map, key)) {
      const element = nonces_map[key];
      nonces.push(element)      
    }
  }
  let contents_data: any = [];
  for (const key in contents) {
    if (Object.prototype.hasOwnProperty.call(contents, key)) {
      const element = contents[key];
      contents_data.push(element);
    }
  }

  let new_contentData = [];
  for (const key in ctype) {
    if (Object.hasOwnProperty.call(ctype, key)) {
      const element_type = ctype[key].type;
      const element = contents_data.shift();
      switch (element_type) {
        // for the world cup event there's only string type
        case 'string':
          new_contentData.push(Array.from(rlp.encode(element)));
          break;
        default:
          throw Error('Datatype invalid encoding....');
      }
    }
  }

  let contentData = new_contentData;
  var i = 0;
  for (i; i < contentData.length; i++) {
    if (contentData[i].length < 8) {
      contentData[i].push(1);
      while (contentData[i].length < 8) {
        contentData[i].push(0);
      }
    } else if (contentData[i].length % 4 == 3) {
      contentData[i].push(1);
    } else if (contentData[i].length % 4 == 0) {
      continue;
    } else {
      contentData[i].push(1);
      while (contentData[i].length % 4 != 0) {
        contentData[i].push(0);
      }
    }
  }
  return {nonces, contentData};
}

// helper function -- help compute saltedhash for constructing merkletree
function compute_saltedhash(new_contentData: any[], nonces: any[]){
  let saltedhash: any[] = [];
  let i = 0;
  new_contentData.forEach((v: any, i: any) => {
    let content_hash = u64a_rescue(types_handler.U8a_to_BU64a_convert(v));
    let uuid = types_handler.U8a_to_BU64a_buffer(new BN(nonces[i].substr(2), 'hex').toArray());
    let saltedhash_each = u64a_rescue(types_handler.concat_BU64a(content_hash, uuid));
    i = i + 1;
    saltedhash.push(types_handler.U64a_to_HexString(saltedhash_each));
  });
  return saltedhash
}

// the roothash should be u64, if not, we need to add '0's at the beginning
function rootAddZeros_64(root: any): String {
  if (root.length < 64) {
    return rootAddZeros_64((root = '0' + root));
  } else {
    return root;
  }
}
