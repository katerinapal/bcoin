//UPD

var crypto = require('crypto');

var backend = exports;

if (!crypto.pbkdf2Sync)
  throw new Error('This modules requires node.js v0.11.0 or above.');

/*
 * Hashing
 */

exports.hash = function hash(alg, data) {
  return crypto.createHash(alg).update(data).digest();
};