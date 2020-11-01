import { $stateService } from 'mask';
import { ReplaySubject } from 'rxjs';
import { StateService } from 'gs-tools/export/state';
import { assert, run, should, test } from 'gs-testing';
import { attributeOut, host, stringParser } from 'persona';
import { createFakeContext } from 'persona/export/testing';

import { IsMultifaced } from '../payload/is-multifaced';

import { renderMultifaced } from './render-multifaced';

test('@protoboard2/render/render-multifaced', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const $ = host({slot: attributeOut('name', stringParser())});
    const isMultifaced$ = new ReplaySubject<IsMultifaced|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    run(renderMultifaced(isMultifaced$, $._.slot, context));

    return {el, isMultifaced$, stateService};
  });

  should('render the face name correctly', () => {
    const $currentFaceIndex = _.stateService.add(2);
    _.isMultifaced$.next({$currentFaceIndex});

    assert(_.el.getAttribute('name')).to.equal('face-2');
  });
});
