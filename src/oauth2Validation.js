/*
 * Validate LTI 1.3 OAuth2 Client Credentials Request
 * @param req - HTTP request to validate
 * @returns an array, which if empty indicates 0 errors,
 *  otherwise, contains description of each error
 */
function validOauth2Request(req) {
  const { body } = req;
  const errors = [];

  // Check it is a POST request
  if (req.method !== 'POST') {
    errors.push('Method invalid');
  }

  // Check the data exists
  if (Object.entries(body).length === 0 && body.constructor === Object) {
    errors.push('body data missing');
  } else {
    // Check the grant type
    if (!body.grant_type) {
      errors.push('grant type missing');
    } else if (body.grant_type !== 'client_credentials') {
      errors.push('grant type invalid');
    }

    // Check the client_id
    if (!body.client_id) {
      errors.push('client id missing');
    } else if (body.client_id === '') {
      // TODO: Must retrieve Consumer information from DB
      errors.push('client id invalid');
    }

    // Check the client_secret
    if (!body.client_secret) {
      errors.push('client secret missing');
    } else if (body.client_secret === '') {
      // TODO: Must retrieve Consumer information from DB
      errors.push('client secret invalid');
    }
  }

  return errors;
}

module.exports = { validOauth2Request };
