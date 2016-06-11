import _ from 'lodash';

export default class {
  constructor(engine = new Map()) {
    this.counter = 1;
    this.engine = engine;
  }

  insert(record) {
    const id = this.counter++;
    this.engine.set(id, record);

    return this.get(id);
  }

  get(id) {
    if (!this.engine.has(id)) {
      return undefined;
    }

    return {
      ...this.engine.get(id),
      id,
    };
  }

  findOne(match = {}) {
    for (const item of this.engine) {
      const [id, record] = item;
      if (_.isMatch(record, match)) {
        return {
          id,
          ...record,
        };
      }
    }

    return undefined;
  }

  findMany(match = {}) {
    const items = [];
    this.engine.forEach((record, id) => {
      if (_.isMatch(record, match)) {
        items.push({
          id,
          ...record,
        });
      }
    });

    return items;
  }

  replace(id, data) {
    if (!this.engine.has(id)) {
      throw new Error(`Couldn't find item with id ${id}.`);
    }

    this.engine.set(id, _.omit(data, ['id']));

    return this.get(id);
  }

  updateOne(match = {}, update) {
    const item = this.findOne(match);
    this.engine.set(item.id, {
      ...item,
      ...update,
    });

    return this.get(item.id);
  }

  updateMany(match = {}, update) {
    const items = this.findMany(match);
    items.forEach((item) => {
      Object.assign(item, {
        update,
      });

      this.engine.set(item.id, item);
    });

    return items;
  }

  removeOne(match = {}) {
    const item = this.findOne(match);
    if (item) {
      this.engine.delete(item.id);
      return item;
    }

    return undefined;
  }

  removeMany(match = {}) {
    const items = this.findMany(match);
    items.forEach(({ id }) => {
      this.engine.delete(id);
    });

    return items;
  }

  clear() {
    this.engine.clear();

    return this;
  }

  toJSON() {
    return Array.from(this.engine.entries()).reduce(
      (acc, [id, item]) => ({
        ...acc,
        [id]: item,
      }), {}
    );
  }
}
