const { createOidcResponse, createUniqueString } = require('./src/oidc');
const tokenMaker = require('./src/tokenGenerator');
const registerPlatform = require('./src/registerPlatform');
const { launchTool } = require('./src/launchValidation');
const { Database, mongoose } = require('./src/mongoDB/database');

// module.exports = (options) => {
//   // const opt = {
//   //   store: options.store ,
//   // };
//   return {
//     createOidcResponse,
//     tokenMaker,
//     registerPlatform,
//     launchTool,
//     Database,
//     mongoose,
//     createUniqueString,
//   };
// };

module.exports = {
  createOidcResponse,
  tokenMaker,
  registerPlatform,
  launchTool,
  Database,
  mongoose,
  createUniqueString,
};
