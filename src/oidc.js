require('dotenv').config();

const url = require('url');
const crypto = require('crypto');

/*
 * Validates OIDC login request. Checkes required parameters are present.
 * @param req - OIDC login request sent from LMS to Tool
 * @returns array of errors, if empty then request is valid
 */
function isValidOidcLogin(req) {
  const errors = [];
  if (!req.body.iss) {
    errors.push('Issuer missing');
  }
  if (!req.body.login_hint) {
    errors.push('Login hint missing');
  }
  if (!req.body.target_link_uri) {
    errors.push('Target Link URI missing');
  }
  return errors;
}

/*
 * Create a long, unique string consisting of upper and lower case letters and numbers.
 * @param length - desired length of string
 * @param privateKey - private key to sign the unique string with, if provided
 * @returns unique string
 */
function createUniqueString(length, key, passphrase) {
  const random = crypto.randomBytes(length).toString('hex');
  if (key && !passphrase) {
    const signedRandom = crypto
      .createHash('SHA256')
      .update(random)
      .digest('hex');
    return { signedRandom, random };
  }

  if (key && passphrase) {
    const sign = crypto.createSign('SHA256');
    sign.write(random);
    sign.end();
    const signedRandom = sign.sign(
      crypto.createPrivateKey({
        key,
        passphrase,
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
      }),
      'hex',
    );
    return { signedRandom, random };
  }

  return { random };
}

/*
 * Validate that the signed string is valid
 * @param signedString - signed string that needs to be verified
 * @param unsignedString - string that was signed
 * @returns - boolean on whether it is valid or not
 */
function veifyUniqueString(signedString, unsignedString, publicKey) {
  if (publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.write(unsignedString);
    verify.end();
    return verify.verify(publicKey, signedString, 'hex');
  }

  const hash = crypto.createHash('SHA256').update(unsignedString).digest('hex');
  return signedString === hash;
}

/*
 * Validate OIDC login and construct response for valid logins.
 *  Looks up Issuer in database to ensure they are registered
 * with the Tool.
 * @param req - req sent from OIDC to Tool's OIDC login endpoint
 * @returns if valid request, returns properly formated response object
 * @return if invalid request, returns array of errors with the request
 */
const createOidcResponse = (opt) => async (req, res) => {
  const errors = [];

  // Save the OIDC Login Request to reference later during current session
  req.session.ltiLoginRequest = req.body;

  const platform = await opt.store.getPlatform(req.session.ltiLoginRequest.iss);

  if (!platform) {
    return res.send(['Issuer invalid: not registered']);
  }

  // Save the Platform information from the database to reference later during current session
  req.session.ltiPlatform = platform;

  errors.push(...isValidOidcLogin(req));

  if (!errors.length && req.session.ltiPlatform) {
    const { signedRandom, random } = createUniqueString(
      30,
      req.session.ltiPlatform.kid.privateKey,
    );
    const { random: nonce } = createUniqueString(30);

    const response = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: req.session.ltiPlatform.consumerToolClientID,
      redirect_uri: req.session.ltiPlatform.consumerRedirectURI,
      login_hint: req.body.login_hint,
      state: signedRandom,
      response_mode: 'form_post',
      nonce,
      prompt: 'none',
      lti_message_hint: req.body.lti_message_hint,
    };

    // Save the OIDC Login Response to reference later during current session
    req.session.ltiLoginResponse = { ...response, unsignedState: random };

    return res.redirect(
      url.format({
        pathname: platform.consumerAuthorizationURL,
        query: response,
      }),
    );
  }

  // errors were found, so return the errors
  return res.send(`Error with OIDC Login: ${errors}`);
};

module.exports = { createOidcResponse, createUniqueString, veifyUniqueString };
