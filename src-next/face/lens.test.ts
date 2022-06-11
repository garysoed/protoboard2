import {assert, createSpySubject, should, test} from 'gs-testing';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';

import {faceId} from '../id/face-id';

import {LENS} from './lens';
import {$lensService} from './lens-service';


const ID = faceId({});

test('@protoboard2/src/face/lens', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [LENS]});

    return {tester};
  });

  should('call LensService with show and hide on mouse enter and mouse leave', () => {
    const content = document.createElement('div');
    const element = _.tester.createElement(LENS);
    element.faceId = ID;
    element.appendChild(content);

    const faceId$ = createSpySubject($lensService.get(_.tester.vine).faceId$);

    const harness = getHarness(element, ElementHarness);
    harness.simulateMouseOver();
    harness.simulateMouseOut();

    assert(faceId$).to.emitSequence([null, ID, null]);
  });
});
