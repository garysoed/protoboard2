import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {renderCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import {D1} from '../piece/d1';
import {$getRenderSpec$} from '../render/render-component-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';

import goldens from './goldens/goldens.json';
import {SLOT, SlotState} from './slot';


test('@protoboard2/src/region/slot', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/region/goldens', goldens));

    const tester = setupTest({roots: [SLOT, D1, TEST_FACE]});

    $getRenderSpec$.get(tester.vine).next(id => {
      if (!stringType.check(id)) {
        throw new Error(`Invalid ID ${id}`);
      }
      return renderCustomElement({
        registration: D1,
        id,
        children: of([renderTestFace(id, id)]),
      });
    });

    return {tester};
  });

  should('render the contents correctly', () => {
    const stateService = $stateService.get(_.tester.vine);
    const state$ = stateService.addRoot<SlotState>({
      id: {},
      contentIds: mutableState(['red', 'green', 'blue']),
    })._();
    const element = _.tester.createElement(SLOT);
    element.state = state$;

    assert(element).to.matchSnapshot('slot__render.html');
  });

  // TODO: Test drop
});