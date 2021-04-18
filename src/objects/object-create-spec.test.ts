import {Vine} from 'grapevine';
import {$stateService} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {renderNode, RenderSpec} from 'persona';
import {of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {d1Spec} from '../piece/d1';

import {$createSpecEntries, $getRenderSpec} from './object-create-spec';


test('@protoboard2/objects/object-create-spec', init => {
  const _ = init(() => {
    const stateService = fakeStateService();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });
    return {vine, stateService};
  });

  test('$getRenderSpec', () => {
    should('return the render spec', () => {
      const type = 'type';
      const spec: RenderSpec = renderNode({
        node: document.createElement('div'),
        id: {},
      });
      const id = _.stateService.modify(x => x.add(d1Spec({
        type,
        payload: {},
        $rotationDeg: x.add(0),
      })));

      $createSpecEntries.get(_.vine).next([type, () => observableOf(spec)]);

      assert($getRenderSpec.get(_.vine).pipe(switchMap(fn => fn(id, _.vine))))
          .to.emitWith(spec);
    });

    should('return null if the createSpec function doesn\'t exist for the given tap', () => {
      const type = 'type';
      const id = _.stateService.modify(x => x.add(d1Spec({
        type,
        payload: {},
        $rotationDeg: x.add(0),
      })));

      assert($getRenderSpec.get(_.vine).pipe(switchMap(fn => fn(id, _.vine))))
          .to.emitWith(null);
    });
  });
});