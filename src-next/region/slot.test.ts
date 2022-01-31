import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {mutableState} from 'gs-tools/export/state';
import {stringType} from 'gs-types';
import {renderCustomElement} from 'persona';
import {setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import {D1, d1State} from '../piece/d1';
import {registerComponentRenderSpec} from '../renderspec/render-component-spec';
import {registerFaceRenderSpec} from '../renderspec/render-face-spec';
import {renderTestFace, TEST_FACE} from '../testing/test-face';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {SLOT, SlotState} from './slot';


test('@protoboard2/src/region/slot', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/region/goldens', goldens));

    const tester = setupTest({roots: [SLOT, D1, TEST_FACE], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    registerFaceRenderSpec(tester.vine, renderTestFace);
    registerComponentRenderSpec(tester.vine, id => {
      if (!stringType.check(id)) {
        throw new Error(`Invalid ID ${id}`);
      }
      return renderCustomElement({
        registration: D1,
        id,
        inputs: {
          state: of($stateService.get(tester.vine).addRoot(d1State(id, [id]))._()),
        },
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