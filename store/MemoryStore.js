const db = {};

module.exports = class MemoryStore {
  /**
   * Get Platform for the consumer url
   * @param consumerUrl string consumer url to find the platform for
   *
   */
  async getPlatform(consumerUrl) {
    return db[consumerUrl];
  }

  async addPlatform(platformObject) {
    db[platformObject.consumerUrl] = platformObject;
    console.log(require('util').inspect(db, { depth: null, colors: true }));
    return db[platformObject.consumerUrl];
  }
};
