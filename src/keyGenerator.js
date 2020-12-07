// TODO: revist this to see why its required and how to use it <24-11-20, Vora, Deep> //
const { promisify } = require('util');
const crypto = require('crypto');

const generateKeyPair = promisify(crypto.generateKeyPair);

/*
 * Creates a unique pass phrase
 * @returns phrase
 */
function passPhrase() {
  return crypto.randomBytes(128).toString('hex');
}

/*
 * Generate RSA public and private key pair to validate between Tool and the Platform
 * @returns key pair
 *  NOTE: The signature and the verification needs to be
 *   updated with a proper consumerID or some other unique identifer
 */
async function keyGenerator() {
  const kid = passPhrase();

  const { publicKey, privateKey } = await generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: kid,
    },
  });

  return { publicKey, privateKey, keyID: kid };
}

module.exports = { keyGenerator, passPhrase };
