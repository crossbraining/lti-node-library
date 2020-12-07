const { keyGenerator } = require('./keyGenerator.js');

/*
 * Register a new Platform for the Tool
 * @params - all of the Platform/Tool fields shown below
 * @returns Platform object, if Platform is already registered
 */
const registerPlatform = (opt) => async ({
  /* Base url of the LMS. */
  consumerUrl,
  /* Domain name of the LMS. */
  consumerName,
  /* Client ID created from the LMS. */
  consumerToolClientID,
  /* URL that the LMS redirects to launch the tool. */
  consumerAuthorizationURL,
  /* URL that the LMS redirects to obtain an access token/login . */
  consumerAccessTokenURL,
  /* URL that the LMS redirects to launch tool . */
  consumerRedirectURI,
  // Authentication method and key for verifying messages from
  //  the platform. {method: "RSA_KEY", key:"PUBLIC KEY..."}
  consumerAuthorizationConfigMethod,
  consumerAuthorizationConfigKey,
}) => {
  if (
    !consumerUrl
    || !consumerName
    || !consumerToolClientID
    || !consumerAuthorizationURL
    || !consumerAccessTokenURL
    || !consumerRedirectURI
    || !consumerAuthorizationConfigMethod
    || !consumerAuthorizationConfigKey
  ) {
    console.error('Error: registerPlatform function is missing argument.');
  }
  // checks database for existing platform.
  const registeredPlatform = await opt.store.getPlatform(consumerUrl);
  if (!registeredPlatform) {
    const keyPairs = await keyGenerator();

    // creates/inserts platform data into database.
    const platform = await opt.store.addPlatform({
      consumerUrl,
      consumerName,
      consumerToolClientID,
      consumerAuthorizationURL,
      consumerAccessTokenURL,
      consumerRedirectURI,
      kid: keyPairs,
      consumerAuthorizationConfigMethod,
      consumerAuthorizationConfigKey,
    });

    console.log(`Platform registered at: ${consumerUrl}`);
    return platform;
  }
  return registerPlatform;
};

module.exports = registerPlatform;
