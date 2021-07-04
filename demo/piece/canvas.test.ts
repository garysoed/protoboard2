import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {_p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {flattenNode, PersonaTesterFactory} from 'persona/export/testing';

import {CanvasDemo} from './canvas';
import goldenDefault from './goldens/canvas.html';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/demo/piece/canvas', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({default: goldenDefault}));

    const tester = TESTER_FACTORY.build({
      rootCtrls: [CanvasDemo],
      rootDoc: document,
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: fakeStateService()},
      ],
    });
    const {element} = tester.createHarness(CanvasDemo);
    return {element};
  });

  should('render correctly', () => {
    assert(flattenNode(_.element)).to.matchSnapshot('default');
  });
});
