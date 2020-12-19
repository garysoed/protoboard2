import {assert, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {renderNode, RenderSpec} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {d1Spec} from '../piece/d1';

import {$createSpecMap, $getRenderSpec} from './object-create-spec';


test('@protoboard2/objects/object-create-spec', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const context = createFakeContext({shadowRoot: el.attachShadow({mode: 'open'})});
    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);
    return {context, stateService};
  });

  test('$getRenderSpec', () => {
    should('return the render spec', () => {
      const type = 'type';
      const spec: RenderSpec = renderNode({
        node: document.createElement('div'),
        id: {},
      });
      const id = _.stateService.add(d1Spec({
        type,
        payload: {},
        $rotationDeg: _.stateService.add(0),
      }));

      $createSpecMap.set(_.context.vine, () => new Map([[type, () => observableOf(spec)]]));

      assert($getRenderSpec.get(_.context.vine).pipe(switchMap(fn => fn(id, _.context))))
          .to.emitWith(spec);
    });

    should('return null if the createSpec function doesn\'t exist for the given tap', () => {
      const type = 'type';
      const id = _.stateService.add(d1Spec({
        type,
        payload: {},
        $rotationDeg: _.stateService.add(0),
      }));

      assert($getRenderSpec.get(_.context.vine).pipe(switchMap(fn => fn(id, _.context))))
          .to.emitWith(null);
    });
  });
});