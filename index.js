const createOidcResponse = require("./provider/oidc");
const tokenMaker = require("./provider/tokenGenerator");
const { platformSchema, registerPlatform } = require("./provider/registerPlatform");
const launchTool = require("./provider/launchValidation");
const { Database, mongoose } = require("./provider/mongoDB/database");

module.exports = {
  createOidcResponse,
  tokenMaker,
  platformSchema,
  registerPlatform,
  launchTool,
  Database,
  mongoose 
};
