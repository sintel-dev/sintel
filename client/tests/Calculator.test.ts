import { expect } from 'chai';

import { Calculator as C } from '../src/services/helpers';

describe('calculate', function() {
  it('add', function() {
    let result = C.Sum([5, 2]);
    expect(result).equal(7);
  });

  it('substract', function() {
    let result = C.Difference(5, 2);
    expect(result).equal(3);
  });
});

