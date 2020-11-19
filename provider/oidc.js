require('dotenv').config();

const url = require('url');
const { Database } = require('./mongoDB/Database');
const schemas = require('./schemas');

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
 * @param signed - boolean whether string should be signed with Tool's private key
 * @returns unique string
 */
function createUniqueString(length) {
  let uniqueString = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    uniqueString += possible.charAt(
      Math.floor(Math.random() * possible.length),
    );
  }
  // TODO: if signed === true, sign the string with our private key
  return uniqueString;
}

/*
 * Validate OIDC login and construct response for valid logins.
 *  Looks up Issuer in database to ensure they are registered
 * with the Tool.
 * @param req - req sent from OIDC to Tool's OIDC login endpoint
 * @returns if valid request, returns properly formated response object
 * @return if invalid request, returns array of errors with the request
 */

async function createOidcResponse(req, res) {
  const errors = [];

  // Save the OIDC Login Request to reference later during current session
  req.session.loginRequest = req.body;

  const dbResult = await Database.Get('platforms', schemas.PlatformSchema, {
    consumerUrl: req.session.loginRequest.iss,
  });

  if (!dbResult.length || !dbResult[0]) {
    return res.send(['Issuer invalid: not registered']);
  }

  const platform = dbResult[0];

  // Save the Platform information from the database to reference later during current session
  req.session.platform = platform;

  errors.push(...isValidOidcLogin(req));

  if (!errors.length && req.session.platform) {
    const response = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: req.session.platform.consumerToolClientID,
      redirect_uri: req.session.platform.consumerRedirectURI,
      login_hint: req.body.login_hint,
      state: createUniqueString(30, true),
      response_mode: 'form_post',
      nonce: createUniqueString(25, false),
      prompt: 'none',
      lti_message_hint: req.body.lti_message_hint && req.body.lti_message_hint,
    };
    // Save the OIDC Login Response to reference later during current session
    req.session.loginResponse = response;

    return res.redirect(
      url.format({
        pathname: platform.consumerAuthorizationURL,
        query: req.session.loginResponse,
      }),
    );
  }

  // errors were found, so return the errors
  return res.send(`Error with OIDC Login: ${errors}`);
}

module.exports = { createOidcResponse, createUniqueString };
