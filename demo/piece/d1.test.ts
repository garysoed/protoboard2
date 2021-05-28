import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {_p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {D1Demo} from './d1';
import goldenDefault from './goldens/d1.html';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/demo/piece/d1', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({default: goldenDefault}));

    const tester = TESTER_FACTORY.build({
      rootCtrls: [D1Demo],
      rootDoc: document,
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    const el = tester.createElement(D1Demo);
    return {el};
  });

  should.only('render correctly', () => {
    assert(_.el.flattenContent()).to.matchSnapshot('default');
  });
});
