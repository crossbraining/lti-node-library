const mongoose = require('mongoose');

/*
 * Database class to maintain and access Platform information
 */
class Database {
  static async Get(collection, platformSchema, query) {
    const Model = mongoose.model(collection, platformSchema);

    return Model.find(query)
      .catch((err) => console.log(`Error finding platform ${err}`));
  }

  static Insert(collection, platformSchema, platform) {
    const Model = mongoose.model(collection, platformSchema);

    const newPlatform = new Model(platform);
    newPlatform.save();
    return true;
  }
}

module.exports = {
  mongoose,
  Database,
};
