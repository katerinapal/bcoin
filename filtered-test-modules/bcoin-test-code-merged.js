'use strict';

var assert = require('assert');
var crypto = require('../lib/crypto/crypto');
var aes = require('../lib/crypto/aes');
var nativeCrypto = require('crypto');

describe('AES', function() {
  function pbkdf2key(passphrase, iterations, dkLen, ivLen, alg) {
    var key = crypto.pbkdf2(passphrase, '', iterations, dkLen + ivLen, 'sha512');
    return {
      key: key.slice(0, dkLen),
      iv: key.slice(dkLen, dkLen + ivLen)
    };
  }

  function nencrypt(data, passphrase) {
    var key, cipher;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'utf8');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);
    cipher = nativeCrypto.createCipheriv('aes-256-cbc', key.key, key.iv);

    return Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
  }

  function ndecrypt(data, passphrase) {
    var key, decipher;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'hex');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);
    decipher = nativeCrypto.createDecipheriv('aes-256-cbc', key.key, key.iv);

    return Buffer.concat([
      decipher.update(data),
      decipher.final()
    ]);
  }

  function bencrypt(data, passphrase) {
    var key;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'utf8');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);
    return crypto.encipher(data, key.key, key.iv);
  }

  function bdecrypt(data, passphrase) {
    var key;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'hex');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);
    return crypto.decipher(data, key.key, key.iv);
  }

  function encrypt(data, passphrase) {
    var key;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'utf8');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);

    return aes.cbc.encrypt(data, key.key, key.iv);
  }

  function decrypt(data, passphrase) {
    var key;

    assert(nativeCrypto, 'No crypto module available.');
    assert(passphrase, 'No passphrase.');

    if (typeof data === 'string')
      data = new Buffer(data, 'hex');

    if (typeof passphrase === 'string')
      passphrase = new Buffer(passphrase, 'utf8');

    key = pbkdf2key(passphrase, 2048, 32, 16);

    return aes.cbc.decrypt(data, key.key, key.iv);
  }

  it('should encrypt and decrypt a hash with 2 blocks', function() {

    //UPD
    let invArg0 = new Buffer([]);
    var hash = crypto.sha256(invArg0);
    var enchash = encrypt(hash, 'foo');
    var dechash = decrypt(enchash, 'foo');

    let invArg1 = new Buffer([]);
    var hash2 = crypto.sha256(invArg1);
    var enchash2 = nencrypt(hash2, 'foo');
    var dechash2 = ndecrypt(enchash2, 'foo');

    let invArg2 = new Buffer([]);
    var hash3 = crypto.sha256(invArg2);
    var enchash3 = bencrypt(hash3, 'foo');
    var dechash3 = bdecrypt(enchash3, 'foo');

    assert.deepEqual(hash, hash2);
    assert.deepEqual(enchash, enchash2);
    assert.deepEqual(dechash, dechash2);
    assert.deepEqual(dechash, dechash3);
  });

  it('should encrypt and decrypt a hash with uneven blocks', function() {

    let invArg00 = new Buffer([]);
    let invArg0 = crypto.sha256(invArg00);
    var hash = Buffer.concat([invArg0, new Buffer([1,2,3])]);
    var enchash = encrypt(hash, 'foo');
    var dechash = decrypt(enchash, 'foo');

    let invArg10 = new Buffer([]);
    let invArg1 = crypto.sha256(invArg10);
    var hash2 = Buffer.concat([invArg1, new Buffer([1,2,3])]);
    var enchash2 = nencrypt(hash2, 'foo');
    var dechash2 = ndecrypt(enchash2, 'foo');

    assert.deepEqual(hash, hash2);
    assert.deepEqual(enchash, enchash2);
    assert.deepEqual(dechash, dechash2);
  });
});


