const db = {};

module.exports = class MemoryStore {
  /**
   * Get Platform for the consumer url
   * @param consumerUrl string consumer url to find the platform for
   *
   */
  // eslint-disable-next-line class-methods-use-this
  async getPlatform(consumerUrl) {
    return db[consumerUrl];
  }

  // eslint-disable-next-line class-methods-use-this
  async getPlatformById(uuid) {
    return db[uuid];
  }

  // eslint-disable-next-line class-methods-use-this
  async addPlatform(platformObject) {
    db[platformObject.consumerUrl] = platformObject;
    db[platformObject.uuid] = platformObject;
    return db[platformObject.consumerUrl];
  }
};
