import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {_p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import goldenDefault from './goldens/slot.html';
import {SlotDemo} from './slot';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/demo/region/slot', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({default: goldenDefault}));

    const tester = TESTER_FACTORY.build({
      rootCtrls: [SlotDemo],
      rootDoc: document,
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: fakeStateService()},
      ],
    });
    const el = tester.createElement(SlotDemo);
    return {el};
  });

  should('render correctly', () => {
    assert(_.el.flattenContent()).to.matchSnapshot('default');
  });
});
