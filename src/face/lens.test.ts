import {assert, createSpySubject, setup, should, test} from 'gs-testing';
import {ElementHarness, getHarness, setupTest} from 'persona/export/testing';

import {createRenderSpec} from '../testing/test-face';

import {LENS} from './lens';
import {$lensService} from './lens-service';


const ID = createRenderSpec('steelblue');

test('@protoboard2/src/face/lens', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [LENS]});

    return {tester};
  });

  should('call LensService with show and hide on mouse enter and mouse leave', () => {
    const content = document.createElement('div');
    const element = _.tester.bootstrapElement(LENS);
    element.faceSpec = ID;
    element.appendChild(content);

    const faceId$ = createSpySubject($lensService.get(_.tester.vine).faceSpec$);

    const harness = getHarness(element, ElementHarness);
    harness.simulateMouseOver();
    harness.simulateMouseOut();

    assert(faceId$).to.emitSequence([null, ID, null]);
  });
});
