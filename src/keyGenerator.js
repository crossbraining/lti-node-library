const { promisify } = require('util');
const crypto = require('crypto');

const generateKeyPair = promisify(crypto.generateKeyPair);

/*
 * Creates a unique pass phrase
 * @returns phrase
 */
function passPhrase() {
  let phrase = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 255; i += 1) {
    phrase += characters.charAt(Math.random() * characters.length);
  }

  return phrase.toString();
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

  // is this even required?
  // const sign = crypto.createSign('RSA-SHA256');
  // sign.update('ConsumerClientID');
  // const signature = sign.sign(privateKey, 'base64');
  // console.info('signature: %s', signature);

  // const verify = crypto.createVerify('RSA-SHA256');
  // verify.update('ConsumerClientID');
  // const verified = verify.verify(publicKey, 'base64');
  // console.info('is signature ok? %s', verified);

  return { publicKey, privateKey, keyID: kid };
}

module.exports = { keyGenerator, passPhrase };
