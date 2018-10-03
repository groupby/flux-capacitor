import area from '../../../../../src/core/reducers/data/area';
import { DEFAULT_AREA } from '../../../../../src/core/store/data-defaults';
import suite from '../../../_suite';

suite('area', ({ expect }) => {

  it('should return state', () => {
    const newArea = 'myArea';

    const reducer = area(newArea);

    expect(reducer).to.eq(newArea);
  });

  it('should return the default state', () => {
    const reducer = area();

    expect(reducer).to.eq(DEFAULT_AREA);
  });
});
