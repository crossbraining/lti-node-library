const { createOidcResponse } = require('./oidc');
const tokenMaker = require('./tokenGenerator');
const registerPlatform = require('./registerPlatform');
const { launchTool } = require('./launchValidation');
const MemoryStore = require('../store/MemoryStore');
const getPublicKey = require('./getPublicKey');

const validateStore = (store) => {
  if (!store.getPlatform || !store.addPlatform) {
    throw new Error('Store should implement getPlatform and addPlatform');
  }
};

module.exports = (options = {}) => {
  const opt = {
    store: options.store || new MemoryStore(),
  };

  validateStore(opt.store);

  return {
    createOidcResponse: createOidcResponse(opt),
    tokenMaker: tokenMaker(opt),
    registerPlatform: registerPlatform(opt),
    launchTool: launchTool(opt),
    getPublicKey: getPublicKey(opt),
  };
};
