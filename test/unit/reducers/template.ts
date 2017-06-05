import { ActionCreator, Actions, Store } from '../../../../src/flux/core';
import template from '../../../../src/flux/core/reducers/template';
import suite from '../../_suite';

suite('template', ({ expect }) => {
  let actions: ActionCreator;
  const state: Store.Template = {
    name: 'idk',
    rule: 'semantish',
    zones: {
      mainZone: {
        name: 'Starting template',
        type: 'content',
        content: 'Here\'s a template',
      },
    },
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateTemplate()', () => {
    it('should update state on RECEIVE_TEMPLATE', () => {
      const newState = {
        name: 'idk2',
        rule: 'semantish2',
        zones: {
          mainZone: {
            name: 'Starting template2',
            type: 'content',
            content: 'Here\'s a template2',
          },
        },
      };

      const reducer = template(state, { type: Actions.RECEIVE_TEMPLATE, template: newState });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = template(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
