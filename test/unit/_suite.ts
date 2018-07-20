import { expect } from 'chai';
import * as suite from 'mocha-suite';
import * as sinon from 'sinon';

export interface Utils {
  sinon: sinon.SinonStatic;
  expect: Chai.ExpectStatic;
  spy: sinon.SinonSpyStatic;
  stub: sinon.SinonStubStatic;
}

export default suite<Utils, any>((tests) => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  tests({
    sinon,
    expect,
    spy: (...args) => (<any>sandbox.spy)(...args),
    stub: (...args) => (<any>sandbox.stub)(...args)
  });
});
