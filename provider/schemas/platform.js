const { Schema } = require('mongoose');

const PlatformSchema = new Schema({
  consumerUrl: String,
  consumerName: String,
  consumerToolClientID: String,
  consumerAuthorizationURL: String,
  consumerAccessTokenURL: String,
  consumerRedirectURI: String,
  kid: Object,
  consumerAuthorizationconfig: {
    method: String,
    key: String,
  },
});

module.exports = PlatformSchema;
