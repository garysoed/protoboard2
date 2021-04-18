import {$stateService} from 'grapevine';
import {assert, run, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {attributeOut, host, stringParser} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

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
    const isMultifaced$ = new ReplaySubject<PieceSpec<IsMultifaced>>(1);

    run(renderMultifaced(isMultifaced$, $._.slot, context));

    return {el, isMultifaced$, stateService};
  });

  should('render the face name correctly', () => {
    const $currentFaceIndex = _.stateService.modify(x => x.add(2));
    _.isMultifaced$.next(fakePieceSpec({payload: {$currentFaceIndex}}));

    assert(_.el.getAttribute('name')).to.equal('face-2');
  });
});
