const jwt = require('jsonwebtoken');
const { validOauth2Request } = require('./oauth2Validation');

/*
 * Creates a JSON web token in accordance with the LTI 1.3 standard
 * and in conjunction with Oauth 2.0 validation.
 * @param errors - errors array from validation
 * @param res - Result to send
 * @returns result with JWT, if successful, or an object with errors listed
 */
const tokenMaker = () => async (req, res) => {
  const errors = validOauth2Request(req);

  if (errors.length === 0) {
    // no errors
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    const payload = {
      sub: req.body.client_id,
      expires_in: 3600, // 1 hour per IMS spec
      token_type: 'bearer',
      scope: '',
    };
    const jwtPayload = jwt.sign(payload, req.body.client_secret, {
      algorithm: 'RS256',
    });
    return res.status(200).send({ jwt: jwtPayload });
  }
  if (errors.findIndex((e) => e.includes('grant type invalid')) >= 0) {
    return res.status(400).send({
      error: 'unsupported_grant_type',
      errors,
    });
  }
  if (errors.findIndex((e) => e.includes('invalid')) >= 0) {
    return res.status(401).send({
      error: 'invalid_client',
      errors,
    });
  }
  return res.status(400).send({
    error: 'invalid_request',
    errors,
  });
};

module.exports = tokenMaker;
