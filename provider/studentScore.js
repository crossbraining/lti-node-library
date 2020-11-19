const axios = require('axios');
const { createHash } = require('crypto');
const { fromBase64, encode } = require('base64url');
const { passPhrase } = require('./keyGenerator');

/*
 * Create BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))
 * @param code_verifier - random string to endcode
 * @returns encoded challenge
 */
function generateChallenge(codeVerifier) {
  const hash = createHash('sha256').update(codeVerifier).digest('base64');
  return fromBase64(hash);
}

/*
 * Creates appropriate payload to request Authorization code for provided scope
 * @param req - original Request
 * @param scope - scope requested
 * @return - endpoint with parameters
 */
function codeRequest(req, scope) {
  const codeVerifier = passPhrase();
  req.session.code_verifier = codeVerifier;

  const payload = {
    response_type: 'code',
    client_id: req.session.platform.consumerToolClientID,
    redirect_uri: 'https://piedpiper.localtunnel.me/auth_code',
    scope,
    state: passPhrase(),
    code_challenge: generateChallenge(codeVerifier),
    code_challenge_method: 'S256',
  };
  return `${req.session.platform.consumerAuthorizationURL}?${Object.keys(
    payload,
  )
    .map((key) => `${key}=${payload[key]}`)
    .join('&')}`;
}

/*
 * Check if Platform allows scores to be sent, if it does, request Authorization Code
 * @param payload - decoded Launch Request
 * @returns boolean of whether sending scores is in scope or not
 */
function prepSendScore(req) {
  if (
    req.session.decodedLaunch[
      'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'
    ]
    && req.session.decodedLaunch[
      'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'
    ].scope.includes('https://purl.imsglobal.org/spec/lti-ags/scope/score')
  ) {
    return codeRequest(
      req,
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
    );
  }
  return false;
}
/*
 * Send score to Platform. Must get appropriate access token and then send score
 * @param req
 * @param score - final score for student's work
 * @param scoreMax - maximum score allowed for work
 */
function sendScore(req, score, scoreMax) {
  // Request the access token
  const payload = {
    grant_type: 'authorization_code',
    code: req.params.code,
    client_id: req.session.platform.consumerToolClientID,
    redirect_uri: 'https://piedpiper.localtunnel.me/auth_code',
    scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
    code_verifier: req.session.code_verifier,
  };
  const base64UserPass = encode(
    `${req.session.platform.kid[0].keyID}:${req.session.platform.kid[0].privateKey}`,
    'base64',
  );

  axios
    .post(req.session.platform.consumerAccessTokenURL, payload, {
      headers: {
        Authorization: `Basic ${base64UserPass}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((result) => {
      // With access token, send score to Platform
      const scoreMessage = {
        userId: req.session.payload.sub,
        scoreGiven: score,
        scoreMaximum: scoreMax,
        timestamp: new Date(Date.now()).toJSON(),
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
      };
      axios
        .post(
          `${req.session.payload['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitem}/scores`,
          scoreMessage,
          {
            headers: {
              Authorization: `${result.token_type} ${result.access_token}`,
              'Content-Type': 'application/vnd.ims.lis.v1.score+json',
            },
          },
        )
        .then((success) => console.log(success)) // successfully posted grade
        .catch((err) => console.log(err)); // error posting grade
    })
    .catch((err) => console.log(err)); // error getting token
}

module.exports = { prepSendScore, sendScore };
