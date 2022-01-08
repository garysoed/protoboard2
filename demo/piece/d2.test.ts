import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {_p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {D2Demo} from './d2';
import goldenDefault from './goldens/d2.html';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/demo/piece/d2', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({default: goldenDefault}));

    const tester = TESTER_FACTORY.build({
      rootCtrls: [D2Demo],
      rootDoc: document,
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: fakeStateService()},
      ],
    });
    const {element} = tester.createHarness(D2Demo);
    return {element};
  });

  should('render correctly', () => {
    assert(_.element).to.matchSnapshot('default');
  });
});
