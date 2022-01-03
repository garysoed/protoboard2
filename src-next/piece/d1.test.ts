import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {setupTest} from 'persona/export/testing';

import {D1} from './d1';
import goldens from './goldens/goldens.json';


test('@protoboard2/src/piece/d1', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/piece/goldens', goldens));
    const tester = setupTest({roots: [D1]});
    return {tester};
  });

  should('render the face correctly', () => {
    const face = document.createElement('div');
    face.style.height = '50px';
    face.style.width = '50px';
    face.style.backgroundColor = 'red';
    face.setAttribute('slot', 'face-0');

    const element = _.tester.createElement(D1);
    element.appendChild(face);

    assert(element).to.matchSnapshot('d1__render.html');
  });
});