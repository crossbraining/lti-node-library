const { Database } = require('./mongoDB/Database.js');
const { keyGenerator } = require('./keyGenerator.js');
const schemas = require('./schemas');

/*
 * Register a new Platform for the Tool
 * @params - all of the Platform/Tool fields shown below
 * @returns Platform object, if Platform is already registered
 */
const registerPlatform = async (
  consumerUrl /* Base url of the LMS. */,
  consumerName /* Domain name of the LMS. */,
  consumerToolClientID /* Client ID created from the LMS. */,
  consumerAuthorizationURL /* URL that the LMS redirects to launch the tool. */,
  consumerAccessTokenURL /* URL that the LMS redirects to obtain an access token/login . */,
  consumerRedirectURI /* URL that the LMS redirects to launch tool . */,
  // Authentication method and key for verifying messages from
  //  the platform. {method: "RSA_KEY", key:"PUBLIC KEY..."}
  consumerAuthorizationconfig,
) => {
  if (
    !consumerUrl
    || !consumerName
    || !consumerToolClientID
    || !consumerAuthorizationURL
    || !consumerAccessTokenURL
    || !consumerRedirectURI
    || !consumerAuthorizationconfig
  ) {
    console.log('Error: registerPlatform function is missing argument.');
  }
  // checks database for existing platform.
  return Database.Get('platforms', schemas.PlatformSchema, { consumerUrl })
    .then((registeringPlatform) => {
      if (!registeringPlatform || !registeringPlatform.length) {
        const keyPairs = keyGenerator();

        // creates/inserts platform data into database.
        Database.Insert('platforms', schemas.PlatformSchema, {
          consumerUrl,
          consumerName,
          consumerToolClientID,
          consumerAuthorizationURL,
          consumerAccessTokenURL,
          consumerRedirectURI,
          kid: keyPairs,
          consumerAuthorizationconfig,
        });
        return console.log(`Platform registered at: ${consumerUrl}`);
      }
      return registeringPlatform;
    })
    .catch((err) => console.log(`Error finding platform: ${err}`));
};

module.exports = registerPlatform;
