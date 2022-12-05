/* global describe, it */

var assert = require('assert')
var crypto = require('crypto')
var MerkleTools = require('../merkletools.js')

var bLeft = Buffer.from('a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb', 'hex')
var bRight = Buffer.from('cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c', 'hex')

describe('Test basic functions', function () {
  describe('make tree with addLeaves hex', function () {
    var merkleTools = new MerkleTools()
    merkleTools.addLeaves([
      'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
      'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c',
      
    ])
    merkleTools.makeTree()
    
  let rootValue = rootAddZeros_64(merkleTools.getMerkleRoot().toString("hex"));

  it('rescue roothash with hex leaves right', function () {
    assert.equal(rootValue, "f1b311a9b219d88acb57cdb79c557635056a7d513874f30ce76e2844048a8282")
  })

})

  describe('make tree with addLeaves buffers', function () {
    var merkleTools = new MerkleTools()
    merkleTools.addLeaves([
      bLeft, bRight
    ])
    merkleTools.makeTree()

    const rootValue = rootAddZeros_64(merkleTools.getMerkleRoot().toString("hex"));
    it('rescue roothash with hex buffers right', function () {
      assert.equal(rootValue, "f1b311a9b219d88acb57cdb79c557635056a7d513874f30ce76e2844048a8282")
    })
    
  })

  // the roothash should be u64, if not, we need to add '0's at the beginning
  function rootAddZeros_64(root){
    if (root.length < 64) {
      return rootAddZeros_u64((root = "0" + root));
    } else {
      return root;
    }};

})
