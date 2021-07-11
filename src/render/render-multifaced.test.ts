import {$stateService} from 'grapevine';
import {assert, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {attributeOut, host, stringParser} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {of} from 'rxjs';

import {IsMultifaced} from '../payload/is-multifaced';

import {renderMultifaced} from './render-multifaced';


test('@protoboard2/render/render-multifaced', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const context = createFakeContext({
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
      shadowRoot,
    });
    const $ = host({slot: attributeOut('name', stringParser())});
    const isMultifaced = stateService.addRoot<IsMultifaced>({
      currentFaceIndex: mutableState(0),
    });

    run(renderMultifaced(stateService._(isMultifaced), $._.slot, context));

    return {el, isMultifaced, stateService};
  });

  should('render the face name correctly', () => {
    run(of(2).pipe(_.stateService._(_.isMultifaced).$('currentFaceIndex').set()));

    assert(_.el.getAttribute('name')).to.equal('face-2');
  });
});
