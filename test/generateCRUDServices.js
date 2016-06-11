import { expect } from 'chai';
import { createEventDispatcher } from 'octobus.js';
import { generateCRUDServices } from '../src';
import Store from '../src/Store';

describe('generateCRUDServices', () => {
  let dispatcher;
  let store;

  beforeEach(() => {
    store = new Store();
    dispatcher = createEventDispatcher();

    dispatcher.subscribeMap('entity.User', generateCRUDServices({ store }));
  });

  it('should create a new record', () => (
    dispatcher.dispatch('entity.User.create', {
      firstName: 'Victor',
    }).then((result) => {
      expect(result.id).to.exist();
      expect(result).to.deep.equal({
        firstName: 'Victor',
        id: 1,
      });
    })
  ));

  it('should create multiple records', () => (
    dispatcher.dispatch('entity.User.create', [{
      firstName: 'John1',
    }, {
      firstName: 'John2',
    }, {
      firstName: 'John3',
    }]).then((result) => {
      expect(result).to.have.lengthOf(3);
    })
  ));

  it('should find a record by id', () => (
    dispatcher.dispatch('entity.User.create', {
      firstName: 'Victor',
    }).then(({ id }) => (
      dispatcher.dispatch('entity.User.findById', id).then((user) => {
        expect(user.firstName).to.equal('Victor');
      })
    ))
  ));

  it('should find a record by filters', () => (
    dispatcher.dispatch('entity.User.create', [{
      firstName: 'John1',
      lastName: 'Doe',
      age: 22,
      role: 'admin',
    }, {
      firstName: 'John2',
      lastName: 'Donovan',
      age: 22,
      role: 'superadmin',
    }, {
      firstName: 'John3',
      lastName: 'Doe',
      age: 23,
      role: 'admin',
    }]).then(() => (
      dispatcher.dispatch('entity.User.findMany', {
        lastName: 'Doe',
        role: 'admin',
      }).then((users) => {
        expect(users).to.have.lengthOf(2);
        expect(users[0].age).to.equal(22);
        expect(users[1].firstName).to.equal('John3');
      })
    ))
  ));

  it('should find multiple records by filters', () => (
    dispatcher.dispatch('entity.User.create', [{
      firstName: 'John1',
      age: 21,
    }, {
      firstName: 'John2',
      age: 22,
    }, {
      firstName: 'John3',
      age: 23,
    }]).then(() => (
      dispatcher.dispatch('entity.User.findOne', {
        age: 22,
      }).then((user) => {
        expect(user.firstName).to.equal('John2');
      })
    ))
  ));

  it('should replace a record', () => (
    dispatcher.dispatch('entity.User.create', {
      firstName: 'Victor',
    }).then((createdUser) => (
      dispatcher.dispatch('entity.User.replaceOne', {
        ...createdUser,
        firstName: 'John',
      }).then((user) => {
        expect(user.firstName).to.equal('John');
      })
    ))
  ));

  it('should update one record', () => (
    dispatcher.dispatch('entity.User.create', {
      firstName: 'John',
      lastName: 'Doe',
    }).then((createdUser) => (
      dispatcher.dispatch('entity.User.updateOne', {
        query: {
          firstName: 'John',
        },
        update: {
          lastName: 'Donovan',
        },
      }).then(() => (
        dispatcher.dispatch('entity.User.findById', createdUser.id).then((foundUser) => {
          expect(foundUser).to.exist();
          expect(foundUser.firstName).to.equal('John');
          expect(foundUser.lastName).to.equal('Donovan');
        })
      ))
    ))
  ));

  it('should add timestamps', () => {
    dispatcher.subscribe(/entity\.User\.(create|replaceOne)/, ({ params, next }) => {
      const nextParams = { ...params };

      if (!nextParams.id) {
        nextParams.createdAt = new Date();
      } else {
        nextParams.updatedAt = new Date();
      }

      return next(nextParams);
    });

    return dispatcher.dispatch('entity.User.create', {
      firstName: 'John',
      lastName: 'Doe',
    }).then((user) => {
      expect(user.createdAt).to.exist();
      expect(user.createdAt).to.be.an.instanceof(Date);

      dispatcher.dispatch('entity.User.replaceOne', {
        ...user,
        lastName: 'Donovan',
      }).then((replacedUser) => {
        expect(replacedUser.updatedAt).to.exist();
        expect(replacedUser.updatedAt).to.be.an.instanceof(Date);
      });
    });
  });
});
