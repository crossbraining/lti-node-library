const { createOidcResponse, createUniqueString } = require('./provider/oidc');
const tokenMaker = require('./provider/tokenGenerator');
const registerPlatform = require('./provider/registerPlatform');
const { launchTool } = require('./provider/launchValidation');
const { Database, mongoose } = require('./provider/mongoDB/database');

module.exports = {
  createOidcResponse,
  tokenMaker,
  registerPlatform,
  launchTool,
  Database,
  mongoose,
  createUniqueString,
};
