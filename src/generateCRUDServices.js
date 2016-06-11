import Store from './Store';

export default ({
  store = new Store(),
}) => {
  const map = {
    getStore() {
      return store;
    },

    create({ params }) {
      if (Array.isArray(params)) {
        return params.map((item) => store.insert(item));
      }

      return store.insert(params);
    },

    findById({ params }) {
      return store.get(params);
    },

    findOne({ params }) {
      return store.findOne(params);
    },

    findMany({ params }) {
      return store.findMany(params);
    },

    replaceOne({ params }) {
      if (!params.id) {
        throw new Error('The id is required!');
      }

      return store.replace(params.id, params);
    },

    updateOne({ params }) {
      return store.updateOne(params.query, params.update);
    },

    updateMany({ params }) {
      return store.updateMany(params.query, params.update);
    },

    removeOne({ params }) {
      return this.store.removeOne(params);
    },

    removeMany({ params }) {
      if (!params) {
        store.clear();

        return true;
      }

      return this.store.removeMany(params);
    },
  };

  return map;
};
