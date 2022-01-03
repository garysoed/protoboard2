import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {renderCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';

import {D1} from '../piece/d1';
import {$getRenderSpec$} from '../render/render-component-spec';
import {TEST_FACE} from '../testing/test-face';

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
        children: [
          renderCustomElement({
            registration: TEST_FACE,
            id,
            attrs: new Map([
              ['shade', id],
              ['slot', 'face-0'],
            ]),
          }),
        ],
      });
    });

    return {tester};
  });

  should('render the contents correctly', () => {
    const stateService = $stateService.get(_.tester.vine);
    const stateId = stateService.addRoot<SlotState>({
      id: {},
      contentIds: mutableState(['red', 'green', 'blue']),
    });
    const state$ = stateService._(stateId);
    const element = _.tester.createElement(SLOT);
    element.state = state$;

    assert(element).to.matchSnapshot('slot__render.html');
  });
});