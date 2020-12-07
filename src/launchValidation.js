const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const { promisify } = require('util');
const Ajv = require('ajv').default;
const { veifyUniqueString } = require('./oidc');
const schema = require('./ltiSchema');

function validLaunchRequest(body) {
  const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true,
    formats: {
      int32: true,
      uri: true,
    },
  }); // options can be passed, e.g. {allErrors: true}
  const validate = ajv.compile(schema);
  const valid = validate(body);
  if (!valid) {
    return validate.errors;
  }
  return [];
}

/*
 * Validate that the state sent with an OIDC launch matches
 *  the state that was sent in the OIDC response
 * @param req - HTTP OIDC request to launch Tool.
 * @returns - boolean on whether it is valid or not
 */
function isValidOidcLogin(req) {
  return veifyUniqueString(
    req.body.state,
    req.session.ltiLoginResponse.unsignedState,
  );
}

/*
 * Validates that the required keys are present and filled
 *  per LTI 1.3 standards in conjunction with the OAuth_validation
 * before launching Tool.
 * @param req Request
 * @param res Response
 * @param path - if any path needs to be appended to the URI to launch the Tool to the correct route
 * @returns object with errors if invalid launch, otherwise, redirects to Tool
 */
const launchTool = () => async (req, res, path) => {
  let errors = [];

  // If Platform rejected login response, show error
  if (req.body.error) {
    errors.push(`Login Response was rejected: ${req.body.error}`);
  } else if (!isValidOidcLogin(req)) {
    // Validate OIDC Launch Request
    errors.push('Invalid OIDC Launch Request: state mismatch');
  } else {
    // If valid, save OIDC Launch Request for later reference during current session
    req.session.ltiPayload = req.body;

    // Decode the JWT into header, payload, and signature
    const jwtString = req.body.id_token;
    const basicDecoded = jwt.decode(jwtString, { complete: true });

    try {
      // Get the key to verify the JWT
      const keys = await axios.get(
        `${req.session.ltiPlatform.consumerAuthorizationConfigKey}?kid=${basicDecoded.header.kid}`,
      );

      const decoded = await promisify(jwt.verify)(
        jwtString,
        jwkToPem(keys.data.keys[0]),
        { algorithm: 'RS256' },
      );
      // Save decoded OIDC Launch Request to reference later during the current session
      req.session.ltiDecodedToken = decoded;
      // Validate Launch Request details
      errors = validLaunchRequest(decoded);

      if (errors.length === 0) {
        // No errors, so redirect to the Tool
        return res.redirect(
          decoded['https://purl.imsglobal.org/spec/lti/claim/target_link_uri']
            + path,
        );
      }
    } catch (e) {
      errors.push(`Could not verify token: ${e}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).send({
      error: 'invalid_request',
      errors,
    });
  }
  return null;
};

module.exports = { launchTool };
