const { pem2jwk } = require('pem-jwk');
/*
 * Returns the public key for the clientId/platformId
 * @param req - req sent from tool
 * @returns if valid request, returns properly formated response object
 * @return if invalid request, returns array of errors with the request
 */
const getPublicKey = (opt) => async (req, res) => {
  const platform = await opt.store.getPlatformById(req.params.platformId);
  if (!platform || !platform.kid || !platform.kid.publicKey) {
    return res.status(400).json({
      error: 'invalid_request',
      errors: ['could not find platform'],
    });
  }

  const jwk = pem2jwk(platform.kid.publicKey);
  return res.json({ keys: [jwk] });
};

module.exports = getPublicKey;
